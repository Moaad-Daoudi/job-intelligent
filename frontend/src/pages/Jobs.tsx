import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import {
  Search, SlidersHorizontal, MapPin, Briefcase, ChevronLeft, ChevronRight,
  Clock, ExternalLink, X
} from 'lucide-react';

const CONTRACT_TYPES = ['Any', 'CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];
const EXPERIENCE_LEVELS = ['Any', 'Junior', 'Mid', 'Senior'];

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-100">
      {label}
    </span>
  );
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter State (each fully independent) ──────────────────────────────────
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || searchParams.get('category') || '');
  const [cityInput, setCityInput]     = useState(searchParams.get('city') || '');
  const [contractType, setContractType]     = useState(searchParams.get('contract_type') || 'Any');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experience_level') || 'Any');

  // ── Result State ───────────────────────────────────────────────────────────
  const [jobs, setJobs]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // ── Core Fetch (all params optional & independent) ─────────────────────────
  const fetchJobs = useCallback(async (
    currentPage: number,
    search: string,
    city: string,
    contract: string,
    experience: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(limit));
      if (search.trim())                          params.set('search', search.trim());
      if (city.trim())                            params.set('city', city.trim());
      if (contract && contract !== 'Any')         params.set('contract_type', contract);
      if (experience && experience !== 'Any')     params.set('experience_level', experience.toLowerCase());

      const res = await fetch(`http://localhost:8000/jobs?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const result = await res.json();
      setJobs(result.data || []);
      setTotalPages(result.total_pages || 1);
      setTotalCount(result.total_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sync URL params & fetch on filter/page change ─────────────────────────
  const applyFilters = useCallback((
    search: string, city: string, contract: string, experience: string, newPage = 1
  ) => {
    const p: Record<string, string> = {};
    if (search.trim())          p.search = search.trim();
    if (city.trim())            p.city = city.trim();
    if (contract !== 'Any')     p.contract_type = contract;
    if (experience !== 'Any')   p.experience_level = experience;
    setSearchParams(p, { replace: true });
    setPage(newPage);
    fetchJobs(newPage, search, city, contract, experience);
  }, [fetchJobs, setSearchParams]);

  // ── Initial load from URL ──────────────────────────────────────────────────
  useEffect(() => {
    fetchJobs(1, searchInput, cityInput, contractType, experienceLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sidebar filters auto-apply on change ──────────────────────────────────
  const handleContractChange = (val: string) => {
    setContractType(val);
    applyFilters(searchInput, cityInput, val, experienceLevel);
  };

  const handleExperienceChange = (val: string) => {
    setExperienceLevel(val);
    applyFilters(searchInput, cityInput, contractType, val);
  };

  // ── Search form (search + city together or independently) ─────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchInput, cityInput, contractType, experienceLevel);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(newPage);
    fetchJobs(newPage, searchInput, cityInput, contractType, experienceLevel);
  };

  // ── Clear all filters ──────────────────────────────────────────────────────
  const clearAll = () => {
    setSearchInput('');
    setCityInput('');
    setContractType('Any');
    setExperienceLevel('Any');
    setSearchParams({}, { replace: true });
    setPage(1);
    fetchJobs(1, '', '', 'Any', 'Any');
  };

  const hasActiveFilters =
    searchInput.trim() || cityInput.trim() || contractType !== 'Any' || experienceLevel !== 'Any';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-3"
        >
          <div className="flex-1 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-teal-400 transition">
            <Search size={18} className="text-teal-500 flex-shrink-0" />
            <input
              id="job-search-input"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full outline-none text-sm bg-transparent placeholder-slate-400"
              placeholder="Search job title or keyword..."
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); applyFilters('', cityInput, contractType, experienceLevel); }}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-teal-400 transition">
            <MapPin size={18} className="text-teal-500 flex-shrink-0" />
            <input
              id="job-city-input"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              className="w-full outline-none text-sm bg-transparent placeholder-slate-400"
              placeholder="City (e.g. Casablanca, Rabat)..."
            />
            {cityInput && (
              <button type="button" onClick={() => { setCityInput(''); applyFilters(searchInput, '', contractType, experienceLevel); }}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <button
            type="submit"
            id="job-search-btn"
            className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition flex-shrink-0"
          >
            Search
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200 transition flex-shrink-0 text-sm"
            >
              Clear all
            </button>
          )}
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Filters Sidebar ──────────────────────────────────────────── */}
          <aside className="col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <SlidersHorizontal size={18} className="text-teal-500" />
                  Filters
                </div>
                {hasActiveFilters && (
                  <button onClick={clearAll} className="text-xs text-teal-600 hover:underline font-semibold">
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Contract Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contract Type
                  </label>
                  <div className="flex flex-col gap-2">
                    {CONTRACT_TYPES.map(ct => (
                      <button
                        key={ct}
                        id={`filter-contract-${ct.toLowerCase()}`}
                        onClick={() => handleContractChange(ct)}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          contractType === ct
                            ? 'bg-teal-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Experience Level
                  </label>
                  <div className="flex flex-col gap-2">
                    {EXPERIENCE_LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        id={`filter-exp-${lvl.toLowerCase()}`}
                        onClick={() => handleExperienceChange(lvl)}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          experienceLevel === lvl
                            ? 'bg-teal-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {lvl === 'Any' ? 'Any Level' : lvl === 'Junior' ? 'Junior / Intern' : lvl === 'Mid' ? 'Mid / Confirmed' : 'Senior / Lead'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Job List ─────────────────────────────────────────────────── */}
          <main className="col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {loading
                  ? <span className="text-slate-400 animate-pulse">Loading jobs...</span>
                  : <><span className="text-teal-600">{totalCount}</span> jobs found</>
                }
              </h2>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchInput.trim() && (
                    <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                      "{searchInput}"
                      <button onClick={() => { setSearchInput(''); applyFilters('', cityInput, contractType, experienceLevel); }}><X size={12} /></button>
                    </span>
                  )}
                  {cityInput.trim() && (
                    <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                      📍 {cityInput}
                      <button onClick={() => { setCityInput(''); applyFilters(searchInput, '', contractType, experienceLevel); }}><X size={12} /></button>
                    </span>
                  )}
                  {contractType !== 'Any' && (
                    <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                      {contractType}
                      <button onClick={() => handleContractChange('Any')}><X size={12} /></button>
                    </span>
                  )}
                  {experienceLevel !== 'Any' && (
                    <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                      {experienceLevel}
                      <button onClick={() => handleExperienceChange('Any')}><X size={12} /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4 text-sm">
                ⚠️ {error} — Make sure your FastAPI backend is running on port 8000.
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && jobs.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-bold text-slate-700 text-lg mb-1">No jobs found</p>
                <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or search terms.</p>
                <button onClick={clearAll} className="text-teal-600 font-semibold hover:underline text-sm">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
                    <div className="flex gap-3">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Cards */}
            {!loading && jobs.map((job, i) => {
              const skills: string[] = job.skills
                ? job.skills.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
                : [];

              return (
                <div
                  key={job.job_id ?? i}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group mb-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${job.job_id ?? i}`}
                        className="font-bold text-lg text-slate-800 group-hover:text-teal-600 transition line-clamp-1 block mb-1"
                      >
                        {job.title || 'Untitled Position'}
                      </Link>
                      <p className="text-slate-500 text-sm font-medium mb-3 capitalize">
                        {job.company || 'Company N/A'}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-teal-400" />
                          {job.location || 'Non spécifié'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} className="text-teal-400" />
                          {job.contract_type || 'Non spécifié'}
                        </span>
                        {job.published_date && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-teal-400" />
                            {String(job.published_date).slice(0, 10)}
                          </span>
                        )}
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skills.map(s => <Badge key={s} label={s} />)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        to={`/jobs/${job.job_id ?? i}`}
                        className="px-5 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition text-center"
                      >
                        View
                      </Link>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-teal-400 hover:text-teal-600 transition flex items-center gap-1 justify-center"
                        >
                          <ExternalLink size={13} /> Apply
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <span className="text-sm font-medium text-slate-500">
                  Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}