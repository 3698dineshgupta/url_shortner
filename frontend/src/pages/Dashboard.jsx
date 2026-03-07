// pages/Dashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart2, Copy, Trash2, ExternalLink, Search, Check, Link2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

function UrlRow({ url, onDelete }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${BASE_URL}/${url.short_code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
      <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
        <Link2 size={16} className="text-sky-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <a href={shortUrl} target="_blank" rel="noopener noreferrer"
            className="text-sky-400 font-mono text-sm font-medium hover:text-sky-300 transition-colors">
            /{url.short_code}
          </a>
          {url.is_custom && <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">custom</span>}
          {url.expires_at && new Date(url.expires_at) < new Date() && (
            <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">expired</span>
          )}
        </div>
        <p className="text-slate-500 text-xs truncate">{url.original_url}</p>
        <p className="text-slate-600 text-xs mt-0.5">
          {formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-center hidden sm:block">
          <p className="text-white font-semibold text-sm">{Number(url.click_count).toLocaleString()}</p>
          <p className="text-slate-600 text-xs">clicks</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copy} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <Link to={`/analytics/${url.short_code}`}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-all">
            <BarChart2 size={14} />
          </Link>
          <button onClick={() => onDelete(url.id)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['urls', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/urls?${params}`);
      return data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/url/${id}`),
    onSuccess: () => {
      toast.success('Link deleted');
      qc.invalidateQueries(['urls']);
    },
    onError: () => toast.error('Failed to delete link'),
  });

  const handleDelete = (id) => {
    if (confirm('Delete this link? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Links</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track all your shortened URLs</p>
        </div>
        <Link to="/" className="btn-primary text-sm">+ New Link</Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search links..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-10 text-sm"
        />
      </div>

      {/* Stats bar */}
      {data && (
        <div className="text-xs text-slate-500 mb-4 px-1">
          {data.pagination.total} link{data.pagination.total !== 1 ? 's' : ''} total
        </div>
      )}

      {/* URL List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 card animate-pulse" />
          ))
        ) : data?.urls?.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Link2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No links yet</p>
            <p className="text-sm mt-1">
              <Link to="/" className="text-sky-400 hover:underline">Create your first short link</Link>
            </p>
          </div>
        ) : (
          data?.urls?.map((url) => (
            <UrlRow key={url.id} url={url} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm py-2 px-4">
            Previous
          </button>
          <span className="flex items-center text-sm text-slate-500 px-3">
            {page} / {data.pagination.pages}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages} className="btn-secondary text-sm py-2 px-4">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
