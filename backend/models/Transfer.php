<?php
/**
 * Transfer Model
 * Handles database operations for Transfers
 */
class Transfer {
    private $conn;
    private $table_name = "transfers";

    // Transfer properties
    public $id;
    public $origin;
    public $destination;
    public $vehicle_name;
    public $max_passengers;
    public $max_luggage;
    public $price;
    public $image_url;
    public $description;
    public $is_active;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
        $this->initTable();
    }

    /**
     * Initialize table if not exists and seed dummy data
     */
    private function initTable() {
        $query = "CREATE TABLE IF NOT EXISTS `" . $this->table_name . "` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `origin` VARCHAR(150) NOT NULL,
            `destination` VARCHAR(150) NOT NULL,
            `vehicle_name` VARCHAR(150) NOT NULL,
            `max_passengers` INT(11) DEFAULT 1,
            `max_luggage` INT(11) DEFAULT 2,
            `price` DECIMAL(10, 2) NOT NULL,
            `image_url` TEXT NULL,
            `description` TEXT NULL,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_origin_dest` (`origin`, `destination`),
            INDEX `idx_is_active` (`is_active`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->conn->exec($query);

        // Add max_luggage column if not exists (migration for existing tables)
        try {
            $this->conn->exec("ALTER TABLE `" . $this->table_name . "` ADD COLUMN `max_luggage` INT(11) DEFAULT 2 AFTER `max_passengers`");
        } catch (PDOException $e) {
            // Column already exists, ignore
        }

        // Check if empty, then seed
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM " . $this->table_name);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            $insert = "INSERT INTO `" . $this->table_name . "` (`origin`, `destination`, `vehicle_name`, `max_passengers`, `max_luggage`, `price`, `image_url`, `description`) VALUES
            ('Phuket Airport (HKT)', 'Patong Beach', 'Standard Car', 3, 2, 800.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'Comfortable sedan for up to 3 passengers with 2 luggage.'),
            ('Phuket Airport (HKT)', 'Patong Beach', 'VIP Minivan', 9, 6, 1200.00, 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=800&q=80', 'Spacious minivan suitable for families or groups.'),
            ('Phuket Airport (HKT)', 'Karon Beach', 'Standard Car', 3, 2, 900.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'Direct transfer to Karon Beach.'),
            ('Phuket Airport (HKT)', 'Karon Beach', 'VIP Minivan', 9, 6, 1400.00, 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=800&q=80', 'Comfortable and spacious minivan for groups.'),
            ('Patong Beach', 'Phuket Old Town', 'Standard Car', 3, 2, 600.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'City transfer.'),
            ('Patong Beach', 'Phuket Old Town', 'VIP Minivan', 9, 6, 900.00, 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=800&q=80', 'City transfer for groups.')";
            $this->conn->exec($insert);
        }
    }

    /**
     * Get all transfers
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        if (isset($filters['is_active']) && $filters['is_active'] !== null) {
            $query .= " AND is_active = " . (int)$filters['is_active'];
        }
        
        $query .= " ORDER BY origin ASC, destination ASC, price ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single transfer by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get distinct origins
     */
    public function getOrigins() {
        $query = "SELECT DISTINCT origin FROM " . $this->table_name . " WHERE is_active = 1 ORDER BY origin ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Get distinct destinations by origin
     */
    public function getDestinationsByOrigin($origin) {
        $query = "SELECT DISTINCT destination FROM " . $this->table_name . " WHERE origin = :origin AND is_active = 1 ORDER BY destination ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':origin', $origin);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Get vehicles by origin and destination
     */
    public function getVehiclesByRoute($origin, $destination) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE origin = :origin AND destination = :destination AND is_active = 1 
                  ORDER BY price ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':origin', $origin);
        $stmt->bindParam(':destination', $destination);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create new transfer
     */
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
            (origin, destination, vehicle_name, max_passengers, max_luggage, price, image_url, description, is_active)
            VALUES (:origin, :destination, :vehicle_name, :max_passengers, :max_luggage, :price, :image_url, :description, :is_active)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':origin', $data['origin']);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':vehicle_name', $data['vehicle_name']);
        $stmt->bindParam(':max_passengers', $data['max_passengers']);
        $stmt->bindValue(':max_luggage', isset($data['max_luggage']) ? (int)$data['max_luggage'] : 2, PDO::PARAM_INT);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':image_url', $data['image_url']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindValue(':is_active', isset($data['is_active']) ? $data['is_active'] : 1, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Update transfer
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " SET
                  origin = :origin,
                  destination = :destination,
                  vehicle_name = :vehicle_name,
                  max_passengers = :max_passengers,
                  max_luggage = :max_luggage,
                  price = :price,
                  image_url = :image_url,
                  description = :description,
                  is_active = :is_active
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':origin', $data['origin']);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':vehicle_name', $data['vehicle_name']);
        $stmt->bindParam(':max_passengers', $data['max_passengers']);
        $stmt->bindValue(':max_luggage', isset($data['max_luggage']) ? (int)$data['max_luggage'] : 2, PDO::PARAM_INT);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':image_url', $data['image_url']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }

    /**
     * Delete transfer
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        return $stmt->execute();
    }
}
