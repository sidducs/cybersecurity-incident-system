'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, CheckCircle2, ShieldAlert, Award, Activity } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports/analysts');
        if (!res.ok) throw new Error('Failed to load analyst performance reports');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <Activity className="w-5 h-5 animate-spin" />
          <span>COMPUTING ANALYST CASELOAD & SLA BENCHMARK MATRICES...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300">
        Error: {error}
      </div>
    );
  }

  const { analystCaseloadMatrix, resolutionTurnaround } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>SOC Analyst Performance & SLA Audit</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Aggregates Real-Time Incident Triage Throughput, Critical Incident Load & Mean Turnaround Times
        </p>
      </div>

      {/* Main Caseload Matrix (Q09) */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Analyst Caseload & Resolution Matrix (Query Q09)</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Demonstrating Advanced Conditional Aggregations (CASE WHEN) across Security Analyst Caseloads
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            AGGREGATES + CASE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Analyst</th>
                <th className="py-3 px-3 text-center">Total Assigned</th>
                <th className="py-3 px-3 text-center">In Triage</th>
                <th className="py-3 px-3 text-center">Contained</th>
                <th className="py-3 px-3 text-center">Resolved</th>
                <th className="py-3 px-3 text-center">Critical Handled</th>
                <th className="py-3 px-3 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analystCaseloadMatrix.map((analyst) => (
                <tr key={analyst.user_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-sans font-semibold text-slate-100">{analyst.analyst_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{analyst.email}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-cyan-400">
                    {analyst.total_assigned}
                  </td>
                  <td className="py-3 px-3 text-center text-amber-400">
                    {analyst.in_triage_count}
                  </td>
                  <td className="py-3 px-3 text-center text-blue-400">
                    {analyst.contained_count}
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">
                    {analyst.resolved_count}
                  </td>
                  <td className="py-3 px-3 text-center text-red-400">
                    {analyst.critical_severity_handled}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-bold">
                      {analyst.resolution_rate_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turnaround Time Analysis (Q04) */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Mean Resolution Turnaround Time (Query Q04)</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Measures Mean Time To Remediate (MTTR) calculated via EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 3600
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            AVG(EPOCH) / 3600
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {resolutionTurnaround.map((t) => (
            <div key={t.user_id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-xs font-semibold text-slate-200">{t.analyst_name}</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {parseFloat(t.avg_turnaround_hours) < 24
                  ? `${t.avg_turnaround_hours} hrs`
                  : `${(parseFloat(t.avg_turnaround_hours) / 24).toFixed(1)} days`}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {t.resolved_count} incidents resolved
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

