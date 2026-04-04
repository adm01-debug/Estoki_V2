# ESTOKI — API Reference (Edge Functions)

> Comprehensive documentation of all 240+ backend functions.  
> Base URL: `https://<project-ref>.supabase.co/functions/v1`

---

## Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth-register` | POST | Public | Register new user (email, password, nome) |
| `/auth-login` | POST | Public | Login with email/password |
| `/auth-logout` | POST | Bearer | Revoke current session |
| `/auth-refresh-token` | POST | Bearer | Refresh JWT token |
| `/auth-reset-password` | POST | Public | Send password reset email |
| `/auth-change-password` | POST | Bearer | Change user password |
| `/auth-verify-email` | POST | Public | Verify email token |
| `/auth-social-login` | POST | Public | OAuth social login |
| `/auth-2fa-setup` | POST | Bearer | Setup TOTP 2FA |
| `/auth-2fa-verify` | POST | Bearer | Verify 2FA code |
| `/auth-session-list` | GET | Bearer | List active sessions |
| `/auth-session-revoke` | POST | Bearer | Revoke specific session |

### WebAuthn (Passkeys)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/webauthn-register-options` | POST | Bearer | Get registration challenge |
| `/webauthn-register-verify` | POST | Bearer | Verify registration |
| `/webauthn-auth-options` | POST | Public | Get authentication challenge |
| `/webauthn-auth-verify` | POST | Public | Verify authentication |

---

## Inventory & Stock

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/adjust-inventory` | POST | Bearer | Manual stock adjustment |
| `/inventory-reserve` | POST | Bearer | Reserve stock for order |
| `/inventory-release` | POST | Bearer | Release reserved stock |
| `/inventory-transfer` | POST | Bearer | Transfer between locations |
| `/inventory-count` | POST | Bearer | Submit cycle count |
| `/inventory-reconcile` | POST | Bearer | Reconcile discrepancies |
| `/inventory-snapshot` | POST | Bearer | Create point-in-time snapshot |
| `/inventory-sync` | POST | Bearer | Sync with external system |
| `/inventory-valuation` | GET | Bearer | Calculate inventory value |
| `/inventory-batch-adjust` | POST | Bearer | Bulk adjustment |
| `/reserve-stock` | POST | Bearer | Reserve stock |
| `/release-stock` | POST | Bearer | Release reservation |
| `/transfer-stock` | POST | Bearer | Transfer stock |
| `/stock-movement` | POST | Bearer | Record stock movement |
| `/stock-alert` | POST | Bearer | Check stock alerts |
| `/cycle-count` | POST | Bearer | Process cycle count |
| `/check-reorder` | POST | Bearer | Check reorder points |
| `/reorder-suggestions` | GET | Bearer | AI-powered suggestions |
| `/safety-stock` | GET | Bearer | Calculate safety stock |
| `/check-expiration` | GET | Bearer | Check lot expiration |
| `/location-utilization` | GET | Bearer | Position utilization stats |
| `/search-locations` | GET | Bearer | Search storage locations |
| `/lot-tracking` | GET | Bearer | Lot lifecycle tracking |

---

## Receiving & Quality

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/receiving-create` | POST | Bearer | Create receiving order |
| `/receiving-confirm` | POST | Bearer | Confirm receipt |
| `/receiving-inspect` | POST | Bearer | Quality inspection |
| `/receiving-reject` | POST | Bearer | Reject receipt |
| `/receiving-cancel` | POST | Bearer | Cancel receiving |
| `/receiving-putaway` | POST | Bearer | Assign putaway location |
| `/receive-purchase-order` | POST | Bearer | Process PO receipt |
| `/quality-inspection` | POST | Bearer | Submit QC results |

---

## Picking & Waves

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/picking-assign` | POST | Bearer | Assign picker to task |
| `/picking-confirm` | POST | Bearer | Confirm pick completion |
| `/picking-cancel` | POST | Bearer | Cancel pick task |
| `/picking-skip` | POST | Bearer | Skip pick item |
| `/picking-split` | POST | Bearer | Split pick task |
| `/picking-batch` | POST | Bearer | Create batch pick |
| `/picking-optimize` | POST | Bearer | Optimize pick route |
| `/generate-pick-list` | POST | Bearer | Generate pick list |
| `/generate-putaway-list` | POST | Bearer | Generate putaway list |
| `/wave-planning` | POST | Bearer | Plan wave |
| `/wave-release` | POST | Bearer | Release wave |
| `/wave-cancel` | POST | Bearer | Cancel wave |
| `/wave-split` | POST | Bearer | Split wave |
| `/wave-merge` | POST | Bearer | Merge waves |
| `/wave-optimize` | POST | Bearer | Optimize wave |

---

## Shipping & Carriers

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/create-shipment` | POST | Bearer | Create shipment |
| `/shipping-rate` | POST | Bearer | Get shipping rates |
| `/shipping-label` | POST | Bearer | Generate label |
| `/shipping-manifest` | POST | Bearer | Create manifest |
| `/shipping-cancel` | POST | Bearer | Cancel shipment |
| `/shipping-pod` | POST | Bearer | Proof of delivery |
| `/shipping-track-webhook` | POST | Public | Tracking webhook |
| `/calculate-shipping` | POST | Bearer | Calculate shipping cost |
| `/track-shipment` | GET | Bearer | Track shipment status |
| `/carrier-quote` | POST | Bearer | Get carrier quote |
| `/carrier-quote-correios` | POST | Bearer | Correios quote |
| `/carrier-quote-jadlog` | POST | Bearer | Jadlog quote |
| `/carrier-book` | POST | Bearer | Book carrier |
| `/carrier-cancel` | POST | Bearer | Cancel booking |
| `/carrier-label` | POST | Bearer | Get carrier label |
| `/carrier-track` | GET | Bearer | Track via carrier |
| `/carrier-rates-cache` | GET | Bearer | Cached carrier rates |
| `/carrier-webhooks` | POST | Public | Carrier webhook receiver |

---

## NF-e / Fiscal

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/nfe-import` | POST | Bearer | Import NF-e XML |
| `/nfe-process` | POST | Bearer | Process NF-e data |
| `/nfe-validate` | POST | Bearer | Validate NF-e |
| `/nfe-cancel` | POST | Bearer | Cancel NF-e |
| `/nfe-correct` | POST | Bearer | Correction letter |
| `/nfe-manifest` | POST | Bearer | Manifest NF-e |
| `/nfe-distribution` | POST | Bearer | Distribute NF-e |
| `/cte-import` | POST | Bearer | Import CT-e |
| `/danfe-generate` | POST | Bearer | Generate DANFE PDF |

---

## Reports & Analytics

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/dashboard-stats` | GET | Bearer | Dashboard KPIs |
| `/calculate-kpis` | GET | Bearer | Calculate KPIs |
| `/abc-analysis` | GET | Bearer | ABC curve analysis |
| `/warehouse-metrics` | GET | Bearer | Warehouse metrics |
| `/report-daily` | GET | Bearer | Daily report |
| `/report-weekly` | GET | Bearer | Weekly report |
| `/report-monthly` | GET | Bearer | Monthly report |
| `/report-custom` | POST | Bearer | Custom report |
| `/report-inventory` | GET | Bearer | Inventory report |
| `/report-inventory-accuracy` | GET | Bearer | Accuracy report |
| `/report-picking-performance` | GET | Bearer | Picking performance |
| `/report-turnover` | GET | Bearer | Turnover report |
| `/report-valuation` | GET | Bearer | Valuation report |
| `/report-supplier-performance` | GET | Bearer | Supplier performance |
| `/demand-forecast` | GET | Bearer | Demand forecast |
| `/previsao-demanda` | GET | Bearer | AI demand prediction |

---

## AI & Intelligence

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/ai-assistant` | POST | Bearer | AI chat assistant |
| `/ai-classification` | POST | Bearer | Product classification |
| `/ai-completion` | POST | Bearer | Text completion |
| `/ai-embedding` | POST | Bearer | Generate embeddings |
| `/ai-sentiment` | POST | Bearer | Sentiment analysis |
| `/ai-summarize` | POST | Bearer | Text summarization |
| `/ai-translate` | POST | Bearer | Translation |
| `/scanner-ocr` | POST | Bearer | OCR text extraction |
| `/scan-barcode` | POST | Bearer | Barcode scan |
| `/validate-ean` | POST | Bearer | Validate EAN code |

---

## Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/notifications` | GET | Bearer | List notifications |
| `/notify-user` | POST | Bearer | Send to user |
| `/notify-slack` | POST | Bearer | Send to Slack |
| `/notification-email` | POST | Bearer | Send email |
| `/notification-sms` | POST | Bearer | Send SMS |
| `/notification-push` | POST | Bearer | Push notification |
| `/notification-whatsapp` | POST | Bearer | Send WhatsApp |
| `/send-email-alert` | POST | Bearer | Send email alert |
| `/broadcast-event` | POST | Bearer | Broadcast event |

---

## Integrations

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/integration-erp` | POST | Bearer | ERP sync |
| `/integration-sap` | POST | Bearer | SAP integration |
| `/integration-totvs` | POST | Bearer | TOTVS integration |
| `/integration-ecommerce` | POST | Bearer | E-commerce sync |
| `/integration-marketplace` | POST | Bearer | Marketplace sync |
| `/integration-amazon` | POST | Bearer | Amazon integration |
| `/integration-mercado-livre` | POST | Bearer | Mercado Livre |
| `/integration-correios` | POST | Bearer | Correios integration |
| `/external-db-bridge` | POST | Bearer | External DB bridge |
| `/sync-external-api` | POST | Bearer | External API sync |
| `/edi-process` | POST | Bearer | EDI processing |

---

## System & Infrastructure

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | Public | Health check |
| `/health-check` | GET | Public | Extended health |
| `/cache-invalidate` | POST | Bearer | Invalidate cache |
| `/rate-limiter` | POST | Bearer | Rate limiter |
| `/check-permission` | POST | Bearer | Check permission |
| `/get-permissions` | GET | Bearer | Get user permissions |
| `/audit-log` | POST | Bearer | Write audit log |
| `/backup-database` | POST | Service | Database backup |
| `/cleanup-old-data` | POST | Service | Cleanup old data |

---

## Auth Legend

| Type | Description |
|------|-------------|
| **Public** | No authentication required |
| **Bearer** | Requires `Authorization: Bearer <JWT>` header |
| **Service** | Requires `SUPABASE_SERVICE_ROLE_KEY` (internal only) |

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```
