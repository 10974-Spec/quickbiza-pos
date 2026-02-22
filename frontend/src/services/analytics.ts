/**
 * ============================================================
 *  QuickBiza POS — Centralized Analytics & UX Tracking Service
 * ============================================================
 *
 *  Integrates:
 *    1. PostHog   — full product analytics + session replay
 *    2. Mixpanel  — funnel & retention analytics
 *    3. Amplitude — enterprise-grade behavioral analytics
 *
 *  Hotjar and Microsoft Clarity are injected as <script> tags
 *  directly in `index.html` since they don't have npm packages.
 *
 *  Usage:
 *    import analytics from '@/services/analytics';
 *    analytics.identify('user_123', { name: 'Jane', plan: 'pro' });
 *    analytics.track('subscription_created', { plan: 'pro', amount: 2000 });
 *
 *  Required env vars (in frontend/.env):
 *    VITE_POSTHOG_KEY
 *    VITE_POSTHOG_HOST
 *    VITE_MIXPANEL_TOKEN
 *    VITE_AMPLITUDE_KEY
 */

import posthog from 'posthog-js';
import mixpanel from 'mixpanel-browser';
import * as amplitude from '@amplitude/analytics-browser';

// ─── Read env vars (Vite exposes VITE_* vars via import.meta.env) ────────────
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
// Real token as fallback so it works even if .env isn't loaded (e.g. Electron prod)
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'e7c51ba46e3e3fe3ac157bc13f2a3883';
const AMPLITUDE_KEY = import.meta.env.VITE_AMPLITUDE_KEY || '';

// ─── Initialization ──────────────────────────────────────────────────────────
export function initAnalytics() {
    // 1️⃣ PostHog — product analytics + session replay
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            capture_pageview: true,
            session_recording: { maskAllInputs: false },
            autocapture: true,
            loaded: (ph) => { if (import.meta.env.DEV) ph.debug(); },
        });
    }

    // 2️⃣ Mixpanel — funnel + retention analytics
    if (MIXPANEL_TOKEN) {
        mixpanel.init(MIXPANEL_TOKEN, {
            debug: import.meta.env.DEV,
            track_pageview: true,
            persistence: 'localStorage',
            autocapture: true,
            record_sessions_percent: 100,
        });
    }

    // 3️⃣ Amplitude — only init if a real key is set (avoids API key errors)
    if (AMPLITUDE_KEY && !AMPLITUDE_KEY.startsWith('REPLACE_')) {
        amplitude.init(AMPLITUDE_KEY, {
            defaultTracking: { sessions: true, pageViews: true, formInteractions: true },
        });
    }
}

// ─── Identify User (call after login) ────────────────────────────────────────
export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
    if (POSTHOG_KEY) posthog.identify(userId, traits);
    if (MIXPANEL_TOKEN) mixpanel.identify(userId);
    if (MIXPANEL_TOKEN && Object.keys(traits).length > 0) mixpanel.people.set(traits);
    if (AMPLITUDE_KEY) amplitude.setUserId(userId);
}

// ─── Reset on Logout ─────────────────────────────────────────────────────────
export function resetUser() {
    if (POSTHOG_KEY) posthog.reset();
    if (MIXPANEL_TOKEN) mixpanel.reset();
    if (AMPLITUDE_KEY) amplitude.reset();
}

// ─── Track Event (fires to ALL platforms at once) ────────────────────────────
export function track(event: string, properties: Record<string, unknown> = {}) {
    if (POSTHOG_KEY) posthog.capture(event, properties);
    if (MIXPANEL_TOKEN) mixpanel.track(event, properties);
    if (AMPLITUDE_KEY) amplitude.track(event, properties);
}

// ─── Track Page View ─────────────────────────────────────────────────────────
export function trackPageView(pageName: string, properties: Record<string, unknown> = {}) {
    track('Page Viewed', { page: pageName, ...properties });
}

// ─── Feature Flags (PostHog only) ────────────────────────────────────────────
export function isFeatureEnabled(flagName: string): boolean {
    if (!POSTHOG_KEY) return false;
    return posthog.isFeatureEnabled(flagName) ?? false;
}

// ─── Default export as object ────────────────────────────────────────────────
const analytics = { init: initAnalytics, identify: identifyUser, reset: resetUser, track, trackPageView, isFeatureEnabled };
export default analytics;
