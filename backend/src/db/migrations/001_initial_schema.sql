CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  connection_mode VARCHAR(20) DEFAULT 'guided' CHECK (connection_mode IN ('strict', 'guided', 'sandbox')),
  default_template VARCHAR(50) DEFAULT 'blank',
  autosave_interval INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS diagrams (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled diagram',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  invite_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_invite_code ON diagrams(invite_code);

CREATE TABLE IF NOT EXISTS diagram_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id VARCHAR(50) REFERENCES diagrams(id) ON DELETE CASCADE,
  prompt_hash VARCHAR(64),
  prompt_text TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  raw_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_diagram_id ON diagram_versions(diagram_id);
CREATE INDEX IF NOT EXISTS idx_versions_prompt_hash ON diagram_versions(prompt_hash);

CREATE TABLE IF NOT EXISTS diagram_collaborators (
  diagram_id VARCHAR(50) NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (diagram_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  products JSONB DEFAULT '[]',
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_user_tech ON user_inventory(user_id, name);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  connection_mode VARCHAR(20) DEFAULT 'guided' CHECK (connection_mode IN ('strict', 'guided', 'sandbox')),
  default_template VARCHAR(50) DEFAULT 'blank',
  autosave_interval INTEGER DEFAULT 30,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connection_rules (
  id SERIAL PRIMARY KEY,
  source_category VARCHAR(50) NOT NULL,
  target_category VARCHAR(50) NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  warning_message TEXT,
  UNIQUE (source_category, target_category)
);

CREATE INDEX IF NOT EXISTS idx_rules_source ON connection_rules(source_category);

INSERT INTO connection_rules (source_category, target_category, is_valid, warning_message) VALUES
('frontend', 'backend', TRUE, NULL),
('frontend', 'database', TRUE, 'Unusual connection: Frontend directly to Database (BFF pattern)'),
('frontend', 'external', TRUE, NULL),
('backend', 'database', TRUE, NULL),
('backend', 'queue', TRUE, NULL),
('backend', 'auth', TRUE, NULL),
('backend', 'storage', TRUE, NULL),
('backend', 'external', TRUE, NULL),
('backend', 'frontend', TRUE, NULL),
('database', 'database', TRUE, 'Unusual connection: Database to Database (replication?)'),
('queue', 'queue', TRUE, 'Unusual connection: Queue chaining'),
('devops', 'frontend', TRUE, NULL),
('devops', 'backend', TRUE, NULL),
('devops', 'database', TRUE, NULL),
('devops', 'queue', TRUE, NULL),
('devops', 'storage', TRUE, NULL),
('devops', 'auth', TRUE, NULL),
('auth', 'backend', TRUE, NULL),
('storage', 'backend', TRUE, NULL),
('external', 'backend', TRUE, NULL),
('frontend', 'frontend', FALSE, 'Invalid: Frontend to Frontend'),
('frontend', 'queue', FALSE, 'Invalid: Frontend should not connect to Queue directly'),
('frontend', 'auth', FALSE, 'Invalid: Frontend should not connect to Auth directly'),
('frontend', 'storage', FALSE, 'Invalid: Frontend should not connect to Storage directly'),
('database', 'backend', FALSE, 'Invalid: Database cannot initiate connections'),
('queue', 'backend', FALSE, 'Invalid: Queue cannot initiate connections'),
('auth', 'frontend', FALSE, 'Invalid: Auth cannot initiate connections'),
('storage', 'frontend', FALSE, 'Invalid: Storage cannot initiate connections')
ON CONFLICT (source_category, target_category) DO NOTHING;
