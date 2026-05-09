CREATE TABLE IF NOT EXISTS ai_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind VARCHAR(100) NOT NULL,
  model VARCHAR(255),
  prompt_hash VARCHAR(64),
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_response TEXT,
  error_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_failures_kind ON ai_failures(kind);
CREATE INDEX IF NOT EXISTS idx_ai_failures_created_at ON ai_failures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_failures_prompt_hash ON ai_failures(prompt_hash);
