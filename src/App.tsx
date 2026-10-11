import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Globe2,
  Layers,
  Leaf,
  Maximize2,
  Play,
  RotateCcw,
  Send,
  Sliders,
  Sparkles,
  Terminal,
  Thermometer,
  Trees,
  Droplets,
  Wind
} from 'lucide-react';
import { INITIAL_ECOSYSTEMS, computeSimulation, EcosystemData } from './services/earthtwinData';
import { BACKEND_FILES, BackendFile } from './data/backendFiles';

type ActiveTab = 'overview' | 'simulation' | 'assistant' | 'api-tester' | 'code-hub' | 'connect-guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedEcoId, setSelectedEcoId] = useState<string>('forest-001');
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'information'>('all');
  
  // Current Ecosystem State
  const currentEco = INITIAL_ECOSYSTEMS[selectedEcoId] || INITIAL_ECOSYSTEMS['forest-001'];
  
  // Simulation State
  const [simInputs, setSimInputs] = useState({
    temperature_change: 2.0,
    rainfall_change: -20.0,
    soil_moisture_change: -15.0,
    humidity_change: -10.0,
  });
  const [simResult, setSimResult] = useState<any>(() => computeSimulation(currentEco, simInputs));
  const [simHistory, setSimHistory] = useState<any[]>([simResult]);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `Hello! I am the EarthTwin Digital Twin Assistant for ${currentEco.name}. I analyze real-time environmental telemetry, risk indicators, and ecological vulnerabilities. How can I help you today?`,
      time: '10:00 AM'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/ecosystems');
  const [apiResponse, setApiResponse] = useState<string>('Click "Execute Endpoint" below to view live API payload.');
  const [apiLoading, setApiLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Backend File Explorer State
  const [selectedFile, setSelectedFile] = useState<BackendFile>(BACKEND_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);

  // Handlers
  const handleRunSimulation = () => {
    const res = computeSimulation(currentEco, simInputs);
    setSimResult(res);
    setSimHistory(prev => [res, ...prev.slice(0, 7)]);
  };

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: questionText, time: now };
    setChatMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = questionText.toLowerCase();
      const env = currentEco.current_environment;

      if (q.includes('risk') || q.includes('why') || q.includes('stress')) {
        reply = `${currentEco.name} is currently under environmental stress due to soil moisture falling to ${env.soil_moisture}% and temperature elevated at ${env.temperature}°C. Fire hazard is moderate and Zone C (Southern Border) exhibits the highest physiological stress.`;
      } else if (q.includes('temperature') || q.includes('2') || q.includes('rise')) {
        reply = `If temperature increases by 2°C, evapotranspiration will accelerate, drawing root-zone moisture below 38%. Our What-If simulation predicts fire risk would escalate by +17% and overall ecosystem health would decline from ${currentEco.health_score} to 61.`;
      } else if (q.includes('soil') || q.includes('moisture') || q.includes('water')) {
        reply = `Soil moisture in ${currentEco.name} is currently measured at ${env.soil_moisture}%. It has experienced reduced precipitation (${env.rainfall}mm accumulated) and high atmospheric evaporative demand over consecutive cycles.`;
      } else if (q.includes('improve') || q.includes('vegetation') || q.includes('action')) {
        reply = `To improve canopy vigor in ${currentEco.name}: 1) Introduce organic mulch along exposed root sectors in Zone C, 2) Construct micro check-dams to retain monsoon run-off, 3) Plant endemic drought-hardy saplings (Teak, Rosewood, Bamboo).`;
      } else if (q.includes('fire')) {
        reply = `Fire risk is currently 58% (Medium) driven by dry understory brush and low relative humidity (${env.humidity}%). Sustained solar radiation increases combustible surface fuel along boundary trails.`;
      } else {
        reply = `Status for ${currentEco.name}: Composite Health is ${currentEco.health_score}/100 (${currentEco.status}). Telemetry: ${env.temperature}°C, ${env.humidity}% humidity, ${env.soil_moisture}% soil moisture, and ${env.rainfall}mm rainfall.`;
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleTestApi = () => {
    setApiLoading(true);
    setTimeout(() => {
      let data: any = {};
      const env = currentEco.current_environment;

      switch (apiEndpoint) {
        case '/api/health':
          data = { status: 'online', service: 'EarthTwin Backend', version: '1.0.0', mode: 'In-Memory Realistic Mock Mode' };
          break;
        case '/api/ecosystems':
          data = Object.values(INITIAL_ECOSYSTEMS).map(e => ({
            id: e.id,
            name: e.name,
            category: e.category,
            location: e.location,
            health_score: e.health_score,
            status: e.status
          }));
          break;
        case `/api/ecosystems/${currentEco.id}`:
          data = currentEco;
          break;
        case `/api/environment/${currentEco.id}`:
          data = env;
          break;
        case `/api/health/${currentEco.id}`:
          data = {
            ecosystem_id: currentEco.id,
            overall_score: currentEco.health_score,
            status: currentEco.status,
            vegetation_health: env.vegetation_health,
            water_condition: 68.0,
            air_quality: env.air_quality,
            soil_condition: Math.round(env.soil_moisture * 1.15),
            climate_stability: 74.0,
            explanation: `${currentEco.name} is currently healthy, but decreasing soil moisture in peripheral zones requires continuous telemetry monitoring.`,
            calculation_method: 'rule_based_weighted_composite'
          };
          break;
        case `/api/risks/${currentEco.id}`:
          data = {
            ecosystem_id: currentEco.id,
            fire_risk: { level: 'Medium', percentage: 58.0, explanation: 'High temperature and low soil moisture are increasing combustible fuel.' },
            drought_risk: { level: 'Moderate', percentage: 52.0, explanation: 'Moisture deficit exceeding seasonal infiltration rate.' },
            vegetation_stress: { level: 'Low', percentage: 25.0, explanation: 'Canopy is physiologically resilient.' },
            flood_risk: { level: 'Low', percentage: 12.0, explanation: 'Groundwater detention reservoir functioning normally.' }
          };
          break;
        case '/api/simulation/run':
          data = computeSimulation(currentEco, simInputs);
          break;
        case `/api/alerts/${currentEco.id}`:
          data = {
            ecosystem_id: currentEco.id,
            filter_applied: alertFilter,
            total_alerts: 3,
            alerts: [
              {
                id: 'alt-101',
                type: 'Fire Risk Increasing',
                severity: 'warning',
                location: 'Zone C — Southern Border',
                description: `Temperature at ${env.temperature}°C and soil moisture fallen to ${env.soil_moisture}%.`,
                recommended_action: 'Deploy localized misting and increase thermal drone patrols across boundary sectors.'
              },
              {
                id: 'alt-102',
                type: 'Soil Moisture Warning',
                severity: 'warning',
                location: 'Zone C & Slopes',
                description: 'Volumetric soil moisture depleted below 40% threshold.',
                recommended_action: 'Initiate auxiliary check-dam retention releases into southern drainage gullies.'
              },
              {
                id: 'alt-103',
                type: 'Vegetation Stress',
                severity: 'information',
                location: 'Zone B — Slopes',
                description: 'NDVI satellite proxy reflects 6.4% photosynthetic vigor reduction over past 7 days.',
                recommended_action: 'Sample soil nitrate levels and schedule organic mulch coverage.'
              }
            ]
          };
          break;
        case `/api/recommendations/${currentEco.id}`:
          data = {
            ecosystem_id: currentEco.id,
            total: 3,
            recommendations: [
              { id: 'rec-1', title: 'Monitor dry vegetation in Zone C', priority: 'high', category: 'Fire Prevention' },
              { id: 'rec-2', title: 'Consider precision drip hydration', priority: 'medium', category: 'Irrigation' },
              { id: 'rec-3', title: 'Prioritize stressed zones for native sapling planting', priority: 'high', category: 'Restoration' }
            ]
          };
          break;
        default:
          data = { message: 'Endpoint executed successfully', endpoint: apiEndpoint };
      }

      setApiResponse(JSON.stringify(data, null, 2));
      setApiLoading(false);
    }, 350);
  };

  const copyToClipboard = (text: string, type: 'curl' | 'file') => {
    navigator.clipboard.writeText(text);
    if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  // Alerts based on current ecosystem
  const alertsList = [
    {
      id: 'alt-01',
      type: 'Fire Risk Increasing',
      severity: 'warning' as const,
      location: 'Zone C — Southern Border',
      time: '2 hours ago',
      desc: `Temperature has increased by 3.2°C above mean and soil moisture depleted to ${currentEco.current_environment.soil_moisture}%.`,
      action: 'Deploy localized misting and increase thermal drone patrols across boundary sectors.'
    },
    {
      id: 'alt-02',
      type: 'Soil Moisture Warning',
      severity: 'warning' as const,
      location: 'Zone C — High Stress Slopes',
      time: '5 hours ago',
      desc: 'Water availability is decreasing in Zone C. Moisture has remained below 40% for 48 hours.',
      action: 'Initiate auxiliary check-dam retention releases into southern drainage gullies.'
    },
    {
      id: 'alt-03',
      type: 'Vegetation Stress',
      severity: 'information' as const,
      location: 'Zone B — Moderate Slopes',
      time: '1 day ago',
      desc: 'NDVI satellite proxy reflects 6.4% photosynthetic vigor reduction over past 7 days.',
      action: 'Sample soil nitrate levels and schedule organic mulch coverage across exposed roots.'
    },
    {
      id: 'alt-04',
      type: 'Catchment Siltation Warning',
      severity: 'critical' as const,
      location: 'Zone D — Catchment Basin',
      time: 'Just now',
      desc: 'Runoff velocity in drainage channels approaching hydraulic threshold during rain bursts.',
      action: 'Inspect stone rip-rap buffers and clear emergency spillway.'
    }
  ].filter(a => alertFilter === 'all' || a.severity === alertFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* TOP HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">EarthTwin</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono">
                  FastAPI · Supabase Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Digital Twin for Outdoor Ecosystems · College Engineering Backend & Explorer
              </p>
            </div>
          </div>

          {/* Ecosystem Selector & Quick Telemetry Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <label htmlFor="ecosystem-select" className="text-slate-400 font-medium">Biome:</label>
              <select
                id="ecosystem-select"
                value={selectedEcoId}
                onChange={e => setSelectedEcoId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {Object.values(INITIAL_ECOSYSTEMS).map(eco => (
                  <option key={eco.id} value={eco.id} className="bg-slate-900 text-slate-100">
                    {eco.name} ({eco.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Health: <strong className="text-emerald-400">{currentEco.health_score}/100</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Digital Twin Explorer
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            What-If Simulation Studio
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Assistant Chat
          </button>

          <button
            onClick={() => setActiveTab('api-tester')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'api-tester'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live API Console & Tester
          </button>

          <button
            onClick={() => setActiveTab('code-hub')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'code-hub'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Backend Source Files ({BACKEND_FILES.length})
          </button>

          <button
            onClick={() => setActiveTab('connect-guide')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'connect-guide'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            React Connection Guide
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: DIGITAL TWIN EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Ecosystem Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{currentEco.name}</h1>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      {currentEco.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 max-w-2xl">{currentEco.description}</p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span>📍 GPS Coordinates: {currentEco.latitude.toFixed(4)}° N, {currentEco.longitude.toFixed(4)}° E</span>
                    <span className="mx-2">·</span>
                    <span>{currentEco.location}</span>
                  </p>
                </div>

                {/* Overall Score Badge */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4 shrink-0">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400"
                        strokeDasharray={`${currentEco.health_score}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-lg font-bold text-white font-mono">{currentEco.health_score}</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Health Score</div>
                    <div className="text-sm font-semibold text-emerald-400">{currentEco.status}</div>
                    <div className="text-xs text-slate-500">0 - 100 Scale</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Temperature</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.temperature}°C
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Thermal Level</div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Humidity</span>
                  <Wind className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.humidity}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Relative Hum.</div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Soil Moisture</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.soil_moisture}%
                </div>
                <div className="text-[11px] text-amber-400 mt-1">Sub-optimal</div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Rainfall</span>
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.rainfall}mm
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Accumulation</div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Vegetation Health</span>
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.vegetation_health}/100
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">NDVI Proxy</div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                  <span>Air Quality</span>
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {currentEco.current_environment.air_quality}/100
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Clean Purity</div>
              </div>
            </div>

            {/* Micro-Climate Zones Grid & Risk Gauges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Zones Map / Grid */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Ecosystem Micro-Climate Zones ({currentEco.zones.length})
                    </h2>
                    <p className="text-xs text-slate-400">Spatial partitions with micro-climate telemetry</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">GET /api/ecosystems/{currentEco.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentEco.zones.map(zone => {
                    const isHigh = zone.risk_level === 'High' || zone.risk_level === 'Severe';
                    const isMod = zone.risk_level === 'Moderate';
                    return (
                      <div
                        key={zone.zone_id}
                        className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-200">{zone.zone_name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                              isHigh
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isMod
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {zone.risk_level} Risk
                          </span>
                        </div>

                        {zone.dominant_species && (
                          <div className="text-[11px] text-slate-400">
                            🌿 <span className="text-slate-300">{zone.dominant_species}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                          <div>
                            <div className="text-[10px] text-slate-500">Temp</div>
                            <div className="font-mono text-slate-200">{zone.temperature}°C</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Humidity</div>
                            <div className="font-mono text-slate-200">{zone.humidity}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Soil Moist.</div>
                            <div className="font-mono text-slate-200">{zone.soil_moisture}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Veg Index</div>
                            <div className="font-mono text-slate-200">{zone.vegetation_health}/100</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health Score 5-Pillar Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    5-Pillar Health Score Breakdown
                  </h2>
                  <p className="text-xs text-slate-400">Transparent mathematical weight calculation</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Vegetation Health (30% weight)</span>
                      <span className="font-mono font-medium">{currentEco.current_environment.vegetation_health}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${currentEco.current_environment.vegetation_health}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Soil Condition (25% weight)</span>
                      <span className="font-mono font-medium">55.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '55.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Water Condition (20% weight)</span>
                      <span className="font-mono font-medium">68.0%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Climate Stability (15% weight)</span>
                      <span className="font-mono font-medium">91.0%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400" style={{ width: '91%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Air Quality (10% weight)</span>
                      <span className="font-mono font-medium">{currentEco.current_environment.air_quality}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400" style={{ width: `${currentEco.current_environment.air_quality}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-400">
                  <div className="font-medium text-slate-300 mb-1">Diagnostic Summary:</div>
                  The ecosystem is currently stable, but declining soil moisture in Zone C requires monitoring before fire season.
                </div>
              </div>
            </div>

            {/* Risk Analysis Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Multi-Risk Evaluation Matrix
                  </h2>
                  <p className="text-xs text-slate-400">Preliminary rule-based calculations (ready for ML model replacement)</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">GET /api/risks/{currentEco.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Fire Risk
                    </span>
                    <span className="text-amber-400 font-semibold">Medium</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">58%</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: '58%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Ambient temperature ({currentEco.current_environment.temperature}°C) and dry litter increase fire hazard along perimeter trails.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-orange-400" />
                      Drought Risk
                    </span>
                    <span className="text-orange-400 font-semibold">Moderate</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">52%</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400" style={{ width: '52%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Evapotranspiration rate exceeds soil water recharge, depleting root-zone moisture reserves.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      Vegetation Stress
                    </span>
                    <span className="text-emerald-400 font-semibold">Low</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">25%</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: '25%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Vegetation is physiologically vibrant with active transpiration across the main core sanctuary.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      Flood Risk
                    </span>
                    <span className="text-blue-400 font-semibold">Low</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">12%</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: '12%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Permeable soil and detention buffer retain standard rainwater run-off.
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts Center with Filtering */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Active Environmental Alerts ({alertsList.length})
                  </h2>
                  <p className="text-xs text-slate-400">Triggered based on environmental sensor thresholds</p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
                  {(['all', 'critical', 'warning', 'information'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setAlertFilter(f)}
                      className={`px-2.5 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                        alertFilter === f
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alertsList.map(alert => (
                  <div
                    key={alert.id}
                    className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{alert.type}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold border ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed">{alert.desc}</p>

                    <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300">
                      <strong className="text-emerald-400">Recommended Action:</strong> {alert.action}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>📍 {alert.location}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WHAT-IF SIMULATION STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    What-If Ecological Simulation Studio
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Run predictive climate change scenarios by adjusting temperature, rainfall, soil moisture, and humidity deltas.
                    The engine computes the projected impact on overall ecosystem health, fire hazard, drought risk, and vegetation vigor.
                  </p>
                </div>
                <div className="text-xs px-3 py-1.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
                  POST /api/simulation/run
                </div>
              </div>
            </div>

            {/* Interactive Sliders & Live Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sliders Control Panel */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <h2 className="text-sm font-semibold text-white">Scenario Delta Controls</h2>

                {/* Temperature Slider (-5 to +10) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Temperature Change</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {simInputs.temperature_change > 0 ? `+${simInputs.temperature_change}` : simInputs.temperature_change}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-5.0"
                    max="10.0"
                    step="0.5"
                    value={simInputs.temperature_change}
                    onChange={e => setSimInputs({ ...simInputs, temperature_change: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-5.0°C</span>
                    <span>Baseline (0.0°C)</span>
                    <span>+10.0°C</span>
                  </div>
                </div>

                {/* Rainfall Slider (-50 to +50) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Rainfall Change</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      {simInputs.rainfall_change > 0 ? `+${simInputs.rainfall_change}` : simInputs.rainfall_change}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={simInputs.rainfall_change}
                    onChange={e => setSimInputs({ ...simInputs, rainfall_change: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-50% (Drought)</span>
                    <span>0%</span>
                    <span>+50% (Monsoon)</span>
                  </div>
                </div>

                {/* Soil Moisture Slider (-50 to +50) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Soil Moisture Change</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {simInputs.soil_moisture_change > 0 ? `+${simInputs.soil_moisture_change}` : simInputs.soil_moisture_change}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={simInputs.soil_moisture_change}
                    onChange={e => setSimInputs({ ...simInputs, soil_moisture_change: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                {/* Humidity Slider (-30 to +30) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Relative Humidity Change</span>
                    <span className="font-mono text-sky-400 font-semibold">
                      {simInputs.humidity_change > 0 ? `+${simInputs.humidity_change}` : simInputs.humidity_change}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={simInputs.humidity_change}
                    onChange={e => setSimInputs({ ...simInputs, humidity_change: parseFloat(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-30%</span>
                    <span>0%</span>
                    <span>+30%</span>
                  </div>
                </div>

                {/* Run Simulation & Reset Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleRunSimulation}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run What-If Simulation
                  </button>

                  <button
                    onClick={() => {
                      setSimInputs({
                        temperature_change: 0.0,
                        rainfall_change: 0.0,
                        soil_moisture_change: 0.0,
                        humidity_change: 0.0,
                      });
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Reset to 0 deltas"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  ⚠️ <strong className="text-slate-300">College Demo Notice:</strong> {simResult.disclaimer}
                </div>
              </div>

              {/* Comparative Results Display */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Simulation Comparative Outcome</h2>
                    <p className="text-xs text-slate-400">Baseline Digital Twin vs Simulated Stressed State</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    ID: {simResult.simulation_id}
                  </span>
                </div>

                {/* 4 Metrics Comparison Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="text-xs text-slate-400 font-medium">Ecosystem Health</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-white">{simResult.simulated.health}</span>
                      <span className="text-xs text-slate-500 font-mono">from {simResult.current.health}</span>
                      <span
                        className={`text-xs font-mono font-semibold ml-auto ${
                          simResult.deltas.health_delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {simResult.deltas.health_delta >= 0 ? `+${simResult.deltas.health_delta}` : simResult.deltas.health_delta}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${simResult.simulated.health >= 65 ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ width: `${simResult.simulated.health}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="text-xs text-slate-400 font-medium">Fire Risk</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-amber-400">{simResult.simulated.fire_risk}%</span>
                      <span className="text-xs text-slate-500 font-mono">from {simResult.current.fire_risk}%</span>
                      <span
                        className={`text-xs font-mono font-semibold ml-auto ${
                          simResult.deltas.fire_risk_delta > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {simResult.deltas.fire_risk_delta >= 0 ? `+${simResult.deltas.fire_risk_delta}%` : `${simResult.deltas.fire_risk_delta}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${simResult.simulated.fire_risk}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="text-xs text-slate-400 font-medium">Drought Risk</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-orange-400">{simResult.simulated.drought_risk}%</span>
                      <span className="text-xs text-slate-500 font-mono">from {simResult.current.drought_risk}%</span>
                      <span
                        className={`text-xs font-mono font-semibold ml-auto ${
                          simResult.deltas.drought_risk_delta > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {simResult.deltas.drought_risk_delta >= 0 ? `+${simResult.deltas.drought_risk_delta}%` : `${simResult.deltas.drought_risk_delta}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400" style={{ width: `${simResult.simulated.drought_risk}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="text-xs text-slate-400 font-medium">Vegetation Health (NDVI)</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-emerald-400">{simResult.simulated.vegetation_health}</span>
                      <span className="text-xs text-slate-500 font-mono">from {simResult.current.vegetation_health}</span>
                      <span
                        className={`text-xs font-mono font-semibold ml-auto ${
                          simResult.deltas.vegetation_health_delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {simResult.deltas.vegetation_health_delta >= 0
                          ? `+${simResult.deltas.vegetation_health_delta}`
                          : simResult.deltas.vegetation_health_delta}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${simResult.simulated.vegetation_health}%` }} />
                    </div>
                  </div>
                </div>

                {/* Automated Explanation Box */}
                <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Analytical Explanation of Simulated Trajectory:
                  </div>
                  <p className="text-slate-300 leading-relaxed">{simResult.explanation}</p>
                </div>

                {/* Simulation History Log */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-400">Simulation Run History ({simHistory.length}):</div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {simHistory.map((h, i) => (
                      <div
                        key={h.simulation_id + i}
                        className="p-2 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between text-[11px]"
                      >
                        <span className="font-mono text-slate-400">{h.simulation_id}</span>
                        <span className="text-slate-300">
                          ΔTemp: {h.inputs.temperature_change > 0 ? `+${h.inputs.temperature_change}` : h.inputs.temperature_change}°C · ΔRain: {h.inputs.rainfall_change}%
                        </span>
                        <span className="font-mono text-emerald-400">
                          Health: {h.current.health} → {h.simulated.health}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI DIGITAL TWIN ASSISTANT */}
        {/* ========================================================================= */}
        {activeTab === 'assistant' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[650px]">
            {/* Assistant Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">EarthTwin AI Assistant</h2>
                  <p className="text-xs text-slate-400">Domain-grounded reasoning with live telemetry context</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                source: earthtwin_rule_based_assistant
              </span>
            </div>

            {/* Suggested Prompt Chips */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-500 text-[11px] whitespace-nowrap">Suggested:</span>
              {[
                'Why is the ecosystem at risk?',
                'What happens if temperature increases by 2°C?',
                'Why is soil moisture decreasing?',
                'How can vegetation health be improved?',
                'What is the current fire risk?'
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleAskQuestion(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer text-[11px]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {msg.sender === 'user' ? 'You' : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-md">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about ecosystem risk, temperature shifts, soil depletion..."
                value={inputQuestion}
                onChange={e => setInputQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskQuestion(inputQuestion)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleAskQuestion(inputQuestion)}
                disabled={!inputQuestion.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE API CONSOLE & TESTER */}
        {/* ========================================================================= */}
        {activeTab === 'api-tester' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Live API Console & Endpoint Explorer
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Interact with the exact FastAPI endpoints. Test request parameters and inspect formatted JSON responses.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Endpoint Selector & Request Config */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">Select API Route</h2>

                <div className="space-y-1.5">
                  {[
                    { label: 'System Health Check', route: '/api/health', method: 'GET' },
                    { label: 'List All Ecosystems', route: '/api/ecosystems', method: 'GET' },
                    { label: 'Ecosystem Detail & Zones', route: `/api/ecosystems/${currentEco.id}`, method: 'GET' },
                    { label: 'Latest Environment Telemetry', route: `/api/environment/${currentEco.id}`, method: 'GET' },
                    { label: 'Health Score (0-100)', route: `/api/health/${currentEco.id}`, method: 'GET' },
                    { label: 'Risk Analysis (Fire/Drought)', route: `/api/risks/${currentEco.id}`, method: 'GET' },
                    { label: 'Execute What-If Simulation', route: '/api/simulation/run', method: 'POST' },
                    { label: 'Active Alerts Feed', route: `/api/alerts/${currentEco.id}`, method: 'GET' },
                    { label: 'AI Dynamic Recommendations', route: `/api/recommendations/${currentEco.id}`, method: 'GET' },
                  ].map(ep => (
                    <button
                      key={ep.route}
                      onClick={() => {
                        setApiEndpoint(ep.route);
                        setApiResponse('Click "Execute Endpoint" below to view live API payload.');
                      }}
                      className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                        apiEndpoint === ep.route
                          ? 'bg-slate-800 border-emerald-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="font-medium">{ep.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          ep.method === 'POST' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleTestApi}
                  disabled={apiLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {apiLoading ? 'Processing Query...' : 'Execute Endpoint'}
                </button>
              </div>

              {/* cURL & Response Payload Display */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Live cURL Command</span>
                  <button
                    onClick={() =>
                      copyToClipboard(`curl http://localhost:8000${apiEndpoint}`, 'curl')
                    }
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCurl ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto">
                  curl http://localhost:8000{apiEndpoint}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-white">JSON Response Body</span>
                  <span className="text-[10px] font-mono text-slate-500">status: 200 OK · application/json</span>
                </div>

                <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[380px] leading-relaxed">
                  {apiResponse}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BACKEND SOURCE CODE HUB */}
        {/* ========================================================================= */}
        {activeTab === 'code-hub' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  Backend Source Code Hub
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Explore all generated Python, Pydantic, FastAPI, and Supabase SQL files in the <code className="text-emerald-400 font-mono">earthtwin-backend/</code> project directory.
                </p>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                Total Files: <strong className="text-white">{BACKEND_FILES.length}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* File List */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Files</div>
                <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                  {BACKEND_FILES.map(file => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between border ${
                        selectedFile.path === file.path
                          ? 'bg-slate-800 border-emerald-500/50 text-white font-medium'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-mono text-[11px] truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                        {file.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-sm font-semibold text-white">{selectedFile.path}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedFile.content, 'file')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedFile ? 'Copied File!' : 'Copy Code'}
                  </button>
                </div>

                <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[460px] leading-relaxed">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REACT CONNECTION GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'connect-guide' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Connecting Backend to Existing React Frontend
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Here are the drop-in TypeScript clients and React hooks to connect your existing React application to the EarthTwin FastAPI backend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Axios Client */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">1. Create API Client (<code className="text-emerald-400">apiClient.ts</code>)</span>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const earthTwin = {
  // Ecosystems
  getEcosystems: () => axios.get(\`\${API_BASE_URL}/api/ecosystems\`),
  getEcosystem: (id: string) => axios.get(\`\${API_BASE_URL}/api/ecosystems/\${id}\`),

  // Telemetry & Health
  getEnvironment: (id: string) => axios.get(\`\${API_BASE_URL}/api/environment/\${id}\`),
  getHealth: (id: string) => axios.get(\`\${API_BASE_URL}/api/health/\${id}\`),
  getRisks: (id: string) => axios.get(\`\${API_BASE_URL}/api/risks/\${id}\`),

  // What-If Simulation
  runSimulation: (params: any) => axios.post(\`\${API_BASE_URL}/api/simulation/run\`, params),
  
  // Alerts & Assistant
  getAlerts: (id: string) => axios.get(\`\${API_BASE_URL}/api/alerts/\${id}\`),
  askAssistant: (ecosystem_id: string, question: string) =>
    axios.post(\`\${API_BASE_URL}/api/assistant/ask\`, { ecosystem_id, question }),
};`}
                </pre>
              </div>

              {/* Step 2: Custom React Hook */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">2. Use in Component (<code className="text-emerald-400">useEarthTwin.ts</code>)</span>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { useEffect, useState } from 'react';
import { earthTwin } from './apiClient';

export function useEarthTwin(ecosystemId = 'forest-001') {
  const [data, setData] = useState({ health: null, risks: null, env: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTwin() {
      try {
        const [h, r, e] = await Promise.all([
          earthTwin.getHealth(ecosystemId),
          earthTwin.getRisks(ecosystemId),
          earthTwin.getEnvironment(ecosystemId),
        ]);
        setData({ health: h.data, risks: r.data, env: e.data });
      } finally {
        setLoading(false);
      }
    }
    fetchTwin();
  }, [ecosystemId]);

  return { ...data, loading };
}`}
                </pre>
              </div>
            </div>

            {/* Step 3: Running FastAPI */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-sm text-white">3. Running the Backend Locally</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">1. Setup Virtual Env</div>
                  <code className="text-emerald-400 font-mono block">python -m venv venv</code>
                  <code className="text-slate-400 font-mono block">source venv/bin/activate</code>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">2. Install Packages</div>
                  <code className="text-emerald-400 font-mono block">pip install -r requirements.txt</code>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">3. Launch FastAPI Server</div>
                  <code className="text-emerald-400 font-mono block">python run.py</code>
                  <div className="text-slate-500 text-[10px]">Listening on port 8000</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 px-4 lg:px-8 text-center text-xs text-slate-500">
        EarthTwin — AI Digital Twin for Outdoor Ecosystems · College Engineering Project Backend · Designed for FastAPI + Supabase + React
      </footer>
    </div>
  );
}

function Sun(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
