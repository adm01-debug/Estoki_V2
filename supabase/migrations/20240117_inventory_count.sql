-- Migration: Create inventory count system
-- Version: 20240117_inventory_count

CREATE TABLE IF NOT EXISTS inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'full' CHECK (type IN ('full', 'partial', 'cycle', 'spot')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    adjustments_applied BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id UUID REFERENCES inventory_counts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    location_id UUID REFERENCES locations(id),
    lot_id UUID REFERENCES lot_tracking(id),
    expected_quantity INTEGER DEFAULT 0,
    counted_quantity INTEGER,
    variance INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'counted', 'recounted', 'verified')),
    counted_by UUID REFERENCES auth.users(id),
    counted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_count_items_count ON inventory_count_items(count_id);
CREATE INDEX idx_count_items_product ON inventory_count_items(product_id);
CREATE INDEX idx_count_items_status ON inventory_count_items(status);

-- RLS
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage counts" ON inventory_counts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage count items" ON inventory_count_items
    FOR ALL USING (auth.role() = 'authenticated');
