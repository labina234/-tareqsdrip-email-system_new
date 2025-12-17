'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface EmailSettings {
  id: string;
  emailSystemEnabled: boolean;
  maintenanceMode: boolean;
  enableSalesEmails: boolean;
  enableOfferEmails: boolean;
  enableNewProductEmails: boolean;
  enableOrderEmails: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string | null;
  maxEmailsPerDay: number;
  updatedAt: string;
  updatedByName: string | null;
}

export default function AdminEmailSettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [original, setOriginal] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/email/settings', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setOriginal(data);
      } else {
        const body = await response.text();
        console.error('Failed to load settings', response.status, body);
        showMessage('error', `Failed to load settings (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateEmail = (email: string) => /.+@.+\..+/.test(email);

  const validationErrors = useMemo(() => {
    if (!settings) return [];
    const errors: string[] = [];
    if (!settings.fromName.trim()) errors.push('From Name is required');
    if (!validateEmail(settings.fromEmail)) errors.push('From Email is invalid');
    if (settings.replyTo && !validateEmail(settings.replyTo)) errors.push('Reply-To is invalid');
    if (settings.maxEmailsPerDay < 0 || settings.maxEmailsPerDay > 100) {
      errors.push('Max emails per day must be 0-100');
    }
    return errors;
  }, [settings]);

  const isDirty = useMemo(() => {
    if (!settings || !original) return false;
    return JSON.stringify(settings) !== JSON.stringify(original);
  }, [settings, original]);

  const handleSave = async () => {
    if (!settings || validationErrors.length > 0) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/email/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include',
      });

      if (response.ok) {
        const saved = await response.json();
        setOriginal(saved);
        setSettings(saved);
        showMessage('success', 'Settings saved successfully');
      } else {
        const body = await response.text();
        console.error('Failed to save settings', response.status, body);
        showMessage('error', `Failed to save settings (${response.status})`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (original) {
      setSettings({ ...original });
    }
  };

  const handleTestEmail = async () => {
    setSendingTest(true);
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        showMessage('success', 'Test email sent successfully');
      } else {
        const body = await response.text();
        console.error('Failed to send test email', response.status, body);
        showMessage('error', `Failed to send test email (${response.status})`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showMessage('error', 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const updateSetting = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="h-16 w-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Failed to load settings</div>
      </div>
    );
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

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
                Campaigns
              </Link>
              <Link
                href="/admin/logs"
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Logs
              </Link>
              <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center text-sm text-white">
                {user?.firstName?.[0] || user?.username?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Email Settings</h1>
            <p className="text-white/60">
              Control global email features, sender identity, and delivery safeguards.
            </p>
            {settings.updatedAt && (
              <p className="text-white/40 text-sm mt-2">
                Last updated: {getRelativeTime(settings.updatedAt)} by{' '}
                {settings.updatedByName || 'John Doe'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition text-sm"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleTestEmail}
              disabled={sendingTest}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition text-sm disabled:opacity-50"
            >
              {sendingTest ? 'Sending...' : 'Test Email'}
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving || validationErrors.length > 0}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition ${
                !isDirty || saving || validationErrors.length > 0
                  ? 'bg-purple-400/50 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Toast Messages */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 px-4 py-3 rounded-lg border bg-red-500/10 border-red-500/20 text-red-300">
            {validationErrors[0]}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Global Master Controls */}
            <GlassCard>
              <CardHeader title="Global Status" />
              <div className="space-y-4">
                <ToggleRow
                  label="Email System Enabled"
                  description="Master switch for all email sending"
                  checked={settings.emailSystemEnabled}
                  onChange={(v) => updateSetting('emailSystemEnabled', v)}
                  statusChip={settings.emailSystemEnabled}
                />
                {!settings.emailSystemEnabled && (
                  <WarningBox text="All email sending is currently disabled system-wide" />
                )}
              </div>
            </GlassCard>

            {/* Global Email Types */}
            <GlassCard>
              <CardHeader title="Global Email Types" icon="✉️" />
              <div className="space-y-3">
                <ToggleRow
                  label="Sales Announcements"
                  description="Email reminders and automatically crafted drip emails"
                  checked={settings.enableSalesEmails}
                  onChange={(v) => updateSetting('enableSalesEmails', v)}
                  statusChip={settings.enableSalesEmails}
                  warning={!settings.enableSalesEmails ? 'This will stop this email type for all users.' : undefined}
                />
                <ToggleRow
                  label="Special Offers"
                  description="Email senders send consent offers on call"
                  checked={settings.enableOfferEmails}
                  onChange={(v) => updateSetting('enableOfferEmails', v)}
                  statusChip={settings.enableOfferEmails}
                  warning={!settings.enableOfferEmails ? 'This will stop this email type for all users.' : undefined}
                />
                <ToggleRow
                  label="New Products"
                  description="Alerts about product type for all users"
                  checked={settings.enableNewProductEmails}
                  onChange={(v) => updateSetting('enableNewProductEmails', v)}
                  statusChip={settings.enableNewProductEmails}
                  warning={!settings.enableNewProductEmails ? 'This will stop this email type for all users.' : undefined}
                />
                <ToggleRow
                  label="Order Emails"
                  description="Critical transactional and order update emails"
                  checked={settings.enableOrderEmails}
                  onChange={(v) => updateSetting('enableOrderEmails', v)}
                  statusChip={settings.enableOrderEmails}
                  warning={!settings.enableOrderEmails ? 'This will stop this email type for all users.' : undefined}
                />
              </div>
            </GlassCard>

            {/* Sender Information */}
            <GlassCard>
              <CardHeader title="Sender Information" icon="👤" />
              <div className="grid md:grid-cols-2 gap-4">
                <TextField
                  label="From Name"
                  value={settings.fromName}
                  onChange={(v) => updateSetting('fromName', v)}
                  placeholder="TareqsDrip"
                  error={!settings.fromName.trim()}
                />
                <TextField
                  label="From Email"
                  value={settings.fromEmail}
                  onChange={(v) => updateSetting('fromEmail', v)}
                  placeholder="noreply@tareqsdrip.com"
                  type="email"
                  error={!validateEmail(settings.fromEmail)}
                />
              </div>
              <TextField
                label="Reply-To Address"
                value={settings.replyTo || ''}
                onChange={(v) => updateSetting('replyTo', v || null)}
                placeholder="support@tareqsdrip.com"
                type="email"
                helper="Optional"
                error={!!settings.replyTo && !validateEmail(settings.replyTo)}
              />
            </GlassCard>

            {/* Rate Limits & Safety */}
            <GlassCard>
              <CardHeader title="Rate Limits & Safety" icon="🛡️" />
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Max emails per user per day</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.maxEmailsPerDay}
                      onChange={(e) => updateSetting('maxEmailsPerDay', Number(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white font-medium min-w-[100px] text-center">
                      {settings.maxEmailsPerDay} <span className="text-white/60">/ day</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>0</span>
                    <span>20</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Status & Monitoring */}
          <div className="space-y-6">
            {/* Email Provider */}
            <GlassCard>
              <CardHeader title="Email Provider" icon="📧" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Provider</span>
                  <span className="text-white font-medium">Mailtrap</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Connection</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-white text-sm">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Last send attempt</span>
                  <span className="text-white/80 text-sm">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Failures in last 24h</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <button className="w-full mt-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition text-sm">
                  Open Provider Settings →
                </button>
              </div>
            </GlassCard>

            {/* Monitoring */}
            <GlassCard>
              <CardHeader title="Monitoring" icon="📊" />
              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatBox label="Sent today" value={120} />
                <StatBox label="Failed today" value={3} color="red" />
                <StatBox label="Skipped today" value={5} color="yellow" />
              </div>
              <div className="space-y-2">
                <Link
                  href="/admin/logs"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/80 text-sm"
                >
                  <span>View Logs</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/logs?filter=failed"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/80 text-sm"
                >
                  <span>View Failed Emails</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/email/campaigns"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/80 text-sm"
                >
                  <span>View Recent Campaign Runs</span>
                  <span>→</span>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}

// UI Components
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
      {children}
    </div>
  );
}

function CardHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-xl">{icon}</span>}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  statusChip,
  warning,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  statusChip?: boolean;
  warning?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-white font-medium">{label}</div>
            {statusChip !== undefined && (
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  statusChip
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}
              >
                {statusChip ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>
          <div className="text-white/60 text-sm mt-1">{description}</div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {warning && <div className="text-yellow-300 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">⚠️ {warning}</div>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  helper,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  helper?: string;
  error?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/80 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg bg-white/10 border ${
          error ? 'border-red-500/50' : 'border-white/20'
        } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
      />
      {helper && <p className="text-white/40 text-xs mt-1">{helper}</p>}
    </div>
  );
}

function StatBox({
  label,
  value,
  color = 'purple',
}: {
  label: string;
  value: number;
  color?: 'purple' | 'red' | 'yellow';
}) {
  const colorClasses = {
    purple: 'bg-purple-500/20 border-purple-500/30',
    red: 'bg-red-500/20 border-red-500/30',
    yellow: 'bg-yellow-500/20 border-yellow-500/30',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/60 text-xs mt-1">{label}</div>
    </div>
  );
}

function WarningBox({ text }: { text: string }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-300 text-sm">
      ⚠️ {text}
    </div>
  );
}
