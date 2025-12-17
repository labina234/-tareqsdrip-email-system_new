'use client';

import { useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';

interface EmailPreference {
  id: string;
  salesEmails: boolean;
  offerEmails: boolean;
  newProductEmails: boolean;
  orderConfirmation: boolean;
  orderUpdates: boolean;
  unsubscribedAll: boolean;
}

export default function UserEmailPreferences() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<EmailPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error'; visible: boolean } | null>(null);
  const prefRef = useRef<EmailPreference | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/email/preferences', { credentials: 'include' });
      if (!res.ok) {
        const body = await res.text();
        console.error('Failed to load preferences', res.status, body);
        setPreferences(null);
      } else {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (e) {
      console.error('Error fetching preferences:', e);
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences(next: EmailPreference, opts?: { auto?: boolean }) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/email/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('Failed to save preferences', res.status, body);
        if (opts?.auto) {
          showToast('Failed to save preferences', 'error');
        } else {
          setMessage('Failed to save preferences');
        }
      } else {
        if (opts?.auto) {
          showToast('Preferences saved successfully.', 'success');
        } else {
          setMessage('Preferences saved successfully.');
          setTimeout(() => setMessage(null), 2500);
        }
      }
    } catch (e) {
      console.error('Error saving preferences:', e);
      if (opts?.auto) {
        showToast('Failed to save preferences', 'error');
      } else {
        setMessage('Failed to save preferences');
      }
    } finally {
      setSaving(false);
    }
  }

  function updatePref<K extends keyof EmailPreference>(key: K, value: EmailPreference[K]) {
    if (!preferences) return;
    const next = { ...preferences, [key]: value } as EmailPreference;
    setPreferences(next);
    prefRef.current = next;
    // Debounce auto-save to avoid spamming the API
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      if (prefRef.current) void savePreferences(prefRef.current, { auto: true });
    }, 600);
  }

  function showToast(text: string, type: 'success' | 'error') {
    setToast({ text, type, visible: true });
    // Auto-hide after 2.5s with fade-out
    window.setTimeout(() => setToast((t) => (t ? { ...t, visible: false } : null)), 2200);
    window.setTimeout(() => setToast(null), 2600);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 grid place-items-center">
        <div className="h-16 w-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500" />
                  <div className="text-lg tracking-wide text-white">
                    TAREQS<span className="text-purple-300">DRIP</span>
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center text-sm text-white">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Email Preferences</h1>
              <p className="text-white/60">Manage which emails you want to receive from TareqsDrip.</p>
            </div>

            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-lg border ${
                  message.includes('successfully')
                    ? 'bg-green-500/10 border-green-500/20 text-green-300'
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}
              >
                {message}
              </div>
            )}

            {!preferences ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white/60">
                Failed to load preferences.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-3">Marketing Emails</h2>
                  <p className="text-white/60 text-sm mb-4">Controls non-critical promotional communication.</p>
                  <div className="space-y-3">
                    <PreferenceToggle
                      label="Sales Announcements"
                      description="Notifications about sales, discounts, and promotional events."
                      checked={preferences.salesEmails}
                      disabled={preferences.unsubscribedAll}
                      onChange={(v) => updatePref('salesEmails', v)}
                    />
                    <PreferenceToggle
                      label="Special Offers"
                      description="Exclusive offers, coupon codes, and limited-time deals."
                      checked={preferences.offerEmails}
                      disabled={preferences.unsubscribedAll}
                      onChange={(v) => updatePref('offerEmails', v)}
                    />
                    <PreferenceToggle
                      label="New Products"
                      description="Updates when new products or features are launched."
                      checked={preferences.newProductEmails}
                      disabled={preferences.unsubscribedAll}
                      onChange={(v) => updatePref('newProductEmails', v)}
                    />
                    {preferences.unsubscribedAll && (
                      <div className="text-yellow-300 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                        ⚠️ Marketing toggles are locked because global unsubscribe is enabled.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-3">Order & Transactional Emails</h2>
                  <p className="text-white/60 text-sm mb-4">Important non-marketing communication.</p>
                  <div className="space-y-3">
                    <PreferenceToggle
                      label="Order Confirmations"
                      description="Confirmation emails after placing an order."
                      checked={preferences.orderConfirmation}
                      onChange={(v) => updatePref('orderConfirmation', v)}
                    />
                    <PreferenceToggle
                      label="Shipping & Delivery Updates"
                      description="Tracking, shipping, and delivery status updates."
                      checked={preferences.orderUpdates}
                      onChange={(v) => updatePref('orderUpdates', v)}
                    />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-semibold mb-3">Global Unsubscribe</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Stop receiving all promotional emails. You will still receive essential order and account-related emails.
                  </p>
                  <PreferenceToggle
                    label="Unsubscribe from all marketing emails"
                    description="Disables all promotional emails. Order confirmations and shipping updates are unaffected."
                    checked={preferences.unsubscribedAll}
                    onChange={(v) => updatePref('unsubscribedAll', v)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => preferences && savePreferences(preferences, { auto: false })}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition ${
                      saving
                        ? 'bg-purple-400/50 text-white/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                    }`}
                  >
                    {saving ? 'Saving…' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}
          </main>
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg border backdrop-blur-xl transition-opacity duration-400 ${
                toast.type === 'success'
                  ? 'bg-green-500/20 border-green-500/30 text-green-200'
                  : 'bg-red-500/20 border-red-500/30 text-red-200'
              } ${toast.visible ? 'opacity-100' : 'opacity-0'}`}
            >
              {toast.text}
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 grid place-items-center p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center max-w-md">
            <h1 className="text-3xl font-bold text-white mb-3">Email Preferences</h1>
            <p className="text-white/60 mb-6">Please sign in to manage your email preferences.</p>
            <SignInButton mode="modal">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex-1">
        <div className={`font-medium ${disabled ? 'text-white/40' : 'text-white'}`}>{label}</div>
        <div className={`text-sm mt-1 ${disabled ? 'text-white/30' : 'text-white/60'}`}>{description}</div>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          disabled ? 'bg-gray-600 cursor-not-allowed' : checked ? 'bg-green-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
