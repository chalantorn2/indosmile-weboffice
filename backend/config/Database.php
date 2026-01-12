<?php
/**
 * Database Connection Class
 * Handles MySQL database connections using PDO
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $charset;
    private $conn;

    public function __construct() {
        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
        $this->port = DB_PORT;
        $this->charset = DB_CHARSET;
    }

    /**
     * Get database connection
     * @return PDO|null
     */
    public function connect() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset}"
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }

        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function disconnect() {
        $this->conn = null;
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->conn->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->conn->rollBack();
    }

    /**
     * Get last insert ID
     */
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }
}
