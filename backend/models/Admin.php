<?php
/**
 * Admin Model
 * Handles admin user authentication and management
 */

class Admin {
    private $conn;
    private $table = 'admin_users';

    public $id;
    public $username;
    public $email;
    public $password;
    public $full_name;
    public $role;
    public $status;
    public $last_login;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Login admin user
     */
    public function login($username, $password) {
        $query = "SELECT * FROM {$this->table} WHERE (username = :username OR email = :email) AND status = 'active' LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $username); // Can login with email or username
        $stmt->execute();

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($password, $admin['password'])) {
            // Update last login
            $this->updateLastLogin($admin['id']);

            // Remove password from response
            unset($admin['password']);

            return $admin;
        }

        return false;
    }

    /**
     * Update last login timestamp
     */
    private function updateLastLogin($adminId) {
        $query = "UPDATE {$this->table} SET last_login = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $adminId, PDO::PARAM_INT);
        $stmt->execute();
    }

    /**
     * Get admin by ID
     */
    public function getById($id) {
        $query = "SELECT id, username, email, full_name, role, status, last_login, created_at
                  FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all admins
     */
    public function getAll() {
        $query = "SELECT id, username, email, full_name, role, status, last_login, created_at
                  FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create new admin
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (username, email, password, full_name, role, status)
                  VALUES (:username, :email, :password, :full_name, :role, :status)";

        $stmt = $this->conn->prepare($query);

        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);

        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':status', $data['status']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update admin
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
                  username = :username,
                  email = :email,
                  full_name = :full_name,
                  role = :role,
                  status = :status";

        // Add password to update if provided
        if (isset($data['password']) && !empty($data['password'])) {
            $query .= ", password = :password";
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':status', $data['status']);

        if (isset($data['password']) && !empty($data['password'])) {
            $hashedPassword = password_hash($data['password'], PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);
            $stmt->bindParam(':password', $hashedPassword);
        }

        return $stmt->execute();
    }

    /**
     * Delete admin
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Check if username exists
     */
    public function usernameExists($username, $excludeId = null) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE username = :username";

        if ($excludeId) {
            $query .= " AND id != :id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);

        if ($excludeId) {
            $stmt->bindParam(':id', $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] > 0;
    }

    /**
     * Check if email exists
     */
    public function emailExists($email, $excludeId = null) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = :email";

        if ($excludeId) {
            $query .= " AND id != :id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);

        if ($excludeId) {
            $stmt->bindParam(':id', $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] > 0;
    }
}
