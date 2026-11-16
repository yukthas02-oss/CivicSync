import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ChallengeCard from '../components/ChallengeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Filter, PlusCircle, ArrowUpDown, Tag, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const ExploreChallengesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const severity = searchParams.get('severity') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data.results || res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Challenges when parameters change
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'all') params.append('category', category);
        if (status && status !== 'all') params.append('status', status);
        if (severity && severity !== 'all') params.append('severity', severity);
        if (sort) params.append('sort', sort);
        params.append('page', page);

        const res = await api.get(`/challenges/?${params.toString()}`);
        setChallenges(res.data.results || res.data);
        setTotalCount(res.data.count || (res.data.results ? res.data.results.length : res.data.length));
      } catch (err) {
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [search, category, status, severity, sort, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  return (
    <div className="py-5 bg-warm-offwhite min-vh-100">
      <div className="container">
        {/* Header Title & CTA */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 className="display-font fw-bold text-forest mb-1 fs-2">
              Explore Societal Challenges
            </h1>
            <p className="text-muted-custom small mb-0">
              Browse ground-level community issues, review AI analysis, or express institutional collaboration.
            </p>
          </div>
          <Link to="/submit-challenge" className="btn-civic text-decoration-none shadow-xs">
            <Camera size={16} />
            <span>Report a Problem</span>
          </Link>
        </div>

        {/* Search Bar & Filter Controls Card */}
        <div className="cs-card p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted-custom" />
              </span>
              <input 
                type="text" 
                className="form-control form-control-civic border-start-0" 
                placeholder="Search challenges by title, description, city, or ID (e.g., 'Groundwater', 'Chennai', 'CS-101')..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn-civic px-4">
                Search
              </button>
            </div>
          </form>

          {/* Filter Dropdowns and Sorting */}
          <div className="row g-3 align-items-center">
            {/* Status Filter */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted-custom mb-1 fw-semibold">Status</label>
              <select 
                className="form-select form-select-civic form-select-sm"
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="PENDING">Pending Review</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted-custom mb-1 fw-semibold">Severity</label>
              <select 
                className="form-select form-select-civic form-select-sm"
                value={severity}
                onChange={(e) => updateParam('severity', e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="CRITICAL">Critical / Urgent</option>
                <option value="HIGH">High Urgency</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="col-sm-6 col-md-3">
              <label className="form-label small text-muted-custom mb-1 fw-semibold">Sort By</label>
              <select 
                className="form-select form-select-civic form-select-sm"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="most_followed">Most Followed</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Clear Filters Reset */}
            <div className="col-sm-6 col-md-3 d-flex align-items-end pt-3">
              {(search || category !== 'all' || status !== 'all' || severity !== 'all') && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="mt-4 pt-3 border-top">
            <span className="small text-muted-custom fw-semibold me-2">Categories:</span>
            <div className="d-inline-flex flex-wrap gap-2 align-items-center mt-2">
              <button 
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 ${category === 'all' ? 'btn-civic' : 'btn-civic-secondary'}`}
                onClick={() => updateParam('category', 'all')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 ${category === cat.slug ? 'btn-civic' : 'btn-civic-secondary'}`}
                  onClick={() => updateParam('category', cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="small text-muted-custom fw-medium">
            Showing <strong>{challenges.length}</strong> {challenges.length === 1 ? 'challenge' : 'challenges'}
          </span>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <LoadingSpinner message="Searching registered societal challenges..." />
        ) : challenges.length === 0 ? (
          <EmptyState 
            title="No challenges matched your filters"
            description="Try modifying your keyword search or clear one of the filters above."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            }}
          />
        ) : (
          <div className="row g-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="col-md-6 col-lg-4">
                <ChallengeCard challenge={challenge} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalCount > 12 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
            <button 
              className="btn btn-civic-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => updateParam('page', page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span className="small text-muted-custom fw-semibold">
              Page {page}
            </span>
            <button 
              className="btn btn-civic-secondary btn-sm"
              disabled={challenges.length < 12}
              onClick={() => updateParam('page', page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreChallengesPage;
