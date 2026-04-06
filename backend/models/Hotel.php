<?php
/**
 * Hotel Model
 * Handles all hotel-related database operations
 */

class Hotel {
    private $conn;
    private $table = 'hotels';
    private $imagesTable = 'hotel_images';
    private $roomTypesTable = 'hotel_room_types';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all hotels with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['destination']) && !empty($filters['destination'])) {
            $query .= " AND destination = :destination";
            $params[':destination'] = $filters['destination'];
        }

        if (isset($filters['stars']) && is_numeric($filters['stars'])) {
            $query .= " AND stars = :stars";
            $params[':stars'] = (int)$filters['stars'];
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

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['rating', 'created_at', 'stars', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query .= " ORDER BY {$sortBy} {$sortOrder}";
        }

        // Pagination
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

    /**
     * Get total count with filters
     */
    public function getCount($filters = []) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['destination']) && !empty($filters['destination'])) {
            $query .= " AND destination = :destination";
            $params[':destination'] = $filters['destination'];
        }

        if (isset($filters['stars']) && is_numeric($filters['stars'])) {
            $query .= " AND stars = :stars";
            $params[':stars'] = (int)$filters['stars'];
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
     * Get hotel by ID (with images and room types)
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($hotel) {
            $hotel['images'] = $this->getImages($id);
            $hotel['room_types'] = $this->getRoomTypes($id);
        }

        return $hotel;
    }

    /**
     * Get hotel by slug
     */
    public function getBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();

        $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($hotel) {
            $hotel['images'] = $this->getImages($hotel['id']);
            $hotel['room_types'] = $this->getRoomTypes($hotel['id']);
        }

        return $hotel;
    }

    /**
     * Create new hotel
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            name, slug, destination, stars, description, short_description,
            rating, review_count, main_image, amenities,
            check_in_time, check_out_time, address,
            contact_phone, contact_email, website,
            is_featured, is_active, created_by
        ) VALUES (
            :name, :slug, :destination, :stars, :description, :short_description,
            :rating, :review_count, :main_image, :amenities,
            :check_in_time, :check_out_time, :address,
            :contact_phone, :contact_email, :website,
            :is_featured, :is_active, :created_by
        )";

        $stmt = $this->conn->prepare($query);

        $slug = !empty($data['slug']) ? $data['slug'] : generateSlug($data['name']);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':stars', $data['stars'], PDO::PARAM_INT);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':rating', $data['rating']);
        $stmt->bindParam(':review_count', $data['review_count'], PDO::PARAM_INT);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':amenities', $data['amenities']);
        $stmt->bindParam(':check_in_time', $data['check_in_time']);
        $stmt->bindParam(':check_out_time', $data['check_out_time']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':contact_phone', $data['contact_phone']);
        $stmt->bindParam(':contact_email', $data['contact_email']);
        $stmt->bindParam(':website', $data['website']);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':created_by', $data['created_by'], PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update hotel
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            name = :name,
            slug = :slug,
            destination = :destination,
            stars = :stars,
            description = :description,
            short_description = :short_description,
            rating = :rating,
            review_count = :review_count,
            main_image = :main_image,
            amenities = :amenities,
            check_in_time = :check_in_time,
            check_out_time = :check_out_time,
            address = :address,
            contact_phone = :contact_phone,
            contact_email = :contact_email,
            website = :website,
            is_featured = :is_featured,
            is_active = :is_active
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':destination', $data['destination']);
        $stmt->bindParam(':stars', $data['stars'], PDO::PARAM_INT);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':short_description', $data['short_description']);
        $stmt->bindParam(':rating', $data['rating']);
        $stmt->bindParam(':review_count', $data['review_count'], PDO::PARAM_INT);
        $stmt->bindParam(':main_image', $data['main_image']);
        $stmt->bindParam(':amenities', $data['amenities']);
        $stmt->bindParam(':check_in_time', $data['check_in_time']);
        $stmt->bindParam(':check_out_time', $data['check_out_time']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':contact_phone', $data['contact_phone']);
        $stmt->bindParam(':contact_email', $data['contact_email']);
        $stmt->bindParam(':website', $data['website']);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Delete hotel
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

    // =====================
    // Hotel Images
    // =====================

    /**
     * Get images for a hotel
     */
    public function getImages($hotelId) {
        $query = "SELECT * FROM {$this->imagesTable} WHERE hotel_id = :hotel_id ORDER BY category, sort_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Save images for a hotel (replace all)
     */
    public function saveImages($hotelId, $images) {
        // Delete existing images
        $deleteQuery = "DELETE FROM {$this->imagesTable} WHERE hotel_id = :hotel_id";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
        $deleteStmt->execute();

        // Insert new images
        if (!empty($images)) {
            $insertQuery = "INSERT INTO {$this->imagesTable} (hotel_id, image_url, category, caption, sort_order) VALUES (:hotel_id, :image_url, :category, :caption, :sort_order)";
            $insertStmt = $this->conn->prepare($insertQuery);

            foreach ($images as $index => $image) {
                $insertStmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
                $insertStmt->bindParam(':image_url', $image['image_url']);
                $insertStmt->bindParam(':category', $image['category']);
                $caption = isset($image['caption']) ? $image['caption'] : null;
                $insertStmt->bindParam(':caption', $caption);
                $sortOrder = isset($image['sort_order']) ? (int)$image['sort_order'] : $index;
                $insertStmt->bindParam(':sort_order', $sortOrder, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }

        return true;
    }

    // =====================
    // Hotel Room Types
    // =====================

    /**
     * Get room types for a hotel
     */
    public function getRoomTypes($hotelId) {
        $query = "SELECT * FROM {$this->roomTypesTable} WHERE hotel_id = :hotel_id ORDER BY sort_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Save room types for a hotel (replace all)
     */
    public function saveRoomTypes($hotelId, $roomTypes) {
        // Delete existing room types
        $deleteQuery = "DELETE FROM {$this->roomTypesTable} WHERE hotel_id = :hotel_id";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
        $deleteStmt->execute();

        // Insert new room types
        if (!empty($roomTypes)) {
            $insertQuery = "INSERT INTO {$this->roomTypesTable} (hotel_id, name, description, max_guests, bed_type, room_size, amenities, sort_order, is_active) VALUES (:hotel_id, :name, :description, :max_guests, :bed_type, :room_size, :amenities, :sort_order, :is_active)";
            $insertStmt = $this->conn->prepare($insertQuery);

            foreach ($roomTypes as $index => $room) {
                $insertStmt->bindParam(':hotel_id', $hotelId, PDO::PARAM_INT);
                $insertStmt->bindParam(':name', $room['name']);
                $description = isset($room['description']) ? $room['description'] : null;
                $insertStmt->bindParam(':description', $description);
                $maxGuests = isset($room['max_guests']) ? (int)$room['max_guests'] : 2;
                $insertStmt->bindParam(':max_guests', $maxGuests, PDO::PARAM_INT);
                $bedType = isset($room['bed_type']) ? $room['bed_type'] : null;
                $insertStmt->bindParam(':bed_type', $bedType);
                $roomSize = isset($room['room_size']) ? $room['room_size'] : null;
                $insertStmt->bindParam(':room_size', $roomSize);
                $amenities = isset($room['amenities']) ? $room['amenities'] : null;
                $insertStmt->bindParam(':amenities', $amenities);
                $sortOrder = isset($room['sort_order']) ? (int)$room['sort_order'] : $index;
                $insertStmt->bindParam(':sort_order', $sortOrder, PDO::PARAM_INT);
                $isActive = isset($room['is_active']) ? (int)$room['is_active'] : 1;
                $insertStmt->bindParam(':is_active', $isActive, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }

        return true;
    }
}
