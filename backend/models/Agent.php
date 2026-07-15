<?php
/**
 * Agent Model
 * B2B partner accounts: credentials, contact details, login history.
 */

class Agent {
    private $conn;
    private $table = 'agents';
    private $logTable = 'agent_login_logs';

    // Columns returned to the admin panel / agent portal (never the password hash)
    const PUBLIC_FIELDS = 'id, agent_code, company_name, contact_name, email, phone, whatsapp, line_id, wechat_id,
                           country, address, tax_id, license_no, notes, status, must_change_password,
                           credentials_sent_at, last_login, login_count, created_at, updated_at';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Authenticate an agent by email. Logs both successful and failed attempts.
     */
    public function login($email, $password, $ip = null, $userAgent = null) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $agent = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agent) {
            return false;
        }

        if (!password_verify($password, $agent['password'])) {
            $this->logLogin($agent['id'], false, $ip, $userAgent);
            return false;
        }

        if ($agent['status'] !== 'active') {
            $this->logLogin($agent['id'], false, $ip, $userAgent);
            return 'inactive';
        }

        $this->registerSuccessfulLogin($agent['id'], $ip, $userAgent);

        unset($agent['password']);
        return $agent;
    }

    private function registerSuccessfulLogin($agentId, $ip, $userAgent) {
        $query = "UPDATE {$this->table} SET last_login = NOW(), login_count = login_count + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $agentId, PDO::PARAM_INT);
        $stmt->execute();

        $this->logLogin($agentId, true, $ip, $userAgent);
    }

    public function logLogin($agentId, $success, $ip = null, $userAgent = null) {
        $query = "INSERT INTO {$this->logTable} (agent_id, success, ip_address, user_agent)
                  VALUES (:agent_id, :success, :ip_address, :user_agent)";
        $stmt = $this->conn->prepare($query);
        $successFlag = $success ? 1 : 0;
        $ua = $userAgent ? substr($userAgent, 0, 255) : null;

        $stmt->bindParam(':agent_id', $agentId, PDO::PARAM_INT);
        $stmt->bindParam(':success', $successFlag, PDO::PARAM_INT);
        $stmt->bindParam(':ip_address', $ip);
        $stmt->bindParam(':user_agent', $ua);

        return $stmt->execute();
    }

    public function getLoginLogs($agentId, $limit = 20) {
        $query = "SELECT id, success, ip_address, user_agent, created_at
                  FROM {$this->logTable}
                  WHERE agent_id = :agent_id
                  ORDER BY created_at DESC
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $agentId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAll() {
        $query = "SELECT " . self::PUBLIC_FIELDS . " FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT " . self::PUBLIC_FIELDS . " FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table}
                  (agent_code, company_name, contact_name, email, password, phone, whatsapp, line_id, wechat_id,
                   country, address, tax_id, license_no, notes, status, must_change_password)
                  VALUES
                  (:agent_code, :company_name, :contact_name, :email, :password, :phone, :whatsapp, :line_id, :wechat_id,
                   :country, :address, :tax_id, :license_no, :notes, :status, 1)";

        $stmt = $this->conn->prepare($query);
        $hashedPassword = password_hash($data['password'], PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);

        $stmt->bindParam(':agent_code', $data['agent_code']);
        $stmt->bindParam(':company_name', $data['company_name']);
        $stmt->bindParam(':contact_name', $data['contact_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':whatsapp', $data['whatsapp']);
        $stmt->bindParam(':line_id', $data['line_id']);
        $stmt->bindParam(':wechat_id', $data['wechat_id']);
        $stmt->bindParam(':country', $data['country']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':tax_id', $data['tax_id']);
        $stmt->bindParam(':license_no', $data['license_no']);
        $stmt->bindParam(':notes', $data['notes']);
        $stmt->bindParam(':status', $data['status']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE {$this->table} SET
                  agent_code = :agent_code,
                  company_name = :company_name,
                  contact_name = :contact_name,
                  email = :email,
                  phone = :phone,
                  whatsapp = :whatsapp,
                  line_id = :line_id,
                  wechat_id = :wechat_id,
                  country = :country,
                  address = :address,
                  tax_id = :tax_id,
                  license_no = :license_no,
                  notes = :notes,
                  status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':agent_code', $data['agent_code']);
        $stmt->bindParam(':company_name', $data['company_name']);
        $stmt->bindParam(':contact_name', $data['contact_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':whatsapp', $data['whatsapp']);
        $stmt->bindParam(':line_id', $data['line_id']);
        $stmt->bindParam(':wechat_id', $data['wechat_id']);
        $stmt->bindParam(':country', $data['country']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':tax_id', $data['tax_id']);
        $stmt->bindParam(':license_no', $data['license_no']);
        $stmt->bindParam(':notes', $data['notes']);
        $stmt->bindParam(':status', $data['status']);

        return $stmt->execute();
    }

    /**
     * Self-service update from the agent portal. Only contact details — agent_code,
     * email (their login), status and the admin's internal notes stay admin-controlled.
     */
    public function updateProfile($id, $data) {
        $fields = ['contact_name', 'phone', 'whatsapp', 'line_id', 'wechat_id', 'country', 'address'];

        $assignments = implode(', ', array_map(function ($field) {
            return "{$field} = :{$field}";
        }, $fields));

        $query = "UPDATE {$this->table} SET {$assignments} WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        foreach ($fields as $field) {
            $value = isset($data[$field]) && $data[$field] !== '' ? $data[$field] : null;
            $stmt->bindValue(':' . $field, $value);
        }

        return $stmt->execute();
    }

    /**
     * Check a plaintext password against the stored hash. Used to confirm the agent
     * knows their current password before letting them set a new one.
     */
    public function verifyPassword($id, $plainPassword) {
        $query = "SELECT password FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? password_verify($plainPassword, $row['password']) : false;
    }

    /**
     * The agent picked this password themselves, so clear the forced-change flag —
     * unlike setPassword(), which is the admin issuing them a temporary one.
     */
    public function changeOwnPassword($id, $plainPassword) {
        $query = "UPDATE {$this->table} SET password = :password, must_change_password = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($plainPassword, PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':password', $hashedPassword);

        return $stmt->execute();
    }

    /**
     * Overwrite the agent's password with a new one and force a change on next login.
     */
    public function setPassword($id, $plainPassword) {
        $query = "UPDATE {$this->table} SET password = :password, must_change_password = 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($plainPassword, PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);

        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':password', $hashedPassword);

        return $stmt->execute();
    }

    /**
     * Remember that the agent has been emailed their login details, so the admin list
     * can tell an account that is merely created from one the partner can actually use.
     */
    public function markCredentialsSent($id) {
        $query = "UPDATE {$this->table} SET credentials_sent_at = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

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

    public function codeExists($code, $excludeId = null) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE agent_code = :code";

        if ($excludeId) {
            $query .= " AND id != :id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':code', $code);

        if ($excludeId) {
            $stmt->bindParam(':id', $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] > 0;
    }

    /**
     * Normalize an admin-entered code: uppercase, only A-Z 0-9 and dashes.
     */
    public static function normalizeCode($code) {
        $code = strtoupper(trim((string)$code));
        $code = preg_replace('/[^A-Z0-9-]/', '', $code);
        return substr($code, 0, 20);
    }

    /**
     * Build a code from the company's initials, e.g. "Sunrise Travel Co., Ltd." => "STV".
     * Legal-form words are ignored so they don't dominate the initials. Falls back to
     * "AG" when the name has no usable letters, and appends -2, -3, ... on collision.
     */
    public function generateAgentCodeFromName($companyName) {
        $ignored = ['co', 'ltd', 'inc', 'llc', 'company', 'limited', 'corp', 'corporation',
                    'the', 'and', 'group', 'agency', 'travel', 'tour', 'tours'];

        $clean = preg_replace('/[^a-zA-Z0-9 ]/', ' ', (string)$companyName);
        $words = preg_split('/\s+/', trim($clean), -1, PREG_SPLIT_NO_EMPTY);

        $significant = array_values(array_filter($words, function ($word) use ($ignored) {
            return !in_array(strtolower($word), $ignored);
        }));

        // Every word was a legal form / stopword — use them rather than nothing.
        if (empty($significant)) {
            $significant = $words;
        }

        $initials = '';
        foreach (array_slice($significant, 0, 3) as $word) {
            $initials .= strtoupper($word[0]);
        }

        // A single-word name gives a one-letter code; pad it from the word itself.
        if (strlen($initials) < 2 && !empty($significant[0])) {
            $initials = strtoupper(substr($significant[0], 0, 3));
        }

        $base = self::normalizeCode($initials);
        if ($base === '') {
            $base = 'AG';
        }

        $code = $base;
        $suffix = 2;
        while ($this->codeExists($code)) {
            $code = $base . '-' . $suffix;
            $suffix++;
        }

        return $code;
    }

    /**
     * Cryptographically random password using an alphabet without look-alike
     * characters (0/O, 1/l/I), so it can be read out over the phone.
     */
    public static function generatePassword($length = 12) {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%&*';
        $max = strlen($alphabet) - 1;
        $password = '';

        for ($i = 0; $i < $length; $i++) {
            $password .= $alphabet[random_int(0, $max)];
        }

        return $password;
    }
}
