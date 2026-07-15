<?php
/**
 * Booking Model
 * Handles all booking-related database operations
 */

class Booking {
    private $conn;
    private $table = 'bookings';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all bookings with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT b.*, t.name as tour_name, t.destination, t.type as tour_type
                  FROM {$this->table} b
                  LEFT JOIN tours t ON b.tour_id = t.id
                  WHERE 1=1";
        $params = [];

        // Apply filters
        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND b.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['payment_status']) && !empty($filters['payment_status'])) {
            $query .= " AND b.payment_status = :payment_status";
            $params[':payment_status'] = $filters['payment_status'];
        }

        if (isset($filters['tour_id']) && !empty($filters['tour_id'])) {
            $query .= " AND b.tour_id = :tour_id";
            $params[':tour_id'] = $filters['tour_id'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (b.booking_reference LIKE :search OR b.customer_name LIKE :search OR b.customer_email LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['date_from']) && !empty($filters['date_from'])) {
            $query .= " AND b.travel_date >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }

        if (isset($filters['date_to']) && !empty($filters['date_to'])) {
            $query .= " AND b.travel_date <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['created_at', 'travel_date', 'total_price', 'status'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query .= " ORDER BY b.{$sortBy} {$sortOrder}";
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
     * Get booking by ID
     */
    public function getById($id) {
        $query = "SELECT b.*, t.name as tour_name, t.destination, t.type as tour_type, t.adult_price as tour_price
                  FROM {$this->table} b
                  LEFT JOIN tours t ON b.tour_id = t.id
                  WHERE b.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get booking by reference
     */
    public function getByReference($reference) {
        $query = "SELECT b.*, t.name as tour_name, t.destination, t.type as tour_type
                  FROM {$this->table} b
                  LEFT JOIN tours t ON b.tour_id = t.id
                  WHERE b.booking_reference = :reference LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':reference', $reference);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new booking
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            tour_id, booking_reference, customer_name, customer_email, customer_phone,
            travel_date, number_of_guests, adults, children, special_requests,
            total_price, currency, status, payment_status, ip_address, user_agent
        ) VALUES (
            :tour_id, :booking_reference, :customer_name, :customer_email, :customer_phone,
            :travel_date, :number_of_guests, :adults, :children, :special_requests,
            :total_price, :currency, :status, :payment_status, :ip_address, :user_agent
        )";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':tour_id', $data['tour_id'], PDO::PARAM_INT);
        $stmt->bindParam(':booking_reference', $data['booking_reference']);
        $stmt->bindParam(':customer_name', $data['customer_name']);
        $stmt->bindParam(':customer_email', $data['customer_email']);
        $stmt->bindParam(':customer_phone', $data['customer_phone']);
        $stmt->bindParam(':travel_date', $data['travel_date']);
        $stmt->bindParam(':number_of_guests', $data['number_of_guests'], PDO::PARAM_INT);
        $stmt->bindParam(':adults', $data['adults'], PDO::PARAM_INT);
        $stmt->bindParam(':children', $data['children'], PDO::PARAM_INT);
        $stmt->bindParam(':special_requests', $data['special_requests']);
        $stmt->bindParam(':total_price', $data['total_price']);
        $stmt->bindParam(':currency', $data['currency']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':payment_status', $data['payment_status']);
        $stmt->bindParam(':ip_address', $data['ip_address']);
        $stmt->bindParam(':user_agent', $data['user_agent']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update booking
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            status = :status,
            payment_status = :payment_status,
            payment_method = :payment_method,
            payment_date = :payment_date,
            notes = :notes
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':payment_status', $data['payment_status']);
        $stmt->bindParam(':payment_method', $data['payment_method']);
        $stmt->bindParam(':payment_date', $data['payment_date']);
        $stmt->bindParam(':notes', $data['notes']);

        return $stmt->execute();
    }

    /**
     * Confirm booking
     */
    public function confirm($id, $adminId) {
        $query = "UPDATE {$this->table} SET
            status = 'confirmed',
            confirmed_by = :admin_id,
            confirmed_at = NOW()
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':admin_id', $adminId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Cancel booking
     */
    public function cancel($id, $reason = null) {
        $query = "UPDATE {$this->table} SET
            status = 'cancelled',
            cancelled_at = NOW(),
            cancellation_reason = :reason
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':reason', $reason);

        return $stmt->execute();
    }

    /**
     * Attach the Stripe Checkout Session the customer was just sent to.
     * Overwrites any previous session: an abandoned checkout is simply replaced.
     */
    public function setPaymentSession($id, $sessionId) {
        $query = "UPDATE {$this->table} SET payment_reference = :session_id WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':session_id', $sessionId);

        return $stmt->execute();
    }

    /**
     * Mark a booking paid. Called only from the Stripe webhook.
     *
     * The `payment_status = 'unpaid'` guard makes this idempotent — Stripe retries
     * webhooks, and a duplicate delivery must not re-trigger the receipt email.
     * Returns true only for the delivery that actually flipped the row.
     */
    public function markPaid($id, $paymentIntentId, $method = 'stripe') {
        $query = "UPDATE {$this->table} SET
            payment_status = 'paid',
            payment_method = :method,
            payment_date = NOW(),
            payment_intent_id = :payment_intent_id
            WHERE id = :id AND payment_status = 'unpaid'";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':method', $method);
        $stmt->bindParam(':payment_intent_id', $paymentIntentId);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Get booking statistics
     */
    public function getStats() {
        $query = "SELECT
            COUNT(*) as total_bookings,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
            SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) as total_revenue,
            SUM(CASE WHEN payment_status = 'unpaid' THEN total_price ELSE 0 END) as pending_revenue
            FROM {$this->table}";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
