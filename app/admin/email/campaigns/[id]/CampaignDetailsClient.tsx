'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  subject: string;
  description?: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: string;
  targetAll: boolean;
  logs?: EmailLog[];
}

interface EmailLog {
  id: string;
  userId: string;
  email: string;
  type: string;
  subject: string;
  status: string;
  error?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

export default function CampaignDetailsClient() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCampaign();

    // Poll for updates if campaign is SENDING
    if (campaign?.status === 'SENDING') {
      const interval = setInterval(fetchCampaign, 3000); // Poll every 3 seconds
      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [campaignId, campaign?.status]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/admin/email/campaigns/${campaignId}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      } else if (res.status === 404) {
        router.push('/admin/email/campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign? This will send emails to real users.'))
      return;

    try {
      const res = await fetch(`/api/admin/email/campaigns/${campaignId}/send`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        alert('Campaign queued for sending!');
        fetchCampaign();
      } else {
        alert('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const res = await fetch(`/api/admin/email/campaigns/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/admin/email/campaigns');
      } else {
        alert('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="h-16 w-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Campaign not found</div>
      </div>
    );
  }

  const statusConfig = {
    DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
    SCHEDULED: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    SENDING: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
    },
    SENT: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    FAILED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  };

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.DRAFT;

  const successRate =
    campaign.totalRecipients > 0
      ? Math.round((campaign.successCount / campaign.totalRecipients) * 100)
      : 0;

  const skippedCount =
    campaign.totalRecipients - campaign.successCount - campaign.failureCount;

  const filteredLogs = campaign.logs
    ? statusFilter === 'all'
      ? campaign.logs
      : campaign.logs.filter((log) => log.status === statusFilter)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500" />
                <div className="text-lg tracking-wide text-white">
                  TAREQS<span className="text-purple-300">DRIP</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/email/campaigns"
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition"
              >
                ← Campaigns
              </Link>
              <Link
                href="/admin/email/settings"
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Settings
              </Link>
              <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center text-sm text-white">
                {user?.firstName?.[0] || user?.username?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.text} ${status.border}`}
              >
                {campaign.status}
                {campaign.status === 'SENDING' && (
                  <span className="ml-2 inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                )}
              </span>
            </div>
            <p className="text-white/60">{campaign.subject}</p>
            {campaign.description && (
              <p className="text-white/40 text-sm mt-2">{campaign.description}</p>
            )}
            <p className="text-white/40 text-sm mt-2">
              Created {getRelativeTime(campaign.createdAt)}
              {campaign.sentAt && ` • Sent ${getRelativeTime(campaign.sentAt)}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {campaign.status === 'DRAFT' && (
              <>
                <button
                  onClick={handleSend}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Send Campaign
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </>
            )}
            {campaign.status === 'SCHEDULED' && (
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition"
              >
                Cancel Campaign
              </button>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard label="Total Recipients" value={campaign.totalRecipients} />
          <MetricCard
            label="Successfully Sent"
            value={campaign.successCount}
            color="green"
          />
          <MetricCard label="Failed" value={campaign.failureCount} color="red" />
          <MetricCard label="Skipped" value={skippedCount} color="yellow" />
          <MetricCard
            label="Success Rate"
            value={`${successRate}%`}
            color={successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red'}
          />
        </div>

        {/* Progress Bar (for SENDING status) */}
        {campaign.status === 'SENDING' && campaign.totalRecipients > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Sending Progress</h3>
              <span className="text-white/60 text-sm">
                {campaign.successCount + campaign.failureCount} / {campaign.totalRecipients}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((campaign.successCount + campaign.failureCount) /
                      campaign.totalRecipients) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Campaign Info */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Campaign Details</h3>
            <dl className="grid md:grid-cols-2 gap-4">
              <DetailRow label="Email Type" value={campaign.type} />
              <DetailRow
                label="Audience"
                value={campaign.targetAll ? 'All Users' : 'Custom Segment'}
              />
              <DetailRow label="Subject Line" value={campaign.subject} />
              <DetailRow
                label="Scheduled"
                value={
                  campaign.scheduledAt
                    ? new Date(campaign.scheduledAt).toLocaleString()
                    : 'Send immediately'
                }
              />
            </dl>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Engagement</h3>
            <dl className="space-y-3">
              <DetailRow
                label="Opens"
                value={`${campaign.openCount} (${
                  campaign.successCount > 0
                    ? Math.round((campaign.openCount / campaign.successCount) * 100)
                    : 0
                }%)`}
              />
              <DetailRow
                label="Clicks"
                value={`${campaign.clickCount} (${
                  campaign.successCount > 0
                    ? Math.round((campaign.clickCount / campaign.successCount) * 100)
                    : 0
                }%)`}
              />
            </dl>
          </div>
        </div>

        {/* Email Logs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Email Logs</h3>
              <span className="text-white/60 text-sm">
                {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Log Filters */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Filter:</span>
              {['all', 'SENT', 'FAILED', 'SKIPPED', 'QUEUED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    statusFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60">
                {statusFilter === 'all' ? 'No email logs yet' : `No ${statusFilter} logs`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-white/80 text-sm font-medium">
                        Recipient
                      </th>
                      <th className="text-left px-6 py-4 text-white/80 text-sm font-medium">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-white/80 text-sm font-medium">
                        Timestamp
                      </th>
                      <th className="text-left px-6 py-4 text-white/80 text-sm font-medium">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 100).map((log) => (
                      <LogTableRow key={log.id} log={log} getRelativeTime={getRelativeTime} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-white/10">
                {filteredLogs.slice(0, 100).map((log) => (
                  <LogCard key={log.id} log={log} getRelativeTime={getRelativeTime} />
                ))}
              </div>

              {filteredLogs.length > 100 && (
                <div className="p-4 border-t border-white/10 text-center">
                  <p className="text-white/60 text-sm">
                    Showing first 100 of {filteredLogs.length} logs
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  color = 'purple',
}: {
  label: string;
  value: number | string;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'yellow';
}) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    yellow: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl border rounded-2xl p-6`}
    >
      <div className="text-white/60 text-sm mb-2">{label}</div>
      <div className="text-2xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/40 text-sm mb-1">{label}</dt>
      <dd className="text-white/90">{value}</dd>
    </div>
  );
}

// Log Table Row Component
function LogTableRow({
  log,
  getRelativeTime,
}: {
  log: EmailLog;
  getRelativeTime: (date: string) => string;
}) {
  const logStatusConfig = {
    SENT: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    FAILED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
    QUEUED: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    SKIPPED: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
    DELIVERED: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    OPENED: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    CLICKED: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
    BOUNCED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  };

  const logStatus =
    logStatusConfig[log.status as keyof typeof logStatusConfig] || logStatusConfig.QUEUED;

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition">
      <td className="px-6 py-4">
        <div className="text-white/90">{log.email}</div>
        <div className="text-white/40 text-xs mt-1">{log.userId.slice(0, 12)}...</div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${logStatus.bg} ${logStatus.text} ${logStatus.border}`}
        >
          {log.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-white/80 text-sm">
          {log.sentAt
            ? getRelativeTime(log.sentAt)
            : getRelativeTime(log.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4">
        {log.error ? (
          <div className="text-red-300 text-sm">{log.error}</div>
        ) : log.deliveredAt ? (
          <div className="text-white/60 text-sm">
            Delivered {getRelativeTime(log.deliveredAt)}
          </div>
        ) : (
          <span className="text-white/40 text-sm">—</span>
        )}
      </td>
    </tr>
  );
}

// Log Card Component (Mobile)
function LogCard({
  log,
  getRelativeTime,
}: {
  log: EmailLog;
  getRelativeTime: (date: string) => string;
}) {
  const logStatusConfig = {
    SENT: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    FAILED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
    QUEUED: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    SKIPPED: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
    DELIVERED: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    OPENED: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    CLICKED: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
    BOUNCED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  };

  const logStatus =
    logStatusConfig[log.status as keyof typeof logStatusConfig] || logStatusConfig.QUEUED;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-white/90 mb-1">{log.email}</div>
          <div className="text-white/40 text-xs">{log.userId.slice(0, 16)}...</div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${logStatus.bg} ${logStatus.text} ${logStatus.border}`}
        >
          {log.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-white/40">Time:</span>{' '}
          <span className="text-white/80">
            {log.sentAt ? getRelativeTime(log.sentAt) : getRelativeTime(log.createdAt)}
          </span>
        </div>
        {log.error && (
          <div className="col-span-2">
            <span className="text-white/40">Error:</span>{' '}
            <span className="text-red-300">{log.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
