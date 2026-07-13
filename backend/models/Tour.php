<?php
/**
 * Tour Model
 * Handles all tour-related database operations
 */

class Tour {
    private $conn;
    private $table = 'tours';

    // Tour properties
    public $id;
    public $name;
    public $slug;
    public $destination;
    public $type;
    public $description;
    public $short_description;
    public $duration_days;
    public $duration_nights;
    public $duration_label;
    public $adult_price;
    public $child_price;
    public $currency;
    public $rating;
    public $review_count;
    public $is_featured;
    public $is_active;
    public $max_participants;
    public $min_participants;
    public $difficulty_level;
    public $main_image;
    public $gallery_images;
    public $highlights;
    public $included;
    public $not_included;
    public $itinerary;
    public $terms_conditions;
    public $cancellation_policy;
    // One Day Trip specific fields
    public $pickup_time;
    public $pickup_location;
    public $dropoff_time;
    public $dropoff_location;
    public $departure_times;
    public $meal_info;
    public $transfer_info;
    public $what_to_bring;
    public $important_notes;
    public $created_by;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all tours with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        // Apply filters
        if (isset($filters['type']) && !empty($filters['type'])) {
            $query .= " AND type = :type";
            $params[':type'] = $filters['type'];
        }

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
            $query .= " AND (name LIKE :search OR destination LIKE :search OR description LIKE :search)";
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

        if (isset($filters['duration']) && is_numeric($filters['duration'])) {
            $query .= " AND duration_days = :duration";
            $params[':duration'] = $filters['duration'];
        }

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['adult_price', 'rating', 'created_at', 'duration_days', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query .= " ORDER BY {$sortBy} {$sortOrder}";
        }

        // Pagination
        if (isset($filters['limit']) && isset($filters['offset'])) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->conn->prepare($query);

        // Bind parameters
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

    /**
     * Get total count with filters
     */
    public function getCount($filters = []) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE 1=1";
        $params = [];

        // Apply same filters as getAll
        if (isset($filters['type']) && !empty($filters['type'])) {
            $query .= " AND type = :type";
            $params[':type'] = $filters['type'];
        }

        if (isset($filters['is_active'])) {
            $query .= " AND is_active = :is_active";
            $params[':is_active'] = $filters['is_active'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR destination LIKE :search OR description LIKE :search)";
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

    /**
     * Get tour by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get tour by slug
     */
    public function getBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new tour
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            name, slug, destination, type, description, short_description,
            duration_days, duration_nights, duration_label, adult_price, child_price,
            park_fee_included, park_fee_adult, park_fee_child,
            currency, rating, review_count, is_featured, is_active,
            max_participants, min_participants, difficulty_level,
            main_image, gallery_images, highlights, included, not_included,
            itinerary, terms_conditions, cancellation_policy,
            pickup_time, pickup_location, dropoff_time, dropoff_location,
            departure_times, meal_info, transfer_info, what_to_bring, important_notes,
            created_by, source_tour_id, source_supplier_name
        ) VALUES (
            :name, :slug, :destination, :type, :description, :short_description,
            :duration_days, :duration_nights, :duration_label, :adult_price, :child_price,
            :park_fee_included, :park_fee_adult, :park_fee_child,
            :currency, :rating, :review_count, :is_featured, :is_active,
            :max_participants, :min_participants, :difficulty_level,
            :main_image, :gallery_images, :highlights, :included, :not_included,
            :itinerary, :terms_conditions, :cancellation_policy,
            :pickup_time, :pickup_location, :dropoff_time, :dropoff_location,
            :departure_times, :meal_info, :transfer_info, :what_to_bring, :important_notes,
            :created_by, :source_tour_id, :source_supplier_name
        )";

        $stmt = $this->conn->prepare($query);

        // Generate slug if not provided
        $slug = !empty($data['slug']) ? $data['slug'] : generateSlug($data['name']);

        // Bind parameters
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':duration_days', $data['duration_days'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_nights', $data['duration_nights'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_label', $data['duration_label']);
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
        $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':highlights', $data['highlights']);
        $stmt->bindParam(':included', $data['included']);
        $stmt->bindParam(':not_included', $data['not_included']);
        $stmt->bindParam(':itinerary', $data['itinerary']);
        $stmt->bindParam(':terms_conditions', $data['terms_conditions']);
        $stmt->bindParam(':cancellation_policy', $data['cancellation_policy']);
        $stmt->bindParam(':pickup_time', $data['pickup_time']);
        $stmt->bindParam(':pickup_location', $data['pickup_location']);
        $stmt->bindParam(':dropoff_time', $data['dropoff_time']);
        $stmt->bindParam(':dropoff_location', $data['dropoff_location']);
        $stmt->bindParam(':departure_times', $data['departure_times']);
        $stmt->bindParam(':meal_info', $data['meal_info']);
        $stmt->bindParam(':transfer_info', $data['transfer_info']);
        $stmt->bindParam(':what_to_bring', $data['what_to_bring']);
        $stmt->bindParam(':important_notes', $data['important_notes']);
        $stmt->bindParam(':created_by', $data['created_by'], PDO::PARAM_INT);
        $stmt->bindParam(':source_tour_id', $data['source_tour_id'], PDO::PARAM_INT);
        $stmt->bindParam(':source_supplier_name', $data['source_supplier_name']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Find a tour previously imported from the given Contract Rate source tour.
     */
    public function getBySourceTourId($sourceTourId) {
        $query = "SELECT * FROM {$this->table} WHERE source_tour_id = :source_tour_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':source_tour_id', $sourceTourId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update tour
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            name = :name,
            slug = :slug,
            destination = :destination,
            type = :type,
            description = :description,
            short_description = :short_description,
            duration_days = :duration_days,
            duration_nights = :duration_nights,
            duration_label = :duration_label,
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
            difficulty_level = :difficulty_level,
            main_image = :main_image,
            gallery_images = :gallery_images,
            highlights = :highlights,
            included = :included,
            not_included = :not_included,
            itinerary = :itinerary,
            terms_conditions = :terms_conditions,
            cancellation_policy = :cancellation_policy,
            pickup_time = :pickup_time,
            pickup_location = :pickup_location,
            dropoff_time = :dropoff_time,
            dropoff_location = :dropoff_location,
            departure_times = :departure_times,
            meal_info = :meal_info,
            transfer_info = :transfer_info,
            what_to_bring = :what_to_bring,
            important_notes = :important_notes
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':duration_days', $data['duration_days'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_nights', $data['duration_nights'], PDO::PARAM_INT);
        $stmt->bindParam(':duration_label', $data['duration_label']);
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
        $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':highlights', $data['highlights']);
        $stmt->bindParam(':included', $data['included']);
        $stmt->bindParam(':not_included', $data['not_included']);
        $stmt->bindParam(':itinerary', $data['itinerary']);
        $stmt->bindParam(':terms_conditions', $data['terms_conditions']);
        $stmt->bindParam(':cancellation_policy', $data['cancellation_policy']);
        $stmt->bindParam(':pickup_time', $data['pickup_time']);
        $stmt->bindParam(':pickup_location', $data['pickup_location']);
        $stmt->bindParam(':dropoff_time', $data['dropoff_time']);
        $stmt->bindParam(':dropoff_location', $data['dropoff_location']);
        $stmt->bindParam(':departure_times', $data['departure_times']);
        $stmt->bindParam(':meal_info', $data['meal_info']);
        $stmt->bindParam(':transfer_info', $data['transfer_info']);
        $stmt->bindParam(':what_to_bring', $data['what_to_bring']);
        $stmt->bindParam(':important_notes', $data['important_notes']);

        return $stmt->execute();
    }

    /**
     * Delete tour
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured($id) {
        $query = "UPDATE {$this->table} SET is_featured = NOT is_featured WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id) {
        $query = "UPDATE {$this->table} SET is_active = NOT is_active WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}
