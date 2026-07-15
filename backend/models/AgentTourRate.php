<?php
/**
 * AgentTourRate Model
 *
 * Contract rates a B2B agent gets on our tours. We store a MARKUP on top of our own
 * net (cost) price and derive the agent's rate on read, so re-negotiating a supplier
 * cost flows through to every agent instead of leaving them on a stale rate.
 *
 *   agent rate = tours.net_adult_price + adult_markup
 *
 * The two read paths are deliberately different:
 *   - adminList()                see our cost, our selling price AND the markup.
 *   - agentTours() / agentTour() see the resulting rate only. They must never leak
 *                                tours.net_adult_price (what we pay) or
 *                                tours.adult_price (what the agent resells against).
 */

class AgentTourRate {
    private $conn;
    private $table = 'agent_tour_rates';

    // A tour imported before net prices existed can still have a NULL cost; COALESCE onto
    // the selling price keeps such a row priceable instead of turning the rate into NULL.
    const NET_ADULT_SRC = 'COALESCE(t.net_adult_price, t.adult_price)';
    const NET_CHILD_SRC = 'COALESCE(t.net_child_price, t.child_price)';

    const AGENT_ADULT = 'GREATEST(' . self::NET_ADULT_SRC . ' + r.adult_markup, 0)';
    const AGENT_CHILD = 'CASE WHEN ' . self::NET_CHILD_SRC . ' IS NULL THEN NULL
                              ELSE GREATEST(' . self::NET_CHILD_SRC . ' + r.child_markup, 0) END';

    public function __construct($db) {
        $this->conn = $db;
    }

    // =====================================================================
    // Admin side
    // =====================================================================

    /**
     * Every active tour, with this agent's rate attached when one exists.
     * Drives the admin rate picker, so it keeps our own cost and selling price in the payload.
     */
    public function adminList($agentId) {
        $query = "SELECT t.id AS tour_id, t.name, t.destination, t.duration_label,
                         t.duration_days, t.duration_nights,
                         t.adult_price, t.child_price,
                         " . self::NET_ADULT_SRC . " AS net_adult_price,
                         " . self::NET_CHILD_SRC . " AS net_child_price,
                         r.adult_markup, r.child_markup,
                         " . self::AGENT_ADULT . " AS agent_adult_price,
                         " . self::AGENT_CHILD . " AS agent_child_price
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
     * Apply one markup pair to a set of tours at once — the "these 10 tours are net +150"
     * case. Upserts, so re-applying to an already-rated tour just updates it.
     */
    public function setBulk($agentId, array $tourIds, $adultMarkup, $childMarkup) {
        $tourIds = array_values(array_unique(array_filter(array_map('intval', $tourIds))));

        if (empty($tourIds)) {
            return 0;
        }

        $query = "INSERT INTO {$this->table} (agent_id, tour_id, adult_markup, child_markup)
                  VALUES (:agent_id, :tour_id, :adult_markup, :child_markup)
                  ON DUPLICATE KEY UPDATE
                      adult_markup = VALUES(adult_markup),
                      child_markup = VALUES(child_markup)";
        $stmt = $this->conn->prepare($query);

        $this->conn->beginTransaction();

        try {
            foreach ($tourIds as $tourId) {
                $stmt->execute([
                    ':agent_id'     => $agentId,
                    ':tour_id'      => $tourId,
                    ':adult_markup' => $adultMarkup,
                    ':child_markup' => $childMarkup,
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
    // Agent portal side — the agent's own rate only
    // =====================================================================

    /**
     * The tours this agent may see, at their rate. Tours without a rate row are
     * excluded by the INNER JOIN, which is the whole access rule.
     *
     * The columns are listed one by one on purpose: t.* would carry our cost price
     * and our selling price straight into the agent's browser.
     */
    public function agentTours($agentId, $search = null) {
        $query = "SELECT t.id, t.name, t.slug, t.destination, t.duration_days, t.duration_nights,
                         t.duration_label, t.currency, t.main_image, t.short_description,
                         " . self::AGENT_ADULT . " AS net_adult_price,
                         " . self::AGENT_CHILD . " AS net_child_price
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
     * Returns the whole tour row with adult_price/child_price REPLACED by the agent's
     * rate — the caller can hand it straight to the tour detail page.
     */
    public function agentTour($agentId, $tourId) {
        $query = "SELECT t.*,
                         " . self::AGENT_ADULT . " AS agent_adult_price,
                         " . self::AGENT_CHILD . " AS agent_child_price
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

        // Hand the agent their rate under the field names the tour page already reads,
        // then drop both of our own prices so neither reaches the browser: t.* pulled in
        // net_adult_price (our cost) and adult_price (our selling price).
        $tour['adult_price'] = $tour['agent_adult_price'];
        $tour['child_price'] = $tour['agent_child_price'];
        unset($tour['agent_adult_price'], $tour['agent_child_price'],
              $tour['net_adult_price'], $tour['net_child_price']);

        return $this->castRow($tour);
    }

    /**
     * MySQL hands DECIMAL back as a string; the frontend wants numbers.
     */
    private function castRow($row) {
        foreach (['adult_price', 'child_price', 'adult_markup', 'child_markup',
                  'net_adult_price', 'net_child_price',
                  'agent_adult_price', 'agent_child_price'] as $field) {
            if (array_key_exists($field, $row)) {
                $row[$field] = $row[$field] === null ? null : (float)$row[$field];
            }
        }

        return $row;
    }
}
