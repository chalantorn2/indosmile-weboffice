<?php
/**
 * ContactMessage Model
 * Handles all contact message database operations
 */

class ContactMessage {
    private $conn;
    private $table = 'contact_messages';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all messages with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR email LIKE :search OR subject LIKE :search OR message LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'created_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['created_at', 'status', 'name'];
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
            $query .= " AND (name LIKE :search OR email LIKE :search OR subject LIKE :search)";
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
     * Get message by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new contact message
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            name, email, subject, message, status, ip_address, user_agent
        ) VALUES (
            :name, :email, :subject, :message, 'unread', :ip_address, :user_agent
        )";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':subject', $data['subject']);
        $stmt->bindParam(':message', $data['message']);
        $stmt->bindParam(':ip_address', $data['ip_address']);
        $stmt->bindParam(':user_agent', $data['user_agent']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update message status
     */
    public function updateStatus($id, $status, $adminId = null) {
        $query = "UPDATE {$this->table} SET status = :status";

        if ($status === 'replied' && $adminId) {
            $query .= ", replied_by = :admin_id, replied_at = NOW()";
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);

        if ($status === 'replied' && $adminId) {
            $stmt->bindParam(':admin_id', $adminId, PDO::PARAM_INT);
        }

        return $stmt->execute();
    }

    /**
     * Update admin notes
     */
    public function updateNotes($id, $notes) {
        $query = "UPDATE {$this->table} SET admin_notes = :notes WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':notes', $notes);
        return $stmt->execute();
    }

    /**
     * Delete message
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Get message statistics
     */
    public function getStats() {
        $query = "SELECT
            COUNT(*) as total_messages,
            SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread_count,
            SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
            SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count,
            SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count
            FROM {$this->table}";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Mark message as read
     */
    public function markAsRead($id) {
        return $this->updateStatus($id, 'read');
    }
}
