'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface EmailLog {
  id: string;
  userId: string;
  email: string;
  type: string;
  subject: string;
  status: string;
  error?: string | null;
  messageId?: string | null;
  createdAt: string;
}

export default function AdminLogsPage() {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const url = new URL('/api/logs', window.location.origin);
        if (statusFilter) url.searchParams.set('status', statusFilter);
        url.searchParams.set('limit', '100');
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setLogs(data.logs as EmailLog[]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => {
      mounted = false;
    };
  }, [getToken, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Email Logs</h1>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20"
            >
              <option value="">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-white/10 rounded" />
              <div className="h-6 bg-white/10 rounded" />
              <div className="h-6 bg-white/10 rounded" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-white/70">No logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-white/80">
                <thead className="text-white">
                  <tr>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Recipient</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-white/10">
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'SENT'
                            ? 'bg-green-500/20 text-green-300'
                            : log.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{log.email}</td>
                      <td className="px-4 py-2">{log.type}</td>
                      <td className="px-4 py-2 truncate max-w-[360px]">{log.subject}</td>
                      <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
