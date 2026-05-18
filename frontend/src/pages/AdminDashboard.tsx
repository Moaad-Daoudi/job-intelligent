import { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { 
  BarChart3, PieChart, Users, Briefcase, Building, 
  TrendingUp, Play, CheckCircle2, Loader2, Calendar, 
  Activity, Sparkles, MapPin, Code2, Layers, AlertCircle
} from 'lucide-react';

interface LocationStat {
  location: string;
  count: number;
}

interface ContractStat {
  contract_type: string;
  count: number;
}

interface SkillStat {
  name: string;
  count: number;
}

interface LogEntry {
  action: string;
  time: string;
  type: 'user' | 'recruiter' | 'application' | 'job';
}

interface AdminStats {
  total_jobs: number;
  total_companies: number;
  total_candidates: number;
  total_recruiters: number;
  total_applications: number;
  locations: LocationStat[];
  contracts: ContractStat[];
  skills: SkillStat[];
  logs: LogEntry[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pipeline Triggering states
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSuccessMessage, setPipelineSuccessMessage] = useState<string | null>(null);

  // Active chart tooltip state
  const [hoveredLocation, setHoveredLocation] = useState<LocationStat | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Failed to retrieve system analytics.");
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerPipeline = async () => {
    setPipelineRunning(true);
    setPipelineSuccessMessage(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:8000/admin/trigger-pipeline', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Pipeline trigger failed.");
      }
      
      const result = await res.json();
      setPipelineSuccessMessage(result.message);
      
      // Reload stats dynamically after successful sync
      await fetchStats();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setPipelineSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPipelineRunning(false);
    }
  };

  // Helper to resolve contract type color coding
  const getContractColor = (contract: string) => {
    const c = contract.toUpperCase();
    if (c.includes('CDI')) return '#0ea5e9'; // Blue
    if (c.includes('CDD')) return '#f59e0b'; // Amber
    if (c.includes('STAGE') || c.includes('INTERN')) return '#10b981'; // Green
    if (c.includes('FREELANCE')) return '#8b5cf6'; // Purple
    return '#64748b'; // Slate
  };

  // Helper to format ISO times beautifully
  const formatTime = (isoString: string) => {
    if (isoString === 'N/A') return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  // Calculate percentages for contract chart
  const totalContractCount = stats?.contracts.reduce((sum, c) => sum + c.count, 0) || 1;

  // Maximum count for region bar normalization
  const maxRegionCount = stats?.locations.reduce((max, loc) => Math.max(max, loc.count), 0) || 1;

  // SVG Chart Constants
  const barChartWidth = 480;
  const barChartHeight = 220;
  const barPadding = 24;
  const graphPaddingLeft = 40;
  const graphPaddingRight = 20;
  const graphPaddingBottom = 30;
  const graphPaddingTop = 20;

  return (
    <Layout>
      {/* Power BI Premium Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pt-20 pb-36 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-10 w-1/3 h-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <span className="bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-teal-500/20 flex items-center gap-1.5 w-fit">
              <Sparkles size={12} className="animate-pulse" /> Power BI Visualizer & Analytics
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Executive Administration Dashboard
            </h1>
            <p className="text-slate-400 font-medium text-base">
              Real-time intelligence dashboard analyzing scraped job offers, data pipelines, and user activity.
            </p>
          </div>
          
          <button
            onClick={handleTriggerPipeline}
            disabled={pipelineRunning}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-teal-500/20 shrink-0 text-sm cursor-pointer disabled:opacity-70"
          >
            {pipelineRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Running Pipeline...
              </>
            ) : (
              <>
                <Play size={16} /> Run Data Pipeline Sync
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="max-w-6xl mx-auto px-8 pb-24 -mt-20 relative z-20">
        
        {/* Alerts & Notifications */}
        {pipelineSuccessMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <div>{pipelineSuccessMessage}</div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-sm">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div>⚠️ {error}</div>
          </div>
        )}

        {loading && !stats ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-100 shadow-xl text-center space-y-4">
            <Loader2 className="animate-spin text-teal-500 mx-auto" size={36} />
            <p className="font-extrabold text-slate-600 text-lg">Assembling BI Insights...</p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Connecting to Gold Warehouse and computing location distributions.</p>
          </div>
        ) : (
          stats && (
            <div className="space-y-8">
              
              {/* 📊 1. KPI RIBBON CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Total Scraped Jobs</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800">{stats.total_jobs}</span>
                    <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> Live</span>
                  </div>
                  <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mt-3 shrink-0">
                    <Briefcase size={16} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Partner Companies</span>
                  <span className="text-2xl font-black text-slate-800">{stats.total_companies}</span>
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mt-3 shrink-0">
                    <Building size={16} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Candidates Profiled</span>
                  <span className="text-2xl font-black text-slate-800">{stats.total_candidates}</span>
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mt-3 shrink-0">
                    <Users size={16} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Recruiter Accounts</span>
                  <span className="text-2xl font-black text-slate-800">{stats.total_recruiters}</span>
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mt-3 shrink-0">
                    <Layers size={16} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Applications Ingested</span>
                  <span className="text-2xl font-black text-slate-800">{stats.total_applications}</span>
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mt-3 shrink-0">
                    <Activity size={16} />
                  </div>
                </div>

              </div>

              {/* 📈 2. VISUAL CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visual Chart A: Region/Location Distribution (Professional SVG Bar Chart) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-teal-500" size={20} />
                      <h3 className="font-extrabold text-base text-slate-800">Job Offers by Region (Morocco)</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Top 5 Cities</span>
                  </div>

                  {stats.locations.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-medium">
                      No location data available. Run the pipeline to ingest offers.
                    </div>
                  ) : (
                    <div className="relative pt-4">
                      {/* Interactive Tooltip Overlay */}
                      {hoveredLocation && (
                        <div className="absolute top-0 right-0 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 flex items-center gap-1.5 z-30">
                          <MapPin size={12} className="text-teal-400" />
                          <span>{hoveredLocation.location}: {hoveredLocation.count} listings</span>
                        </div>
                      )}

                      {/* SVG Bar Chart */}
                      <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="overflow-visible">
                        {/* Horizontal Gridlines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = graphPaddingTop + (barChartHeight - graphPaddingTop - graphPaddingBottom) * (1 - ratio);
                          return (
                            <line 
                              key={index}
                              x1={graphPaddingLeft} 
                              y1={y} 
                              x2={barChartWidth - graphPaddingRight} 
                              y2={y} 
                              stroke="#f1f5f9" 
                              strokeWidth={1} 
                            />
                          );
                        })}

                        {/* Rendering Bars */}
                        {stats.locations.map((loc, idx) => {
                          const graphWidth = barChartWidth - graphPaddingLeft - graphPaddingRight;
                          const barSpacing = graphWidth / stats.locations.length;
                          const barWidth = barSpacing * 0.55;
                          
                          // Normalize height
                          const graphHeight = barChartHeight - graphPaddingTop - graphPaddingBottom;
                          const barHeight = (loc.count / maxRegionCount) * graphHeight * 0.9; // 90% scaling to fit safely
                          
                          const x = graphPaddingLeft + (idx * barSpacing) + (barSpacing - barWidth) / 2;
                          const y = barChartHeight - graphPaddingBottom - barHeight;

                          return (
                            <g key={idx} className="cursor-pointer group">
                              {/* Highlight Background on Hover */}
                              <rect
                                x={x - 4}
                                y={graphPaddingTop}
                                width={barWidth + 8}
                                height={graphHeight}
                                fill="transparent"
                                onMouseEnter={() => setHoveredLocation(loc)}
                                onMouseLeave={() => setHoveredLocation(null)}
                              />
                              
                              {/* Decorative Shadow Base */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={6}
                                fill="url(#tealBarGradient)"
                                className="transition-all duration-300 hover:opacity-90"
                              />

                              {/* Top Bar Highlight Cap */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={4}
                                rx={2}
                                fill="#2dd4bf"
                              />

                              {/* Label text */}
                              <text
                                x={x + barWidth / 2}
                                y={barChartHeight - 10}
                                textAnchor="middle"
                                fill="#94a3b8"
                                className="text-[10px] font-black group-hover:fill-slate-800 transition"
                              >
                                {loc.location.split(',')[0]}
                              </text>

                              {/* Top value text */}
                              <text
                                x={x + barWidth / 2}
                                y={y - 6}
                                textAnchor="middle"
                                fill="#0f172a"
                                className="text-[11px] font-extrabold opacity-0 group-hover:opacity-100 transition duration-200"
                              >
                                {loc.count}
                              </text>
                            </g>
                          );
                        })}

                        {/* Defining Gradients */}
                        <defs>
                          <linearGradient id="tealBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#0f766e" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Visual Chart B: Top Skills Frequency (Horizontal Progress Grid) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="text-teal-500" size={20} />
                      <h3 className="font-extrabold text-base text-slate-800">Top Required Tech Competences</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Data Warehouse Gold</span>
                  </div>

                  {stats.skills.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-medium">
                      No skill records indexed yet. Post some offers.
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {stats.skills.map((skill, idx) => {
                        // Max count for skills bar normalization
                        const maxSkillCount = stats.skills[0]?.count || 1;
                        const percentage = Math.round((skill.count / maxSkillCount) * 100);

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span className="flex items-center gap-1.5 text-slate-800">
                                <span className="w-5 h-5 bg-teal-50 text-teal-600 rounded-md flex items-center justify-center text-[10px] font-black">
                                  {idx + 1}
                                </span>
                                {skill.name}
                              </span>
                              <span className="text-slate-400">{skill.count} job mentions</span>
                            </div>
                            <div className="w-full h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* 🔄 3. BOTTOM INFO: CONTRACT DONUT & ACTIVITY TRAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Donut Chart: Contract Breakdown (Visual List & Percentages) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <PieChart className="text-teal-500" size={20} />
                    <h3 className="font-extrabold text-base text-slate-800">Contract Types</h3>
                  </div>

                  {stats.contracts.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-medium">
                      No contracts indexed.
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between h-[230px] pt-2">
                      {/* Dynamic Visual SVG Ring */}
                      <div className="flex justify-center">
                        <svg width="110" height="110" viewBox="0 0 36 36" className="overflow-visible">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                          
                          {/* Render donut rings dynamically */}
                          {(() => {
                            let accumulatedPercent = 0;
                            return stats.contracts.slice(0, 4).map((c, index) => {
                              const percent = (c.count / totalContractCount) * 100;
                              const strokeDashArray = `${percent} ${100 - percent}`;
                              const strokeDashOffset = 100 - accumulatedPercent + 25; // 25 to start at 12 o'clock
                              accumulatedPercent += percent;

                              return (
                                <circle
                                  key={index}
                                  cx="18"
                                  cy="18"
                                  r="15.915"
                                  fill="transparent"
                                  stroke={getContractColor(c.contract_type)}
                                  strokeWidth="3.2"
                                  strokeDasharray={strokeDashArray}
                                  strokeDashoffset={strokeDashOffset}
                                  className="transition-all duration-300"
                                />
                              );
                            });
                          })()}
                          <circle cx="18" cy="18" r="11" fill="#white" />
                        </svg>
                      </div>

                      {/* Descriptive Legends */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 mt-4">
                        {stats.contracts.slice(0, 4).map((c, index) => {
                          const percent = Math.round((c.count / totalContractCount) * 100);
                          return (
                            <div key={index} className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: getContractColor(c.contract_type) }} 
                              />
                              <span className="truncate" title={c.contract_type}>{c.contract_type}: {percent}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* System Activity Logs (Live Audit Trail) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <Activity className="text-teal-500" size={20} />
                    <h3 className="font-extrabold text-base text-slate-800">System Activity Audit Log</h3>
                  </div>

                  {stats.logs.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-medium">
                      No system events recorded. Create some accounts or post listings.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[240px] overflow-y-auto pr-2">
                      {stats.logs.map((log, idx) => {
                        const getLogBadge = (t: string) => {
                          if (t === 'user') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (t === 'recruiter') return 'bg-purple-50 text-purple-700 border-purple-100';
                          if (t === 'job') return 'bg-teal-50 text-teal-700 border-teal-100';
                          return 'bg-blue-50 text-blue-700 border-blue-100';
                        };

                        return (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100/50 rounded-xl text-xs font-semibold gap-4 hover:bg-slate-100/50 transition">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${getLogBadge(log.type)}`}>
                                {log.type}
                              </span>
                              <span className="text-slate-700 font-bold leading-normal">{log.action}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                              <Calendar size={11} /> {formatTime(log.time)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )
        )}

      </div>
    </Layout>
  );
}
