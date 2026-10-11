export interface EcosystemData {
  id: string;
  name: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  health_score: number;
  status: string;
  current_environment: {
    id: string;
    ecosystem_id: string;
    timestamp: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    soil_moisture: number;
    vegetation_health: number;
    air_quality: number;
  };
  zones: {
    zone_id: string;
    ecosystem_id: string;
    zone_name: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    vegetation_health: number;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
    canopy_density?: number;
    dominant_species?: string;
  }[];
}

export const INITIAL_ECOSYSTEMS: Record<string, EcosystemData> = {
  'forest-001': {
    id: 'forest-001',
    name: 'Bengaluru Forest Zone',
    category: 'Forest',
    location: 'Bannerghatta National Sanctuary, Bengaluru, Karnataka',
    latitude: 12.8009,
    longitude: 77.5777,
    health_score: 76.0,
    status: 'Healthy',
    description: 'Sub-tropical deciduous and mixed evergreen woodland rich in endemic fauna, wild elephant migratory corridors, and dense shrub canopy.',
    current_environment: {
      id: 'env-forest-001-live',
      ecosystem_id: 'forest-001',
      timestamp: new Date().toISOString(),
      temperature: 27.8,
      humidity: 62.0,
      rainfall: 14.5,
      soil_moisture: 48.0,
      vegetation_health: 78.0,
      air_quality: 84.0,
    },
    zones: [
      {
        zone_id: 'zone-a',
        ecosystem_id: 'forest-001',
        zone_name: 'Zone A — Healthy Canopy Core',
        latitude: 12.805,
        longitude: 77.575,
        temperature: 26.4,
        humidity: 66.0,
        soil_moisture: 56.0,
        vegetation_health: 88.0,
        risk_level: 'Low',
        canopy_density: 82,
        dominant_species: 'Teak, Rosewood & Sandalwood',
      },
      {
        zone_id: 'zone-b',
        ecosystem_id: 'forest-001',
        zone_name: 'Zone B — Moderate Stress Slopes',
        latitude: 12.802,
        longitude: 77.579,
        temperature: 28.2,
        humidity: 59.0,
        soil_moisture: 45.0,
        vegetation_health: 74.0,
        risk_level: 'Moderate',
        canopy_density: 64,
        dominant_species: 'Bamboo Clumps & Dry Acacia',
      },
      {
        zone_id: 'zone-c',
        ecosystem_id: 'forest-001',
        zone_name: 'Zone C — High Stress Southern Border',
        latitude: 12.797,
        longitude: 77.581,
        temperature: 30.6,
        humidity: 49.0,
        soil_moisture: 36.0,
        vegetation_health: 58.0,
        risk_level: 'High',
        canopy_density: 42,
        dominant_species: 'Dry Deciduous Scrub & Lantana',
      },
      {
        zone_id: 'zone-d',
        ecosystem_id: 'forest-001',
        zone_name: 'Zone D — Water Catchment Reservoir',
        latitude: 12.801,
        longitude: 77.573,
        temperature: 25.8,
        humidity: 72.0,
        soil_moisture: 74.0,
        vegetation_health: 86.0,
        risk_level: 'Low',
        canopy_density: 76,
        dominant_species: 'Riparian Ficus & Reeds',
      },
    ],
  },
  'urban-park-001': {
    id: 'urban-park-001',
    name: 'Cubbon Urban Sanctuary',
    category: 'Urban Park',
    location: 'Central Bengaluru District, Karnataka',
    latitude: 12.9763,
    longitude: 77.5929,
    health_score: 68.0,
    status: 'Moderate Stress',
    description: 'Historical 300-acre botanical haven serving as a vital urban microclimate buffer, heat island reducer, and carbon sink.',
    current_environment: {
      id: 'env-up-001-live',
      ecosystem_id: 'urban-park-001',
      timestamp: new Date().toISOString(),
      temperature: 31.2,
      humidity: 48.0,
      rainfall: 2.0,
      soil_moisture: 39.0,
      vegetation_health: 66.0,
      air_quality: 58.0,
    },
    zones: [
      {
        zone_id: 'up-a',
        ecosystem_id: 'urban-park-001',
        zone_name: 'Zone A — Heritage Bamboo Grove',
        latitude: 12.977,
        longitude: 77.592,
        temperature: 29.8,
        humidity: 52.0,
        soil_moisture: 46.0,
        vegetation_health: 74.0,
        risk_level: 'Low',
        canopy_density: 75,
        dominant_species: 'Giant Bamboo & Gulmohar',
      },
      {
        zone_id: 'up-b',
        ecosystem_id: 'urban-park-001',
        zone_name: 'Zone B — Perimeter Traffic Margin',
        latitude: 12.975,
        longitude: 77.594,
        temperature: 32.5,
        humidity: 44.0,
        soil_moisture: 32.0,
        vegetation_health: 58.0,
        risk_level: 'Moderate',
        canopy_density: 48,
        dominant_species: 'Avenue Rain Trees',
      },
    ],
  },
  'wetland-001': {
    id: 'wetland-001',
    name: 'Bellandur Wetland Reserve',
    category: 'Wetland',
    location: 'Bellandur Drainage Basin, Bengaluru, Karnataka',
    latitude: 12.9298,
    longitude: 77.674,
    health_score: 52.0,
    status: 'High Stress',
    description: 'Freshwater retention basin and marsh biome supporting bioremediation, migratory birds, and hydrological detention.',
    current_environment: {
      id: 'env-wt-001-live',
      ecosystem_id: 'wetland-001',
      timestamp: new Date().toISOString(),
      temperature: 26.5,
      humidity: 78.0,
      rainfall: 22.0,
      soil_moisture: 82.0,
      vegetation_health: 54.0,
      air_quality: 52.0,
    },
    zones: [
      {
        zone_id: 'wt-a',
        ecosystem_id: 'wetland-001',
        zone_name: 'Zone A — Open Water Bio-Basin',
        latitude: 12.931,
        longitude: 77.672,
        temperature: 25.9,
        humidity: 82.0,
        soil_moisture: 92.0,
        vegetation_health: 60.0,
        risk_level: 'Moderate',
        canopy_density: 25,
        dominant_species: 'Water Hyacinth & Duckweed',
      },
      {
        zone_id: 'wt-b',
        ecosystem_id: 'wetland-001',
        zone_name: 'Zone B — Littoral Reed Buffer',
        latitude: 12.928,
        longitude: 77.676,
        temperature: 27.1,
        humidity: 74.0,
        soil_moisture: 72.0,
        vegetation_health: 48.0,
        risk_level: 'High',
        canopy_density: 40,
        dominant_species: 'Typha Reeds & Marsh Grass',
      },
    ],
  },
  'agri-001': {
    id: 'agri-001',
    name: 'Deccan Agricultural Basin',
    category: 'Agricultural Area',
    location: 'Doddaballapur Belt, Rural Karnataka',
    latitude: 13.2941,
    longitude: 77.5401,
    health_score: 74.0,
    status: 'Healthy',
    description: 'Agro-ecological farmland cultivating finger millet (ragi), pulses, and organic vegetables with conservation tillage.',
    current_environment: {
      id: 'env-ag-001-live',
      ecosystem_id: 'agri-001',
      timestamp: new Date().toISOString(),
      temperature: 29.5,
      humidity: 54.0,
      rainfall: 8.0,
      soil_moisture: 42.0,
      vegetation_health: 72.0,
      air_quality: 79.0,
    },
    zones: [
      {
        zone_id: 'ag-a',
        ecosystem_id: 'agri-001',
        zone_name: 'Zone A — Precision Drip Millet Plot',
        latitude: 13.295,
        longitude: 77.539,
        temperature: 28.9,
        humidity: 56.0,
        soil_moisture: 48.0,
        vegetation_health: 78.0,
        risk_level: 'Low',
        canopy_density: 65,
        dominant_species: 'Eleusine coracana (Finger Millet)',
      },
      {
        zone_id: 'ag-b',
        ecosystem_id: 'agri-001',
        zone_name: 'Zone B — Rainfed Terraced Fallows',
        latitude: 13.293,
        longitude: 77.542,
        temperature: 30.1,
        humidity: 52.0,
        soil_moisture: 36.0,
        vegetation_health: 66.0,
        risk_level: 'Moderate',
        canopy_density: 35,
        dominant_species: 'Fallow Legumes & Grasses',
      },
    ],
  },
};

// Simulation mathematical engine matching predictor.py
export function computeSimulation(
  eco: EcosystemData,
  inputs: {
    temperature_change: number;
    rainfall_change: number;
    soil_moisture_change: number;
    humidity_change: number;
  }
) {
  const env = eco.current_environment;
  
  // Baseline health
  const currentHealth = eco.health_score;
  const currentFireRisk = Math.min(95, Math.max(5, Math.round(
    (Math.max(0, env.temperature - 20) * 3.5 * 0.4) +
    (Math.max(0, 65 - env.humidity) * 1.1 * 0.35) +
    (Math.max(0, 55 - env.soil_moisture) * 1.3 * 0.35) -
    (Math.min(35, env.rainfall * 1.8))
  )));
  const currentDroughtRisk = Math.min(95, Math.max(5, Math.round(
    (Math.max(0, 60 - env.soil_moisture) * 1.25 * 0.45) +
    (Math.max(0, 25 - env.rainfall) * 1.6 * 0.35)
  )));
  const currentVegHealth = env.vegetation_health;

  // Simulated telemetry
  const simTemp = env.temperature + inputs.temperature_change;
  const simRain = Math.max(0, env.rainfall * (1 + inputs.rainfall_change / 100));
  const simSoil = Math.max(2, Math.min(98, env.soil_moisture * (1 + inputs.soil_moisture_change / 100)));
  const simHumid = Math.max(10, Math.min(98, env.humidity * (1 + inputs.humidity_change / 100)));

  const vegImpact = (inputs.soil_moisture_change * 0.35) + (inputs.rainfall_change * 0.15) - (Math.max(0, inputs.temperature_change) * 2.2);
  const simVeg = Math.min(98, Math.max(5, Math.round(env.vegetation_health + vegImpact)));

  // Simulated risks
  const simFire = Math.min(98, Math.max(5, Math.round(
    (Math.max(0, simTemp - 20) * 3.5 * 0.4) +
    (Math.max(0, 65 - simHumid) * 1.1 * 0.35) +
    (Math.max(0, 55 - simSoil) * 1.3 * 0.35) -
    (Math.min(35, simRain * 1.8))
  )));

  const simDrought = Math.min(95, Math.max(5, Math.round(
    (Math.max(0, 60 - simSoil) * 1.25 * 0.45) +
    (Math.max(0, 25 - simRain) * 1.6 * 0.35) +
    (Math.max(0, simTemp - 22) * 1.8 * 0.2)
  )));

  // Simulated composite health
  const simWater = Math.min(100, Math.max(5, (simSoil * 0.7) + (Math.min(50, simRain * 2.2) * 0.3)));
  const simSoilCond = Math.min(100, Math.max(5, simSoil * 1.15));
  const simClimStab = Math.min(100, Math.max(5, 100 - (Math.abs(simTemp - 25) * 2.8) - (Math.abs(simHumid - 60) * 0.6)));

  const simHealth = Math.min(100, Math.max(5, Math.round(
    (simVeg * 0.3) +
    (simSoilCond * 0.25) +
    (simWater * 0.2) +
    (simClimStab * 0.15) +
    (env.air_quality * 0.1)
  )));

  let explanation = '';
  if (inputs.temperature_change > 0) {
    explanation += `Temperature rise (+${inputs.temperature_change}°C) accelerates evapotranspiration. `;
  } else if (inputs.temperature_change < 0) {
    explanation += `Temperature reduction (${inputs.temperature_change}°C) relaxes thermal stress. `;
  }
  if (inputs.soil_moisture_change < 0 || inputs.rainfall_change < 0) {
    explanation += `Moisture deficit elevates drought risk by ${Math.abs(simDrought - currentDroughtRisk)}% and fire risk by ${Math.abs(simFire - currentFireRisk)}%. `;
  } else {
    explanation += `Hydrological replenishment enhances canopy resilience by ${Math.max(0, simHealth - currentHealth)} points. `;
  }
  explanation += `Overall ecosystem health adjusts from ${currentHealth} to ${simHealth}.`;

  return {
    simulation_id: `sim-${Math.random().toString(36).substring(2, 9)}`,
    ecosystem_id: eco.id,
    timestamp: new Date().toISOString(),
    inputs,
    current: {
      health: currentHealth,
      fire_risk: currentFireRisk,
      drought_risk: currentDroughtRisk,
      vegetation_health: currentVegHealth,
    },
    simulated: {
      health: simHealth,
      fire_risk: simFire,
      drought_risk: simDrought,
      vegetation_health: simVeg,
    },
    deltas: {
      health_delta: simHealth - currentHealth,
      fire_risk_delta: simFire - currentFireRisk,
      drought_risk_delta: simDrought - currentDroughtRisk,
      vegetation_health_delta: simVeg - currentVegHealth,
    },
    explanation,
    simulation_type: 'rule_based_estimate',
    disclaimer: 'Simulation estimate — ML model can be connected later.',
  };
}
