-- Track when login details were last emailed to an agent.
-- NULL means the agent has never been told their password — the admin list flags those.

ALTER TABLE agents
    ADD COLUMN credentials_sent_at DATETIME NULL DEFAULT NULL AFTER must_change_password;
