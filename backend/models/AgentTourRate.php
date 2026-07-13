<?php
/**
 * AgentTourRate Model
 *
 * Contract rates a B2B agent gets on our tours. We store the discount off our
 * selling price and derive the net rate on read, so a price change on the tour
 * never leaves an agent on a stale rate.
 *
 * The two read paths are deliberately different:
 *   - adminList() / adminRateMap()  see our selling price AND the discount.
 *   - agentTours() / agentTour()    see the net rate only. They must never leak
 *                                   tours.adult_price — that is the number the
 *                                   agent resells against.
 */

class AgentTourRate {
    private $conn;
    private $table = 'agent_tour_rates';

    // Net rate never goes below zero, even if an admin enters a discount larger than the price.
    const NET_ADULT = 'GREATEST(t.adult_price - r.adult_discount, 0)';
    const NET_CHILD = 'CASE WHEN t.child_price IS NULL THEN NULL
                            ELSE GREATEST(t.child_price - r.child_discount, 0) END';

    public function __construct($db) {
        $this->conn = $db;
    }

    // =====================================================================
    // Admin side
    // =====================================================================

    /**
     * Every active tour, with this agent's rate attached when one exists.
     * Drives the admin rate picker, so it keeps our own prices in the payload.
     */
    public function adminList($agentId) {
        $query = "SELECT t.id AS tour_id, t.name, t.destination, t.duration_label,
                         t.duration_days, t.duration_nights,
                         t.adult_price, t.child_price,
                         r.adult_discount, r.child_discount,
                         " . self::NET_ADULT . " AS net_adult_price,
                         " . self::NET_CHILD . " AS net_child_price
                  FROM tours t
                  LEFT JOIN {$this->table} r ON r.tour_id = t.id AND r.agent_id = :agent_id
                  WHERE t.is_active = 1
                  ORDER BY t.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $agentId, PDO::PARAM_INT);
        $stmt->execute();

        return array_map([$this, 'castRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Apply one discount pair to a set of tours at once — the "these 10 tours are
     * -150" case. Upserts, so re-applying to an already-rated tour just updates it.
     */
    public function setBulk($agentId, array $tourIds, $adultDiscount, $childDiscount) {
        $tourIds = array_values(array_unique(array_filter(array_map('intval', $tourIds))));

        if (empty($tourIds)) {
            return 0;
        }

        $query = "INSERT INTO {$this->table} (agent_id, tour_id, adult_discount, child_discount)
                  VALUES (:agent_id, :tour_id, :adult_discount, :child_discount)
                  ON DUPLICATE KEY UPDATE
                      adult_discount = VALUES(adult_discount),
                      child_discount = VALUES(child_discount)";
        $stmt = $this->conn->prepare($query);

        $this->conn->beginTransaction();

        try {
            foreach ($tourIds as $tourId) {
                $stmt->execute([
                    ':agent_id'       => $agentId,
                    ':tour_id'        => $tourId,
                    ':adult_discount' => $adultDiscount,
                    ':child_discount' => $childDiscount,
                ]);
            }
            $this->conn->commit();
        } catch (PDOException $e) {
            $this->conn->rollBack();
            throw $e;
        }

        return count($tourIds);
    }

    /**
     * Take a set of tours away from the agent. Removing the row hides the tour
     * from their portal entirely.
     */
    public function removeBulk($agentId, array $tourIds) {
        $tourIds = array_values(array_unique(array_filter(array_map('intval', $tourIds))));

        if (empty($tourIds)) {
            return 0;
        }

        $placeholders = implode(',', array_fill(0, count($tourIds), '?'));
        $query = "DELETE FROM {$this->table} WHERE agent_id = ? AND tour_id IN ({$placeholders})";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array_merge([$agentId], $tourIds));

        return $stmt->rowCount();
    }

    // =====================================================================
    // Agent portal side — net rates only
    // =====================================================================

    /**
     * The tours this agent may see, at their net rate. Tours without a rate row
     * are excluded by the INNER JOIN, which is the whole access rule.
     */
    public function agentTours($agentId, $search = null) {
        $query = "SELECT t.id, t.name, t.slug, t.destination, t.duration_days, t.duration_nights,
                         t.duration_label, t.currency, t.main_image, t.short_description,
                         " . self::NET_ADULT . " AS net_adult_price,
                         " . self::NET_CHILD . " AS net_child_price
                  FROM {$this->table} r
                  INNER JOIN tours t ON t.id = r.tour_id
                  WHERE r.agent_id = :agent_id AND t.is_active = 1";

        $params = [':agent_id' => $agentId];

        if ($search !== null && $search !== '') {
            $query .= " AND (t.name LIKE :search OR t.destination LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $query .= " ORDER BY t.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return array_map([$this, 'castRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Full detail for one tour, but only if this agent has a rate on it.
     * Returns the whole tour row with adult_price/child_price REPLACED by the net
     * rate — the caller can hand it straight to the tour detail page.
     */
    public function agentTour($agentId, $tourId) {
        $query = "SELECT t.*,
                         " . self::NET_ADULT . " AS net_adult_price,
                         " . self::NET_CHILD . " AS net_child_price
                  FROM {$this->table} r
                  INNER JOIN tours t ON t.id = r.tour_id
                  WHERE r.agent_id = :agent_id AND t.id = :tour_id AND t.is_active = 1
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $agentId, PDO::PARAM_INT);
        $stmt->bindParam(':tour_id', $tourId, PDO::PARAM_INT);
        $stmt->execute();

        $tour = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            return null;
        }

        // Hand the agent the net rate under the field names the tour page already
        // reads, and drop our selling price so it never reaches the browser.
        $tour['adult_price'] = $tour['net_adult_price'];
        $tour['child_price'] = $tour['net_child_price'];
        unset($tour['net_adult_price'], $tour['net_child_price']);

        return $this->castRow($tour);
    }

    /**
     * MySQL hands DECIMAL back as a string; the frontend wants numbers.
     */
    private function castRow($row) {
        foreach (['adult_price', 'child_price', 'adult_discount', 'child_discount',
                  'net_adult_price', 'net_child_price'] as $field) {
            if (array_key_exists($field, $row)) {
                $row[$field] = $row[$field] === null ? null : (float)$row[$field];
            }
        }

        return $row;
    }
}
