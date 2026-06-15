import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/ui/Layout';
import { Search, Briefcase, Globe, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const LIMIT = 18; // cards per page

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);

  // Search
  const [searchInput, setSearchInput]   = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async (search: string, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${baseUrl}/companies?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const result = await res.json();
      setCompanies(result.data || []);
      setTotalCount(result.total_count || 0);
      setTotalPages(result.total_pages || 1);
    } catch (err: any) {
      setError(err.message);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies('', 1);
  }, [fetchCompanies]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    setPage(1);
    fetchCompanies(searchInput, 1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
    fetchCompanies('', 1);
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(newPage);
    fetchCompanies(appliedSearch, newPage);
  };

  // ── Styling helpers ─────────────────────────────────────────────────────────
  const avatarColors = [
    'bg-purple-100 text-purple-600',
    'bg-blue-100 text-blue-600',
    'bg-teal-100 text-teal-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-green-100 text-green-600',
    'bg-red-100 text-red-600',
  ];
  const getAvatarColor = (name: string = '') =>
    avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];

  const industryBadgeColor = (ind: string = '') => {
    const l = ind.toLowerCase();
    if (l.includes('ai') || l.includes('intelligence')) return 'bg-purple-50 text-purple-700 border-purple-100';
    if (l.includes('data') || l.includes('analytic'))   return 'bg-blue-50 text-blue-700 border-blue-100';
    if (l.includes('cloud') || l.includes('infra'))     return 'bg-sky-50 text-sky-700 border-sky-100';
    if (l.includes('fin'))                              return 'bg-green-50 text-green-700 border-green-100';
    return 'bg-teal-50 text-teal-700 border-teal-100';
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-20 pb-28 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 right-0 w-1/2 h-full rounded-full bg-teal-500/10 blur-[100px]" />
          <div className="absolute -bottom-1/4 left-0 w-1/2 h-full rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Discover Top Employers
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Browse every company actively hiring in Data, AI, and Machine Learning.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl flex gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                id="company-search-input"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by company name..."
                className="w-full outline-none text-slate-800 placeholder-slate-400 text-sm bg-transparent"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch}>
                  <X size={15} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button
              type="submit"
              id="company-search-btn"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold transition flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 -mt-10">

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            {loading ? (
              <span className="text-slate-400 animate-pulse">Loading companies...</span>
            ) : (
              <>
                <span className="text-teal-600 font-extrabold">{totalCount.toLocaleString()}</span> companies
                {appliedSearch && (
                  <span className="text-slate-500 font-normal"> matching "<strong>{appliedSearch}</strong>"</span>
                )}
              </>
            )}
          </h2>
          {appliedSearch && (
            <button onClick={clearSearch} className="text-sm text-teal-600 font-semibold hover:underline">
              Clear search
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-sm">
            ⚠️ {error} — Make sure your FastAPI backend is running on port 8000.
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="bg-white p-7 rounded-3xl border border-slate-100 animate-pulse">
                <div className="flex gap-4 items-center mb-5">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
                <div className="h-8 bg-slate-100 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && companies.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏢</p>
            <p className="font-bold text-slate-700 text-xl mb-2">No companies found</p>
            <p className="text-slate-400 text-sm mb-6">
              {appliedSearch ? 'Try a different search term.' : 'No company data available yet.'}
            </p>
            {appliedSearch && (
              <button onClick={clearSearch} className="text-teal-600 font-semibold hover:underline text-sm">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Company Cards Grid */}
        {!loading && companies.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:border-teal-400 hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex gap-4 items-center mb-5">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl flex-shrink-0 group-hover:scale-105 transition-transform ${getAvatarColor(company.name)}`}
                    >
                      {company.name ? company.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition truncate leading-tight">
                        {company.name}
                      </h3>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border mt-1.5 ${industryBadgeColor(company.industry)}`}>
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  {/* Website */}
                  {company.website ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-5 truncate">
                      <Globe size={13} className="text-teal-400 flex-shrink-0" />
                      <span className="truncate">{company.website}</span>
                    </div>
                  ) : (
                    <div className="mb-5" />
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
                    <div className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl text-sm border ${
                      Number(company.jobs) > 0
                        ? 'bg-teal-50 text-teal-700 border-teal-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      <Briefcase size={14} />
                      {company.jobs || 0} Open Jobs
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 font-bold text-sm group-hover:gap-2 transition-all">
                      View <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      p = i + 1;
                    } else if (page >= totalPages - 3) {
                      p = totalPages - 6 + i;
                    } else {
                      p = page - 3 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                          p === page
                            ? 'bg-teal-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Page info */}
            <p className="text-center text-sm text-slate-400 mt-4">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, totalCount)} of {totalCount.toLocaleString()} companies
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}