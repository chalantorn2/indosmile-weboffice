<?php
/**
 * TransferRoute Model
 * Pairs of locations with per-vehicle prices.
 *
 * Routes are stored bidirectionally as a single row with origin_id < destination_id,
 * so (A,B) and (B,A) collapse to one record (price is identical in both directions).
 */
class TransferRoute
{
    private $conn;
    private $table = 'transfer_routes';
    private $pricesTable = 'transfer_route_prices';
    private $locationsTable = 'transfer_locations';
    private $vehiclesTable = 'transfer_vehicles';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Get all routes with origin/destination names and price entries.
     */
    public function getAll($filters = [])
    {
        $query = "
            SELECT
                r.id,
                r.origin_id,
                r.destination_id,
                r.is_active,
                r.created_at,
                r.updated_at,
                lo.name AS origin_name,
                ld.name AS destination_name
            FROM {$this->table} r
            INNER JOIN {$this->locationsTable} lo ON lo.id = r.origin_id
            INNER JOIN {$this->locationsTable} ld ON ld.id = r.destination_id
            WHERE 1=1
        ";

        if (isset($filters['is_active']) && $filters['is_active'] !== null && $filters['is_active'] !== '') {
            $query .= " AND r.is_active = " . (int)$filters['is_active'];
        }

        $query .= " ORDER BY lo.name ASC, ld.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach prices
        foreach ($routes as &$route) {
            $route['prices'] = $this->getPricesByRoute($route['id']);
        }
        return $routes;
    }

    public function getById($id)
    {
        $stmt = $this->conn->prepare("
            SELECT
                r.id,
                r.origin_id,
                r.destination_id,
                r.is_active,
                r.created_at,
                r.updated_at,
                lo.name AS origin_name,
                ld.name AS destination_name
            FROM {$this->table} r
            INNER JOIN {$this->locationsTable} lo ON lo.id = r.origin_id
            INNER JOIN {$this->locationsTable} ld ON ld.id = r.destination_id
            WHERE r.id = :id
            LIMIT 1
        ");
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();
        $route = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($route) {
            $route['prices'] = $this->getPricesByRoute($route['id']);
        }
        return $route;
    }

    /**
     * Find route by location pair (bidirectional).
     */
    public function findByPair($locA, $locB)
    {
        list($lo, $hi) = $this->normalizePair($locA, $locB);
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE origin_id = :lo AND destination_id = :hi LIMIT 1"
        );
        $stmt->bindValue(':lo', $lo, PDO::PARAM_INT);
        $stmt->bindValue(':hi', $hi, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create route + price entries.
     * $data['prices'] = [['vehicle_id' => 1, 'price' => 800], ...]
     */
    public function create($data)
    {
        list($lo, $hi) = $this->normalizePair($data['origin_id'], $data['destination_id']);

        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO {$this->table} (origin_id, destination_id, is_active)
                 VALUES (:origin_id, :destination_id, :is_active)"
            );
            $stmt->bindValue(':origin_id', $lo, PDO::PARAM_INT);
            $stmt->bindValue(':destination_id', $hi, PDO::PARAM_INT);
            $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
            $stmt->execute();

            $routeId = $this->conn->lastInsertId();
            $this->savePrices($routeId, isset($data['prices']) ? $data['prices'] : []);

            $this->conn->commit();
            return $routeId;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function update($id, $data)
    {
        list($lo, $hi) = $this->normalizePair($data['origin_id'], $data['destination_id']);

        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare(
                "UPDATE {$this->table}
                 SET origin_id = :origin_id, destination_id = :destination_id, is_active = :is_active
                 WHERE id = :id"
            );
            $stmt->bindValue(':origin_id', $lo, PDO::PARAM_INT);
            $stmt->bindValue(':destination_id', $hi, PDO::PARAM_INT);
            $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
            $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
            $stmt->execute();

            $this->savePrices($id, isset($data['prices']) ? $data['prices'] : []);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        // route_prices cascade-deletes via FK
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Get distinct active locations that participate in at least one active route.
     * Used by frontend "Pick-up" dropdown.
     */
    public function getActiveOriginLocations()
    {
        $stmt = $this->conn->prepare("
            SELECT DISTINCT l.name
            FROM {$this->locationsTable} l
            INNER JOIN {$this->table} r
                ON (r.origin_id = l.id OR r.destination_id = l.id)
            WHERE l.is_active = 1
              AND r.is_active = 1
              AND EXISTS (SELECT 1 FROM {$this->pricesTable} p WHERE p.route_id = r.id)
            ORDER BY l.name ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Given an origin location name, return all destination location names
     * reachable via an active route with at least one price.
     */
    public function getDestinationsByOrigin($originName)
    {
        $stmt = $this->conn->prepare("
            SELECT DISTINCT
                CASE WHEN lo.name = :origin1 THEN ld.name ELSE lo.name END AS destination
            FROM {$this->table} r
            INNER JOIN {$this->locationsTable} lo ON lo.id = r.origin_id
            INNER JOIN {$this->locationsTable} ld ON ld.id = r.destination_id
            WHERE r.is_active = 1
              AND lo.is_active = 1
              AND ld.is_active = 1
              AND EXISTS (SELECT 1 FROM {$this->pricesTable} p WHERE p.route_id = r.id)
              AND (lo.name = :origin2 OR ld.name = :origin3)
            ORDER BY destination ASC
        ");
        $stmt->bindValue(':origin1', $originName);
        $stmt->bindValue(':origin2', $originName);
        $stmt->bindValue(':origin3', $originName);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Given an origin/destination location pair, return all vehicles + prices for that route.
     * Returns array of: vehicle_id, vehicle_name, max_passengers, max_luggage, image_url, description, price.
     */
    public function getVehiclesForLocationPair($originName, $destinationName)
    {
        $route = $this->findRouteByLocationNames($originName, $destinationName);
        if (!$route) {
            return [];
        }

        $stmt = $this->conn->prepare("
            SELECT
                v.id AS vehicle_id,
                v.name AS vehicle_name,
                v.max_passengers,
                v.max_luggage,
                v.image_url,
                v.description,
                p.price
            FROM {$this->pricesTable} p
            INNER JOIN {$this->vehiclesTable} v ON v.id = p.vehicle_id
            WHERE p.route_id = :route_id
              AND v.is_active = 1
            ORDER BY v.sort_order ASC, p.price ASC
        ");
        $stmt->bindValue(':route_id', (int)$route['id'], PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────

    private function getPricesByRoute($routeId)
    {
        $stmt = $this->conn->prepare("
            SELECT
                p.id,
                p.vehicle_id,
                p.price,
                v.name AS vehicle_name,
                v.max_passengers,
                v.max_luggage,
                v.image_url
            FROM {$this->pricesTable} p
            INNER JOIN {$this->vehiclesTable} v ON v.id = p.vehicle_id
            WHERE p.route_id = :route_id
            ORDER BY v.sort_order ASC, v.name ASC
        ");
        $stmt->bindValue(':route_id', (int)$routeId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Replace all prices for a route with the supplied list.
     */
    private function savePrices($routeId, $prices)
    {
        $del = $this->conn->prepare("DELETE FROM {$this->pricesTable} WHERE route_id = :route_id");
        $del->bindValue(':route_id', (int)$routeId, PDO::PARAM_INT);
        $del->execute();

        if (empty($prices) || !is_array($prices)) {
            return;
        }

        $ins = $this->conn->prepare(
            "INSERT INTO {$this->pricesTable} (route_id, vehicle_id, price)
             VALUES (:route_id, :vehicle_id, :price)"
        );

        foreach ($prices as $entry) {
            if (!isset($entry['vehicle_id']) || !isset($entry['price'])) continue;
            $price = (float)$entry['price'];
            if ($price <= 0) continue;
            $ins->bindValue(':route_id', (int)$routeId, PDO::PARAM_INT);
            $ins->bindValue(':vehicle_id', (int)$entry['vehicle_id'], PDO::PARAM_INT);
            $ins->bindValue(':price', $price);
            $ins->execute();
        }
    }

    private function normalizePair($a, $b)
    {
        $a = (int)$a;
        $b = (int)$b;
        if ($a === $b) {
            throw new Exception('Origin and destination must be different locations');
        }
        return $a < $b ? [$a, $b] : [$b, $a];
    }

    private function findRouteByLocationNames($originName, $destinationName)
    {
        $stmt = $this->conn->prepare("
            SELECT r.id
            FROM {$this->table} r
            INNER JOIN {$this->locationsTable} lo ON lo.id = r.origin_id
            INNER JOIN {$this->locationsTable} ld ON ld.id = r.destination_id
            WHERE r.is_active = 1
              AND (
                  (lo.name = :a AND ld.name = :b)
                  OR (lo.name = :b2 AND ld.name = :a2)
              )
            LIMIT 1
        ");
        $stmt->bindValue(':a', $originName);
        $stmt->bindValue(':b', $destinationName);
        $stmt->bindValue(':a2', $originName);
        $stmt->bindValue(':b2', $destinationName);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
