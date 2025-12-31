-- Table to store WebAuthn/Passkey credentials
CREATE TABLE public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_name TEXT,
  transports TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_passkey_credentials_user_id ON public.passkey_credentials(user_id);
CREATE INDEX idx_passkey_credentials_credential_id ON public.passkey_credentials(credential_id);

-- Enable RLS
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credentials
CREATE POLICY "Users can view their own passkeys"
ON public.passkey_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete their own passkeys"
ON public.passkey_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can insert/update (via edge functions)
CREATE POLICY "Service role can manage passkeys"
ON public.passkey_credentials
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Table to store challenges temporarily
CREATE TABLE public.webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- Auto-delete expired challenges
CREATE INDEX idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

-- RLS for challenges
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read unexpired challenges"
ON public.webauthn_challenges
FOR SELECT
USING (expires_at > now());

CREATE POLICY "Service role can manage challenges"
ON public.webauthn_challenges
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');