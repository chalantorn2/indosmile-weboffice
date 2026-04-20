<?php
/**
 * TransferVehicle Model
 * Master list of vehicle types (Standard Car, VIP Minivan, etc.)
 */
class TransferVehicle
{
    private $conn;
    private $table = 'transfer_vehicles';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll($filters = [])
    {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        if (isset($filters['is_active']) && $filters['is_active'] !== null && $filters['is_active'] !== '') {
            $query .= " AND is_active = " . (int)$filters['is_active'];
        }
        $query .= " ORDER BY sort_order ASC, name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table}
             (name, max_passengers, max_luggage, image_url, description, is_active, sort_order)
             VALUES (:name, :max_passengers, :max_luggage, :image_url, :description, :is_active, :sort_order)"
        );
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':max_passengers', isset($data['max_passengers']) ? (int)$data['max_passengers'] : 1, PDO::PARAM_INT);
        $stmt->bindValue(':max_luggage', isset($data['max_luggage']) ? (int)$data['max_luggage'] : 2, PDO::PARAM_INT);
        $stmt->bindValue(':image_url', isset($data['image_url']) ? $data['image_url'] : null);
        $stmt->bindValue(':description', isset($data['description']) ? $data['description'] : null);
        $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
        $stmt->bindValue(':sort_order', isset($data['sort_order']) ? (int)$data['sort_order'] : 0, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update($id, $data)
    {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET
                name = :name,
                max_passengers = :max_passengers,
                max_luggage = :max_luggage,
                image_url = :image_url,
                description = :description,
                is_active = :is_active,
                sort_order = :sort_order
             WHERE id = :id"
        );
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':max_passengers', isset($data['max_passengers']) ? (int)$data['max_passengers'] : 1, PDO::PARAM_INT);
        $stmt->bindValue(':max_luggage', isset($data['max_luggage']) ? (int)$data['max_luggage'] : 2, PDO::PARAM_INT);
        $stmt->bindValue(':image_url', isset($data['image_url']) ? $data['image_url'] : null);
        $stmt->bindValue(':description', isset($data['description']) ? $data['description'] : null);
        $stmt->bindValue(':is_active', isset($data['is_active']) ? (int)$data['is_active'] : 1, PDO::PARAM_INT);
        $stmt->bindValue(':sort_order', isset($data['sort_order']) ? (int)$data['sort_order'] : 0, PDO::PARAM_INT);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function existsByName($name, $excludeId = null)
    {
        $sql = "SELECT id FROM {$this->table} WHERE name = :name";
        if ($excludeId) {
            $sql .= " AND id <> :id";
        }
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':name', $name);
        if ($excludeId) {
            $stmt->bindValue(':id', (int)$excludeId, PDO::PARAM_INT);
        }
        $stmt->execute();
        return (bool)$stmt->fetchColumn();
    }
}
