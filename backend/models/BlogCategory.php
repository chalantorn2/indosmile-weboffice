<?php
/**
 * BlogCategory Model
 * Handles all blog category-related database operations
 */

class BlogCategory {
    private $conn;
    private $table = 'blog_categories';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all categories (optionally with post counts)
     */
    public function getAll($includePostCount = true, $activeOnly = false) {
        if ($includePostCount) {
            $query = "SELECT c.*, COUNT(p.id) as post_count 
                      FROM {$this->table} c 
                      LEFT JOIN blog_posts p ON c.id = p.category_id AND p.status = 'published'
                      WHERE 1=1";
        } else {
            $query = "SELECT * FROM {$this->table} WHERE 1=1";
        }

        if ($activeOnly) {
            $query .= " AND c.is_active = 1";
        }

        if ($includePostCount) {
            $query .= " GROUP BY c.id";
        }

        $query .= " ORDER BY sort_order ASC, name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get category by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get category by slug
     */
    public function getBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new category
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, slug, description, color, sort_order, is_active)
                  VALUES (:name, :slug, :description, :color, :sort_order, :is_active)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':color', $data['color']);
        $stmt->bindParam(':sort_order', $data['sort_order'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Update category
     */
    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
            name = :name,
            slug = :slug,
            description = :description,
            color = :color,
            sort_order = :sort_order,
            is_active = :is_active
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':color', $data['color']);
        $stmt->bindParam(':sort_order', $data['sort_order'], PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Delete category
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
