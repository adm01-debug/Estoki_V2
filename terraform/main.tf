# Terraform configuration for ESTOKI WMS
# Provider: Supabase (managed via Terraform)

terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "supabase" {
  # Configuration via environment variables:
  # SUPABASE_ACCESS_TOKEN
}

resource "supabase_project" "wms_production" {
  name             = "ESTOKI WMS Prod"
  organization_id  = var.organization_id
  region           = "sa-east-1" # São Paulo
  db_password      = var.db_password
}

# Database structures (managed via migrations in this repo)
# Auth, Storage, Edge Functions config...
