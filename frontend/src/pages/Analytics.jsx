// pages/Analytics.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { ArrowLeft, ExternalLink, Clock, MousePointerClick, Globe, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';

const COLORS = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];

const StatCard = ({ label, value, icon: Icon, accent = 'sky' }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-slate-500 text-sm">{label}</p>
      <div className={`w-8 h-8 rounded-lg bg-${accent}-500/10 flex items-center justify-center`}>
        <Icon size={15} className={`text-${accent}-400`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-sky-400 font-semibold">{payload[0].value} clicks</p>
    </div>
  );
};

export default function Analytics() {
  const { shortCode } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', shortCode],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/${shortCode}?days=30`);
      return data.data;
    },
  });

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 card animate-pulse" />)}
      </div>
      <div className="h-64 card animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-center">
      <p className="text-red-400">{error.message}</p>
      <Link to="/dashboard" className="btn-secondary mt-4 inline-flex items-center gap-2">
        <ArrowLeft size={15} /> Back
      </Link>
    </div>
  );

  const { url, summary, time_series, breakdown } = data;

  // Format time series for chart
  const chartData = (time_series || []).map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    clicks: parseInt(d.clicks),
  }));

  const deviceData = (breakdown?.devices || []).map(d => ({
    name: d.device_type,
    value: parseInt(d.count),
  }));

  const browserData = (breakdown?.browsers || []).slice(0, 5).map(b => ({
    name: b.browser || 'Other',
    clicks: parseInt(b.count),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-3 transition-colors">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            /{url.short_code}
            <a href={url.original_url} target="_blank" rel="noopener noreferrer"
              className="text-slate-600 hover:text-sky-400 transition-colors">
              <ExternalLink size={16} />
            </a>
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg truncate">{url.original_url}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="badge bg-sky-500/10 text-sky-400 border border-sky-500/20">Last 30 days</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Clicks" value={Number(url.total_clicks).toLocaleString()} icon={MousePointerClick} />
        <StatCard label="This Period" value={summary.clicks_in_period.toLocaleString()} icon={Clock} accent="violet" />
        <StatCard label="Devices" value={deviceData.length} icon={Smartphone} accent="emerald" />
        <StatCard label="Status" value={url.is_active ? 'Active' : 'Inactive'} icon={Globe} accent={url.is_active ? 'emerald' : 'red'} />
      </div>

      {/* Click Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Clicks Over Time</h2>
        {chartData.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-8">No click data in this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2}
                fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: '#0ea5e9' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Device Types</h2>
          {deviceData.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" paddingAngle={3}>
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'clicks']} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400 capitalize">{d.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Top Browsers</h2>
          {browserData.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={browserData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="clicks" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Referers */}
      {data.top_referers?.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Top Referrers</h2>
          <div className="space-y-2">
            {data.top_referers.slice(0, 8).map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-slate-600 w-4 text-xs">{i + 1}</span>
                <span className="text-slate-400 truncate flex-1">{r.referer || 'Direct'}</span>
                <span className="text-slate-500 shrink-0">{r.count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
