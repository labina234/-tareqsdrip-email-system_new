import { GlassCard } from "@/app/components/dashboard-ui";

export const dynamic = "force-dynamic";

export default function EmailSystemDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-3xl md:text-4xl text-white/95">Email System Documentation</div>
            <div className="mt-2 text-sm md:text-base text-white/70 max-w-3xl">
              This email system handles all transactional and marketing emails for the platform. It respects admin configuration, user preferences, rate limits, and logs every delivery attempt for transparency and debugging.
            </div>
          </div>
          <a href="/" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">Back to Dashboard</a>
        </div>

        <div className="grid gap-6">
          {/* 2. System architecture overview */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">System Architecture Overview</div>
            <div className="mt-2 text-sm text-white/70">Plain-language description of how components interact.</div>
            <div className="mt-4 grid gap-2 text-sm text-white/80">
              <div><span className="text-white/90">Trigger Sources:</span> orders, signups, campaigns, webhooks.</div>
              <div><span className="text-white/90">Background Processing:</span> Inngest and worker queues handle all email logic asynchronously to keep the app fast and allow retries.</div>
              <div><span className="text-white/90">Email Providers:</span> Mailtrap, SendGrid, or SMTP deliver messages and return success/failure responses.</div>
              <div><span className="text-white/90">Database:</span> Prisma models store settings, preferences, campaigns, and logs.</div>
              <div><span className="text-white/90">Logging & Analytics:</span> Every attempt is recorded for dashboards and troubleshooting, including skipped cases.</div>
              <div className="mt-3 text-white/70">
                Emails are sent asynchronously to prevent user-facing delays. Temporary failures are retried automatically; skipped emails are still logged so admins can see what happened and why.
              </div>
            </div>
          </GlassCard>

          {/* 3. Email types reference */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">Email Types Reference</div>
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-white/80">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-white/90">Transactional Emails</div>
                <ul className="mt-2 list-disc pl-5">
                  <li>Order confirmation, shipping updates, password reset</li>
                  <li>Sent when specific actions occur</li>
                  <li>Users cannot opt out of critical transactional emails</li>
                  <li>Affected by sender configuration and rate limits</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-white/90">Marketing Emails</div>
                <ul className="mt-2 list-disc pl-5">
                  <li>Sales, offers, new products</li>
                  <li>Triggered by campaigns or scheduled sends</li>
                  <li>Users can opt out globally or by category</li>
                  <li>Admin enable/disable and rate limits apply</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-white/90">System Emails</div>
                <ul className="mt-2 list-disc pl-5">
                  <li>Admin alerts, failure notifications (if configured)</li>
                  <li>Audience is internal staff</li>
                  <li>Not affected by marketing opt-outs</li>
                  <li>Respect global enable/disable and sender settings</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* 4. Admin settings documentation */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">Admin Settings</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div>Enable or disable categories like sales, offers, and order emails.</div>
              <div>Configure sender name, sender email, and reply-to behavior.</div>
              <div>Set daily rate limits per system or per user.</div>
              <div className="mt-2 text-white/70">If a category is disabled, limits exceeded, or configuration invalid, emails are skipped and the reason is logged.</div>
            </div>
          </GlassCard>

          {/* 5. User preferences behavior */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">User Preferences</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div>"Unsubscribe from all" blocks marketing emails; critical transactional emails may still be sent.</div>
              <div>Preferences are checked per category before sending.</div>
              <div>Edge cases: missing preference defaults to send transactional, marketing follows global settings and consent.</div>
            </div>
          </GlassCard>

          {/* 6. Campaigns documentation */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">Email Campaigns</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div>Campaigns can be drafted, scheduled, or active with defined audiences.</div>
              <div>User preferences are respected; opted-out users are skipped.</div>
              <div>Throttling and batching protect provider limits and system performance.</div>
              <div>Active campaigns include any running or scheduled jobs not yet completed.</div>
              <div>If paused or cancelled, remaining emails are skipped and logged.</div>
            </div>
          </GlassCard>

          {/* 7. Stats & metrics explanation */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">Stats & Metrics</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div><span className="text-white/90">Email Templates:</span> Templates live in code under <span className="font-mono">lib/email/templates.tsx</span>; counts include active templates.</div>
              <div><span className="text-white/90">Active Campaigns:</span> Includes scheduled and currently sending campaigns.</div>
              <div><span className="text-white/90">Total Emails Sent:</span> Counts provider-accepted sends; skipped emails are excluded.</div>
              <div><span className="text-white/90">Delivery Success Rate:</span> Calculated as successful sends ÷ attempted sends × 100; drops due to provider errors, bounces, or timeouts.</div>
            </div>
          </GlassCard>

          {/* 8. Logs & debugging guide */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">Logs & Debugging</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div>Logs are stored centrally and accessible via the Admin Logs screen.</div>
              <div>Statuses include <span className="font-mono">SENT</span>, <span className="font-mono">SKIPPED</span>, and <span className="font-mono">FAILED</span>.</div>
              <div>Common failures: provider timeouts, invalid sender config, rate limit exceeded.</div>
              <div>Admins should review reasons, fix configuration, and re-run if needed.</div>
            </div>
          </GlassCard>

          {/* 9. API reference */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">API Reference (Internal)</div>
            <div className="mt-3 grid gap-3 text-sm text-white/80">
              <div>
                <div className="text-white/90">GET /api/stats</div>
                <div>Returns system-wide email stats for dashboards.</div>
              </div>
              <div>
                <div className="text-white/90">GET /api/email/preferences</div>
                <div>Fetches current user's preferences.</div>
              </div>
              <div>
                <div className="text-white/90">PUT /api/admin/email/settings</div>
                <div>Updates global admin email settings; restricted to admins.</div>
              </div>
            </div>
          </GlassCard>

          {/* 10. FAQ & common issues */}
          <GlassCard className="p-6">
            <div className="text-xl text-white/95">FAQ & Common Issues</div>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <div><span className="text-white/90">Why wasn\'t an email sent?</span> Check admin settings, user preferences, and rate limits; logs show SKIPPED reasons.</div>
              <div><span className="text-white/90">Why does success rate show 0%?</span> No provider-accepted sends yet; investigate FAILED statuses.</div>
              <div><span className="text-white/90">Why do some users still get emails after unsubscribing?</span> Critical transactional emails bypass marketing opt-outs.</div>
              <div><span className="text-white/90">Why do emails work in dev but not production?</span> Verify environment variables, sender configuration, and provider credentials.</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
