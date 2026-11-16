'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <Activity className="w-4 h-4 animate-spin text-white" />
          <span>Loading analyst metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
        Error: {error}
      </div>
    );
  }

  const { analystCaseloadMatrix, resolutionTurnaround } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Analyst Performance & Triage Reports</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Analytical reporting on analyst workloads, resolution metrics, and resolution turnaround
        </p>
      </div>

      {/* Main Caseload Matrix (Q09) */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              Analyst Caseload & Resolution Matrix (Query Q09)
            </h2>
            <div className="text-[11px] text-zinc-400">
              Aggregates across Security Analysts using conditional CASE WHEN logic
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 bg-black px-2 py-0.5 rounded border border-zinc-800">
            AGGREGATES + CASE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2 px-2.5">Analyst</th>
                <th className="py-2 px-2.5 text-center">Total Assigned</th>
                <th className="py-2 px-2.5 text-center">In Triage</th>
                <th className="py-2 px-2.5 text-center">Contained</th>
                <th className="py-2 px-2.5 text-center">Resolved</th>
                <th className="py-2 px-2.5 text-center">Critical Handled</th>
                <th className="py-2 px-2.5 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {analystCaseloadMatrix.map((analyst) => (
                <tr key={analyst.user_id} className="hover:bg-zinc-800/30">
                  <td className="py-2 px-2.5">
                    <div className="font-medium text-white">{analyst.analyst_name}</div>
                    <div className="text-[11px] text-zinc-400">{analyst.email}</div>
                  </td>
                  <td className="py-2 px-2.5 text-center font-semibold text-white">
                    {analyst.total_assigned}
                  </td>
                  <td className="py-2 px-2.5 text-center text-amber-400">
                    {analyst.in_triage_count}
                  </td>
                  <td className="py-2 px-2.5 text-center text-blue-400">
                    {analyst.contained_count}
                  </td>
                  <td className="py-2 px-2.5 text-center text-emerald-400 font-semibold">
                    {analyst.resolved_count}
                  </td>
                  <td className="py-2 px-2.5 text-center text-red-400">
                    {analyst.critical_severity_handled}
                  </td>
                  <td className="py-2 px-2.5 text-right font-medium text-white">
                    {analyst.resolution_rate_percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turnaround Time Analysis (Q04) */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              Mean Resolution Turnaround Time (Query Q04)
            </h2>
            <div className="text-[11px] text-zinc-400">
              Calculated via AVG(EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 3600)
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 bg-black px-2 py-0.5 rounded border border-zinc-800">
            AVG(EPOCH) / 3600
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {resolutionTurnaround.map((t) => (
            <div key={t.user_id} className="p-3 rounded bg-black border border-zinc-800 text-center">
              <div className="text-xs text-zinc-300 font-medium">{t.analyst_name}</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {parseFloat(t.avg_turnaround_hours) < 24
                  ? `${t.avg_turnaround_hours}h`
                  : `${(parseFloat(t.avg_turnaround_hours) / 24).toFixed(1)}d`}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {t.resolved_count} incidents resolved
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
