provider "supabase" {
  # API Key and URL should be set via environment variables
}

resource "supabase_project" "estoki_wms" {
  name     = "ESTOKI WMS"
  region   = "us-east-1"
  plan     = "pro"
}

resource "supabase_table" "posicoes_estoque" {
  project_id = "wrhidiguevvnqywlueps"
  name       = "posicoes_estoque"
}
