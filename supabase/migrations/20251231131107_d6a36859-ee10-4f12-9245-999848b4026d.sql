-- Create table for geo blocking configuration
CREATE TABLE public.geo_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.geo_whitelist ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage geo whitelist"
ON public.geo_whitelist
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view geo whitelist"
ON public.geo_whitelist
FOR SELECT
USING (true);

-- Insert default countries (Brazil)
INSERT INTO public.geo_whitelist (country_code, country_name) VALUES
('BR', 'Brasil');