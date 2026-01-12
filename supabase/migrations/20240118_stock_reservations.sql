-- Migration: Create stock reservations system
-- Version: 20240118_stock_reservations

CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    order_id UUID,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'released', 'expired')),
    reserved_by UUID REFERENCES auth.users(id),
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX idx_reservations_product ON stock_reservations(product_id);
CREATE INDEX idx_reservations_order ON stock_reservations(order_id);
CREATE INDEX idx_reservations_status ON stock_reservations(status);
CREATE INDEX idx_reservations_expires ON stock_reservations(expires_at) WHERE status = 'active';

-- Function to auto-release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    released_count INTEGER;
BEGIN
    WITH released AS (
        UPDATE stock_reservations
        SET status = 'expired', released_at = NOW()
        WHERE status = 'active' AND expires_at < NOW()
        RETURNING id, product_id, location_id, quantity
    )
    SELECT COUNT(*) INTO released_count FROM released;
    
    -- Update stock balances
    UPDATE stock_balances sb
    SET reserved_quantity = reserved_quantity - r.quantity,
        available_quantity = available_quantity + r.quantity
    FROM (
        SELECT product_id, location_id, SUM(quantity) as quantity
        FROM stock_reservations
        WHERE status = 'expired' AND released_at > NOW() - INTERVAL '1 minute'
        GROUP BY product_id, location_id
    ) r
    WHERE sb.product_id = r.product_id AND sb.location_id = r.location_id;
    
    RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage reservations" ON stock_reservations
    FOR ALL USING (auth.role() = 'authenticated');
