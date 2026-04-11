<?php
/**
 * TransferBooking Model
 * Handles database operations for Transfer Bookings
 */
class TransferBooking {
    private $conn;
    private $table = 'transfer_bookings';

    public function __construct($db) {
        $this->conn = $db;
        $this->initTable();
    }

    /**
     * Initialize table if not exists
     */
    private function initTable() {
        $query = "CREATE TABLE IF NOT EXISTS `{$this->table}` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
            `customer_name` VARCHAR(150) NOT NULL,
            `customer_email` VARCHAR(150) NOT NULL,
            `customer_phone` VARCHAR(50) NOT NULL,
            `trip_type` ENUM('one-way','return') DEFAULT 'one-way',
            `pickup_location` VARCHAR(200) NOT NULL,
            `dropoff_location` VARCHAR(200) NOT NULL,
            `pickup_date` DATE NOT NULL,
            `pickup_time` TIME NOT NULL,
            `return_date` DATE NULL,
            `return_time` TIME NULL,
            `adults` INT(11) DEFAULT 1,
            `children` INT(11) DEFAULT 0,
            `infants` INT(11) DEFAULT 0,
            `special_requests` TEXT NULL,
            `status` ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
            `admin_notes` TEXT NULL,
            `ip_address` VARCHAR(50) NULL,
            `user_agent` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_booking_ref` (`booking_reference`),
            INDEX `idx_status` (`status`),
            INDEX `idx_pickup_date` (`pickup_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->conn->exec($query);
    }

    /**
     * Create new transfer booking
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            booking_reference, customer_name, customer_email, customer_phone,
            trip_type, pickup_location, dropoff_location, pickup_date, pickup_time,
            return_date, return_time, adults, children, infants, special_requests,
            status, ip_address, user_agent
        ) VALUES (
            :booking_reference, :customer_name, :customer_email, :customer_phone,
            :trip_type, :pickup_location, :dropoff_location, :pickup_date, :pickup_time,
            :return_date, :return_time, :adults, :children, :infants, :special_requests,
            :status, :ip_address, :user_agent
        )";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':booking_reference', $data['booking_reference']);
        $stmt->bindParam(':customer_name', $data['customer_name']);
        $stmt->bindParam(':customer_email', $data['customer_email']);
        $stmt->bindParam(':customer_phone', $data['customer_phone']);
        $stmt->bindParam(':trip_type', $data['trip_type']);
        $stmt->bindParam(':pickup_location', $data['pickup_location']);
        $stmt->bindParam(':dropoff_location', $data['dropoff_location']);
        $stmt->bindParam(':pickup_date', $data['pickup_date']);
        $stmt->bindParam(':pickup_time', $data['pickup_time']);
        $stmt->bindParam(':return_date', $data['return_date']);
        $stmt->bindParam(':return_time', $data['return_time']);
        $stmt->bindParam(':adults', $data['adults'], PDO::PARAM_INT);
        $stmt->bindParam(':children', $data['children'], PDO::PARAM_INT);
        $stmt->bindParam(':infants', $data['infants'], PDO::PARAM_INT);
        $stmt->bindParam(':special_requests', $data['special_requests']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':ip_address', $data['ip_address']);
        $stmt->bindParam(':user_agent', $data['user_agent']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Get transfer booking by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get transfer booking by reference
     */
    public function getByReference($reference) {
        $query = "SELECT * FROM {$this->table} WHERE booking_reference = :reference LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':reference', $reference);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all transfer bookings with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (booking_reference LIKE :search OR customer_name LIKE :search OR customer_email LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['date_from']) && !empty($filters['date_from'])) {
            $query .= " AND pickup_date >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }

        if (isset($filters['date_to']) && !empty($filters['date_to'])) {
            $query .= " AND pickup_date <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['created_at', 'pickup_date', 'status'];
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

        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (booking_reference LIKE :search OR customer_name LIKE :search OR customer_email LIKE :search)";
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
     * Update transfer booking
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            status = :status,
            admin_notes = :admin_notes
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':admin_notes', $data['admin_notes']);

        return $stmt->execute();
    }

    /**
     * Get booking statistics
     */
    public function getStats() {
        $query = "SELECT
            COUNT(*) as total_bookings,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
            FROM {$this->table}";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
