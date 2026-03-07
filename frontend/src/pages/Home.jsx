// pages/Home.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Copy, Check, ChevronDown, ChevronUp, Zap, Shield, BarChart2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Redis-powered redirects in under 5ms globally' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'JWT auth, rate limiting, and HTTPS everywhere' },
  { icon: BarChart2, title: 'Rich Analytics', desc: 'Track clicks, devices, and referrers in real time' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { url };
      if (customCode.trim()) payload.customCode = customCode.trim();
      if (expiresAt) payload.expiresAt = expiresAt;
      const { data } = await api.post('/shorten', payload);
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Link shortened successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to shorten URL');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Please enter a URL');
    mutation.mutate();
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Distributed URL Shortener
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
          Shorten. Share.{' '}
          <span className="gradient-text">Track.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Transform long URLs into powerful short links with real-time analytics and lightning-fast redirects.
        </p>
      </div>

      {/* Shortener Form */}
      <div className="card p-6 mb-6 shadow-2xl shadow-black/40">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="input pl-10"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Shortening...
                </span>
              ) : 'Shorten URL'}
            </button>
          </div>

          {/* Advanced Options */}
          {isAuthenticated && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Advanced options
              </button>

              {showAdvanced && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 animate-slide-up">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">Custom alias</label>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="e.g. my-link"
                      className="input text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">Expiry date</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input text-sm py-2"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-slide-up">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-1">Your short link</p>
                <a
                  href={result.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 font-mono font-medium hover:text-sky-300 transition-colors"
                >
                  {result.short_url}
                </a>
                <p className="text-xs text-slate-600 mt-1 truncate">{result.original_url}</p>
              </div>
              <button onClick={copyToClipboard} className="btn-secondary text-sm flex items-center gap-2 shrink-0">
                {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 hover:border-slate-700 transition-colors">
            <Icon size={20} className="text-sky-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {!isAuthenticated && (
        <p className="text-center text-sm text-slate-600 mt-8">
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">Create a free account</Link>
          {' '}to unlock custom aliases, analytics & more
        </p>
      )}
    </main>
  );
}
