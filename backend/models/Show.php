<?php
/**
 * Show Model
 * Handles all show-related database operations (Shows & Adventures)
 */

class Show {
    private $conn;
    private $table = 'shows';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all shows with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['destination']) && !empty($filters['destination'])) {
            $query .= " AND destination = :destination";
            $params[':destination'] = $filters['destination'];
        }

        if (isset($filters['is_featured'])) {
            $query .= " AND is_featured = :is_featured";
            $params[':is_featured'] = $filters['is_featured'];
        }

        if (isset($filters['is_active'])) {
            $query .= " AND is_active = :is_active";
            $params[':is_active'] = $filters['is_active'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR destination LIKE :search OR description LIKE :search OR venue LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['min_adult_price']) && is_numeric($filters['min_adult_price'])) {
            $query .= " AND adult_price >= :min_adult_price";
            $params[':min_adult_price'] = $filters['min_adult_price'];
        }

        if (isset($filters['max_adult_price']) && is_numeric($filters['max_adult_price'])) {
            $query .= " AND adult_price <= :max_adult_price";
            $params[':max_adult_price'] = $filters['max_adult_price'];
        }

        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['adult_price', 'rating', 'created_at', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query .= " ORDER BY {$sortBy} {$sortOrder}";
        }

        if (isset($filters['limit']) && isset($filters['offset'])) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        if (isset($filters['limit']) && isset($filters['offset'])) {
            $stmt->bindValue(':limit', (int)$filters['limit'], PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$filters['offset'], PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCount($filters = []) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['is_active'])) {
            $query .= " AND is_active = :is_active";
            $params[':is_active'] = $filters['is_active'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR destination LIKE :search OR description LIKE :search OR venue LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }

    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            name, slug, destination, venue, description, short_description,
            duration_days, duration_nights, duration_label,
            net_adult_price, net_child_price, adult_price, child_price,
            park_fee_included, park_fee_adult, park_fee_child,
            currency, rating, review_count, is_featured, is_active,
            max_participants, min_participants,
            main_image, gallery_images, highlights, included, not_included,
            show_times, seat_zones, operational_days,
            pickup_time, pickup_location, dropoff_time, dropoff_location,
            meal_info, transfer_info, what_to_bring, important_notes,
            terms_conditions, cancellation_policy, created_by,
            source_tour_id, source_supplier_name
        ) VALUES (
            :name, :slug, :destination, :venue, :description, :short_description,
            :duration_days, :duration_nights, :duration_label,
            :net_adult_price, :net_child_price, :adult_price, :child_price,
            :park_fee_included, :park_fee_adult, :park_fee_child,
            :currency, :rating, :review_count, :is_featured, :is_active,
            :max_participants, :min_participants,
            :main_image, :gallery_images, :highlights, :included, :not_included,
            :show_times, :seat_zones, :operational_days,
            :pickup_time, :pickup_location, :dropoff_time, :dropoff_location,
            :meal_info, :transfer_info, :what_to_bring, :important_notes,
            :terms_conditions, :cancellation_policy, :created_by,
            :source_tour_id, :source_supplier_name
        )";

        $stmt = $this->conn->prepare($query);
        $slug = !empty($data['slug']) ? $data['slug'] : generateSlug($data['name']);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':venue', $data['venue']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':duration_days', $data['duration_days'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_nights', $data['duration_nights'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_label', $data['duration_label']);
        $stmt->bindParam(':net_adult_price', $data['net_adult_price']);
        $stmt->bindParam(':net_child_price', $data['net_child_price']);
        $stmt->bindParam(':adult_price', $data['adult_price']);
        $stmt->bindParam(':child_price', $data['child_price']);
        $stmt->bindParam(':park_fee_included', $data['park_fee_included'], PDO::PARAM_INT);
        $stmt->bindParam(':park_fee_adult', $data['park_fee_adult']);
        $stmt->bindParam(':park_fee_child', $data['park_fee_child']);
        $stmt->bindParam(':currency', $data['currency']);
        $stmt->bindParam(':rating', $data['rating']);
        $stmt->bindParam(':review_count', $data['review_count'], PDO::PARAM_INT);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':max_participants', $data['max_participants'], PDO::PARAM_INT);
        $stmt->bindParam(':min_participants', $data['min_participants'], PDO::PARAM_INT);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':highlights', $data['highlights']);
        $stmt->bindParam(':included', $data['included']);
        $stmt->bindParam(':not_included', $data['not_included']);
        $stmt->bindParam(':show_times', $data['show_times']);
        $stmt->bindParam(':seat_zones', $data['seat_zones']);
        $stmt->bindParam(':operational_days', $data['operational_days']);
        $stmt->bindParam(':pickup_time', $data['pickup_time']);
        $stmt->bindParam(':pickup_location', $data['pickup_location']);
        $stmt->bindParam(':dropoff_time', $data['dropoff_time']);
        $stmt->bindParam(':dropoff_location', $data['dropoff_location']);
        $stmt->bindParam(':meal_info', $data['meal_info']);
        $stmt->bindParam(':transfer_info', $data['transfer_info']);
        $stmt->bindParam(':what_to_bring', $data['what_to_bring']);
        $stmt->bindParam(':important_notes', $data['important_notes']);
        $stmt->bindParam(':terms_conditions', $data['terms_conditions']);
        $stmt->bindParam(':cancellation_policy', $data['cancellation_policy']);
        $stmt->bindParam(':created_by', $data['created_by'], PDO::PARAM_INT);
        $stmt->bindParam(':source_tour_id', $data['source_tour_id'], PDO::PARAM_INT);
        $stmt->bindParam(':source_supplier_name', $data['source_supplier_name']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Find a show previously imported from the given Contract Rate source tour.
     */
    public function getBySourceTourId($sourceTourId) {
        $query = "SELECT * FROM {$this->table} WHERE source_tour_id = :source_tour_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':source_tour_id', $sourceTourId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Record every Contract Rate source row a combined show was imported from.
     * $sources: array of ['source_tour_id' => int, 'source_supplier_name' => ?string].
     */
    public function addSources($showId, $sources) {
        $query = "INSERT INTO show_sources (show_id, source_tour_id, source_supplier_name)
                  VALUES (:show_id, :source_tour_id, :source_supplier_name)";
        $stmt = $this->conn->prepare($query);
        foreach ($sources as $s) {
            $stmt->execute([
                ':show_id' => (int)$showId,
                ':source_tour_id' => (int)$s['source_tour_id'],
                ':source_supplier_name' => $s['source_supplier_name'] ?? null,
            ]);
        }
    }

    /**
     * Return the id of a show already imported from any of the given source tour
     * ids — checking both the single-column link and the multi-source link table —
     * or null if none of them has been imported yet.
     */
    public function findBySourceTourIds($sourceTourIds) {
        $ids = array_values(array_unique(array_map('intval', $sourceTourIds)));
        if (empty($ids)) {
            return null;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $query = "SELECT id FROM {$this->table} WHERE source_tour_id IN ($placeholders)
                  UNION
                  SELECT show_id AS id FROM show_sources WHERE source_tour_id IN ($placeholders)
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array_merge($ids, $ids));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['id'] : null;
    }

    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            name = :name,
            slug = :slug,
            destination = :destination,
            venue = :venue,
            description = :description,
            short_description = :short_description,
            duration_days = :duration_days,
            duration_nights = :duration_nights,
            duration_label = :duration_label,
            net_adult_price = :net_adult_price,
            net_child_price = :net_child_price,
            adult_price = :adult_price,
            child_price = :child_price,
            park_fee_included = :park_fee_included,
            park_fee_adult = :park_fee_adult,
            park_fee_child = :park_fee_child,
            currency = :currency,
            rating = :rating,
            review_count = :review_count,
            is_featured = :is_featured,
            is_active = :is_active,
            max_participants = :max_participants,
            min_participants = :min_participants,
            main_image = :main_image,
            gallery_images = :gallery_images,
            highlights = :highlights,
            included = :included,
            not_included = :not_included,
            show_times = :show_times,
            seat_zones = :seat_zones,
            operational_days = :operational_days,
            pickup_time = :pickup_time,
            pickup_location = :pickup_location,
            dropoff_time = :dropoff_time,
            dropoff_location = :dropoff_location,
            meal_info = :meal_info,
            transfer_info = :transfer_info,
            what_to_bring = :what_to_bring,
            important_notes = :important_notes,
            terms_conditions = :terms_conditions,
            cancellation_policy = :cancellation_policy
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':venue', $data['venue']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':duration_days', $data['duration_days'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_nights', $data['duration_nights'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_label', $data['duration_label']);
        $stmt->bindParam(':net_adult_price', $data['net_adult_price']);
        $stmt->bindParam(':net_child_price', $data['net_child_price']);
        $stmt->bindParam(':adult_price', $data['adult_price']);
        $stmt->bindParam(':child_price', $data['child_price']);
        $stmt->bindParam(':park_fee_included', $data['park_fee_included'], PDO::PARAM_INT);
        $stmt->bindParam(':park_fee_adult', $data['park_fee_adult']);
        $stmt->bindParam(':park_fee_child', $data['park_fee_child']);
        $stmt->bindParam(':currency', $data['currency']);
        $stmt->bindParam(':rating', $data['rating']);
        $stmt->bindParam(':review_count', $data['review_count'], PDO::PARAM_INT);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':max_participants', $data['max_participants'], PDO::PARAM_INT);
        $stmt->bindParam(':min_participants', $data['min_participants'], PDO::PARAM_INT);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':highlights', $data['highlights']);
        $stmt->bindParam(':included', $data['included']);
        $stmt->bindParam(':not_included', $data['not_included']);
        $stmt->bindParam(':show_times', $data['show_times']);
        $stmt->bindParam(':seat_zones', $data['seat_zones']);
        $stmt->bindParam(':operational_days', $data['operational_days']);
        $stmt->bindParam(':pickup_time', $data['pickup_time']);
        $stmt->bindParam(':pickup_location', $data['pickup_location']);
        $stmt->bindParam(':dropoff_time', $data['dropoff_time']);
        $stmt->bindParam(':dropoff_location', $data['dropoff_location']);
        $stmt->bindParam(':meal_info', $data['meal_info']);
        $stmt->bindParam(':transfer_info', $data['transfer_info']);
        $stmt->bindParam(':what_to_bring', $data['what_to_bring']);
        $stmt->bindParam(':important_notes', $data['important_notes']);
        $stmt->bindParam(':terms_conditions', $data['terms_conditions']);
        $stmt->bindParam(':cancellation_policy', $data['cancellation_policy']);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
