-- ============================================================================
-- EarthTwin — AI Digital Twin for Outdoor Ecosystems
-- Supabase PostgreSQL Relational Schema
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ECOSYSTEMS TABLE
CREATE TABLE IF NOT EXISTS ecosystems (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    health_score DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    status VARCHAR(64) NOT NULL DEFAULT 'Healthy',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on location & category for fast lookups
CREATE INDEX IF NOT EXISTS idx_ecosystems_category ON ecosystems(category);
CREATE INDEX IF NOT EXISTS idx_ecosystems_health ON ecosystems(health_score);

-- 2. ENVIRONMENT_DATA TABLE (Telemetry Time Series)
CREATE TABLE IF NOT EXISTS environment_data (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    temperature DOUBLE PRECISION NOT NULL,     -- °C
    humidity DOUBLE PRECISION NOT NULL,        -- %
    rainfall DOUBLE PRECISION NOT NULL,        -- mm
    soil_moisture DOUBLE PRECISION NOT NULL,   -- %
    vegetation_health DOUBLE PRECISION NOT NULL,-- 0 to 100
    air_quality DOUBLE PRECISION NOT NULL,      -- 0 to 100 (AQI inverted / health index)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_env_data_ecosystem_time ON environment_data(ecosystem_id, timestamp DESC);

-- 3. ECOSYSTEM_ZONES TABLE (Micro-climate partitions)
CREATE TABLE IF NOT EXISTS ecosystem_zones (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    zone_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    soil_moisture DOUBLE PRECISION NOT NULL,
    vegetation_health DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(64) NOT NULL DEFAULT 'Low', -- Low, Moderate, High, Severe
    canopy_density DOUBLE PRECISION,
    dominant_species VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_ecosystem ON ecosystem_zones(ecosystem_id);

-- 4. PREDICTIONS TABLE (ML & Heuristic predictions log)
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fire_risk DOUBLE PRECISION NOT NULL,        -- 0 - 100%
    drought_risk DOUBLE PRECISION NOT NULL,     -- 0 - 100%
    vegetation_stress DOUBLE PRECISION NOT NULL,-- 0 - 100%
    ecosystem_health DOUBLE PRECISION NOT NULL, -- 0 - 100
    model_version VARCHAR(64) NOT NULL DEFAULT 'heuristic_v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_ecosystem ON predictions(ecosystem_id, timestamp DESC);

-- 5. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    type VARCHAR(128) NOT NULL,               -- Fire Risk Increasing, Soil Moisture Warning, etc.
    severity VARCHAR(32) NOT NULL,            -- critical, warning, information
    location VARCHAR(255) NOT NULL,           -- e.g. Zone C or Northern Ridge
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_ecosystem_severity ON alerts(ecosystem_id, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);

-- 6. SIMULATION_HISTORY TABLE
CREATE TABLE IF NOT EXISTS simulation_history (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    temperature_change DOUBLE PRECISION NOT NULL,
    rainfall_change DOUBLE PRECISION NOT NULL,
    soil_moisture_change DOUBLE PRECISION NOT NULL,
    humidity_change DOUBLE PRECISION NOT NULL,
    current_health DOUBLE PRECISION NOT NULL,
    simulated_health DOUBLE PRECISION NOT NULL,
    current_fire_risk DOUBLE PRECISION NOT NULL,
    simulated_fire_risk DOUBLE PRECISION NOT NULL,
    current_drought_risk DOUBLE PRECISION NOT NULL,
    simulated_drought_risk DOUBLE PRECISION NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulation_history_ecosystem ON simulation_history(ecosystem_id, timestamp DESC);

-- 7. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    recommendation TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium', -- high, medium, low
    category VARCHAR(64) NOT NULL,
    target_zone VARCHAR(128) NOT NULL DEFAULT 'Entire Ecosystem',
    expected_impact TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_ecosystem_priority ON recommendations(ecosystem_id, priority);

-- ============================================================================
-- SEED DATA (For College Demo Initial Setup)
-- ============================================================================

INSERT INTO ecosystems (id, name, category, location, description, latitude, longitude, health_score, status)
VALUES
('forest-001', 'Bengaluru Forest Zone', 'Forest', 'Bannerghatta Range, Bengaluru, Karnataka', 'Sub-tropical deciduous and mixed evergreen woodland rich in endemic fauna, wild elephant migratory corridors, and dense shrub canopy.', 12.8009, 77.5777, 76.0, 'Healthy'),
('urban-park-001', 'Cubbon Urban Sanctuary', 'Urban Park', 'Central Bengaluru, Karnataka', 'Historical 300-acre botanical haven serving as a critical urban heat sink and carbon capture lung for the metropolitan core.', 12.9763, 77.5929, 68.0, 'Moderate Stress'),
('wetland-001', 'Bellandur Wetland Reserve', 'Wetland', 'Bellandur Basin, Bengaluru, Karnataka', 'Natural wetland retention basin performing bioremediation, water table recharging, and riparian avian habitat conservation.', 12.9298, 77.6740, 52.0, 'High Stress'),
('agri-001', 'Deccan Agricultural Basin', 'Agricultural Area', 'Doddaballapur Belt, Rural Karnataka', 'Agro-ecological zone cultivating millets, organic vegetables, and dryland horticulture under mixed drip and rainfed management.', 13.2941, 77.5401, 74.0, 'Healthy')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    health_score = EXCLUDED.health_score,
    status = EXCLUDED.status;

-- Seed Current Environmental Telemetry
INSERT INTO environment_data (id, ecosystem_id, timestamp, temperature, humidity, rainfall, soil_moisture, vegetation_health, air_quality)
VALUES
('env-f001-latest', 'forest-001', NOW(), 27.8, 62.0, 14.5, 48.0, 78.0, 84.0),
('env-up001-latest', 'urban-park-001', NOW(), 31.2, 48.0, 2.0, 39.0, 66.0, 58.0),
('env-w001-latest', 'wetland-001', NOW(), 26.5, 78.0, 22.0, 82.0, 54.0, 52.0),
('env-ag001-latest', 'agri-001', NOW(), 29.5, 54.0, 8.0, 42.0, 72.0, 79.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Ecosystem Zones for Bengaluru Forest Zone (forest-001)
INSERT INTO ecosystem_zones (id, ecosystem_id, zone_name, latitude, longitude, temperature, humidity, soil_moisture, vegetation_health, risk_level, canopy_density, dominant_species)
VALUES
('z-f01', 'forest-001', 'Zone A — Healthy Canopy', 12.8050, 77.5750, 26.4, 66.0, 56.0, 88.0, 'Low', 82.0, 'Teak & Sandalwood'),
('z-f02', 'forest-001', 'Zone B — Moderate Stress Slopes', 12.8020, 77.5790, 28.2, 59.0, 45.0, 74.0, 'Moderate', 64.0, 'Bamboo & Dry Acacia'),
('z-f03', 'forest-001', 'Zone C — High Stress Southern Border', 12.7970, 77.5810, 30.6, 49.0, 36.0, 58.0, 'High', 42.0, 'Scrub Shrubland'),
('z-f04', 'forest-001', 'Zone D — Water Catchment Reservoir', 12.8010, 77.5730, 25.8, 72.0, 74.0, 86.0, 'Low', 76.0, 'Riparian Ficus & Reeds')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Alerts
INSERT INTO alerts (id, ecosystem_id, type, severity, location, description, recommended_action, timestamp)
VALUES
('alt-101', 'forest-001', 'Fire Risk Increasing', 'warning', 'Zone C — Southern Border', 'Temperature has increased by 3.2°C above seasonal mean and soil moisture has fallen to 36% in dry scrub perimeter.', 'Deploy localized misting and increase thermal drone patrols across boundary sectors.', NOW() - INTERVAL '2 hours'),
('alt-102', 'forest-001', 'Soil Moisture Warning', 'warning', 'Zone C — High Stress Slopes', 'Volumetric soil moisture depleted past 40% threshold over 48 consecutive hours.', 'Initiate auxiliary check-dam retention releases into southern drainage gullies.', NOW() - INTERVAL '5 hours'),
('alt-103', 'forest-001', 'Vegetation Stress', 'information', 'Zone B — Moderate Slopes', 'NDVI satellite proxy reflects 6.4% photosynthetic vigor reduction over past 7 days.', 'Sample soil nitrate levels and schedule organic mulch coverage.', NOW() - INTERVAL '1 day'),
('alt-104', 'wetland-001', 'Eutrophication Risk', 'critical', 'North Inflow Sector', 'Dissolved oxygen dropping following agricultural runoff surge into littoral edge.', 'Activate mechanical surface aeration and divert storm runoff bypass channel.', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;
