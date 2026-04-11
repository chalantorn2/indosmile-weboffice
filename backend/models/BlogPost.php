<?php
/**
 * BlogPost Model
 * Handles all blog post-related database operations
 */

class BlogPost {
    private $conn;
    private $table = 'blog_posts';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all posts with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
                  FROM {$this->table} p
                  LEFT JOIN blog_categories c ON p.category_id = c.id
                  WHERE 1=1";
        $params = [];

        // Status filter
        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND p.status = :status";
            $params[':status'] = $filters['status'];
        }

        // Category filter
        if (isset($filters['category_id']) && !empty($filters['category_id'])) {
            $query .= " AND p.category_id = :category_id";
            $params[':category_id'] = $filters['category_id'];
        }

        // Category slug filter
        if (isset($filters['category_slug']) && !empty($filters['category_slug'])) {
            $query .= " AND c.slug = :category_slug";
            $params[':category_slug'] = $filters['category_slug'];
        }

        // Featured filter
        if (isset($filters['is_featured']) && $filters['is_featured'] !== null) {
            $query .= " AND p.is_featured = :is_featured";
            $params[':is_featured'] = (int)$filters['is_featured'];
        }

        // Tag filter
        if (isset($filters['tag']) && !empty($filters['tag'])) {
            $query .= " AND p.tags LIKE :tag";
            $params[':tag'] = '%"' . $filters['tag'] . '"%';
        }

        // Search filter
        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (p.title LIKE :search OR p.excerpt LIKE :search2 OR p.content LIKE :search3)";
            $params[':search'] = '%' . $filters['search'] . '%';
            $params[':search2'] = '%' . $filters['search'] . '%';
            $params[':search3'] = '%' . $filters['search'] . '%';
        }

        // Exclude specific post
        if (isset($filters['exclude_id']) && !empty($filters['exclude_id'])) {
            $query .= " AND p.id != :exclude_id";
            $params[':exclude_id'] = (int)$filters['exclude_id'];
        }

        // Sorting
        $sortBy = isset($filters['sort_by']) ? $filters['sort_by'] : 'published_at';
        $sortOrder = isset($filters['sort_order']) && strtoupper($filters['sort_order']) === 'ASC' ? 'ASC' : 'DESC';

        $allowedSortFields = ['published_at', 'created_at', 'title', 'views', 'reading_time'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query .= " ORDER BY p.{$sortBy} {$sortOrder}";
        } else {
            $query .= " ORDER BY p.published_at DESC";
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
        $query = "SELECT COUNT(*) as total FROM {$this->table} p
                  LEFT JOIN blog_categories c ON p.category_id = c.id
                  WHERE 1=1";
        $params = [];

        if (isset($filters['status']) && !empty($filters['status'])) {
            $query .= " AND p.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (isset($filters['category_id']) && !empty($filters['category_id'])) {
            $query .= " AND p.category_id = :category_id";
            $params[':category_id'] = $filters['category_id'];
        }

        if (isset($filters['category_slug']) && !empty($filters['category_slug'])) {
            $query .= " AND c.slug = :category_slug";
            $params[':category_slug'] = $filters['category_slug'];
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== null) {
            $query .= " AND p.is_featured = :is_featured";
            $params[':is_featured'] = (int)$filters['is_featured'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query .= " AND (p.title LIKE :search OR p.excerpt LIKE :search2 OR p.content LIKE :search3)";
            $params[':search'] = '%' . $filters['search'] . '%';
            $params[':search2'] = '%' . $filters['search'] . '%';
            $params[':search3'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['exclude_id']) && !empty($filters['exclude_id'])) {
            $query .= " AND p.id != :exclude_id";
            $params[':exclude_id'] = (int)$filters['exclude_id'];
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
     * Get post by ID
     */
    public function getById($id) {
        $query = "SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
                  FROM {$this->table} p
                  LEFT JOIN blog_categories c ON p.category_id = c.id
                  WHERE p.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get post by slug (and increment views for public access)
     */
    public function getBySlug($slug, $incrementViews = true) {
        $query = "SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
                  FROM {$this->table} p
                  LEFT JOIN blog_categories c ON p.category_id = c.id
                  WHERE p.slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();

        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($post && $incrementViews) {
            $updateQuery = "UPDATE {$this->table} SET views = views + 1 WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':id', $post['id'], PDO::PARAM_INT);
            $updateStmt->execute();
            $post['views'] = (int)$post['views'] + 1;
        }

        return $post;
    }

    /**
     * Create new post
     */
    public function create($data) {
        // Auto-calculate reading time (avg 200 words per minute)
        if (!empty($data['content'])) {
            $wordCount = str_word_count(strip_tags($data['content']));
            $data['reading_time'] = max(1, ceil($wordCount / 200));
        }

        $query = "INSERT INTO {$this->table} (
            title, slug, category_id, excerpt, content, cover_image, gallery_images,
            tags, author_id, author_name, status, is_featured, reading_time,
            meta_title, meta_description, published_at
        ) VALUES (
            :title, :slug, :category_id, :excerpt, :content, :cover_image, :gallery_images,
            :tags, :author_id, :author_name, :status, :is_featured, :reading_time,
            :meta_title, :meta_description, :published_at
        )";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':category_id', $data['category_id'], PDO::PARAM_INT);
        $stmt->bindParam(':excerpt', $data['excerpt']);
        $stmt->bindParam(':content', $data['content']);
        $stmt->bindParam(':cover_image', $data['cover_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':tags', $data['tags']);
        $stmt->bindParam(':author_id', $data['author_id'], PDO::PARAM_INT);
        $stmt->bindParam(':author_name', $data['author_name']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':reading_time', $data['reading_time'], PDO::PARAM_INT);
        $stmt->bindParam(':meta_title', $data['meta_title']);
        $stmt->bindParam(':meta_description', $data['meta_description']);
        $stmt->bindParam(':published_at', $data['published_at']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /**
     * Update post
     */
    public function update($id, $data) {
        // Auto-calculate reading time
        if (!empty($data['content'])) {
            $wordCount = str_word_count(strip_tags($data['content']));
            $data['reading_time'] = max(1, ceil($wordCount / 200));
        }

        $query = "UPDATE {$this->table} SET
            title = :title,
            slug = :slug,
            category_id = :category_id,
            excerpt = :excerpt,
            content = :content,
            cover_image = :cover_image,
            gallery_images = :gallery_images,
            tags = :tags,
            author_name = :author_name,
            status = :status,
            is_featured = :is_featured,
            reading_time = :reading_time,
            meta_title = :meta_title,
            meta_description = :meta_description,
            published_at = :published_at
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':category_id', $data['category_id'], PDO::PARAM_INT);
        $stmt->bindParam(':excerpt', $data['excerpt']);
        $stmt->bindParam(':content', $data['content']);
        $stmt->bindParam(':cover_image', $data['cover_image']);
        $stmt->bindParam(':gallery_images', $data['gallery_images']);
        $stmt->bindParam(':tags', $data['tags']);
        $stmt->bindParam(':author_name', $data['author_name']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':is_featured', $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(':reading_time', $data['reading_time'], PDO::PARAM_INT);
        $stmt->bindParam(':meta_title', $data['meta_title']);
        $stmt->bindParam(':meta_description', $data['meta_description']);
        $stmt->bindParam(':published_at', $data['published_at']);

        return $stmt->execute();
    }

    /**
     * Delete post
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Get related posts (same category or matching tags)
     */
    public function getRelated($postId, $categoryId = null, $tags = null, $limit = 3) {
        $query = "SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
                  FROM {$this->table} p
                  LEFT JOIN blog_categories c ON p.category_id = c.id
                  WHERE p.id != :post_id AND p.status = 'published'";
        $params = [':post_id' => $postId];

        if ($categoryId) {
            $query .= " AND (p.category_id = :category_id";
            $params[':category_id'] = $categoryId;

            if ($tags && is_array($tags) && count($tags) > 0) {
                $tagConditions = [];
                foreach ($tags as $i => $tag) {
                    $paramKey = ":tag_{$i}";
                    $tagConditions[] = "p.tags LIKE {$paramKey}";
                    $params[$paramKey] = '%"' . $tag . '"%';
                }
                $query .= " OR " . implode(' OR ', $tagConditions);
            }
            $query .= ")";
        }

        $query .= " ORDER BY p.published_at DESC LIMIT :limit";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
}
