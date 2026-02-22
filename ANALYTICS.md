# 📊 QuickBiza POS — Analytics & UX Tracking Guide

This document covers all 5 analytics and UX tracking tools integrated into **QuickBiza POS**, how they work, what they track, and how to configure them.

---

## Table of Contents

1.  [Architecture Overview](#architecture-overview)
2.  [Environment Variables Setup](#environment-variables-setup)
3.  [PostHog — Product Analytics](#1-posthog--product-analytics--session-replay)
4.  [Mixpanel — Funnel Analytics](#2-mixpanel--funnel--retention-analytics)
5.  [Amplitude — Behavioral Analytics](#3-amplitude--behavioral-analytics)
6.  [Hotjar — Heatmaps](#4-hotjar--heatmaps--ux-recording)
7.  [Microsoft Clarity — Free UX Tracking](#5-microsoft-clarity--free-ux-tracking)
8.  [Tracking Events in Your Code](#tracking-events-in-your-code)
9.  [Identifying Users](#identifying-users)
10. [Feature Flags (PostHog)](#feature-flags-posthog)

---

## Architecture Overview

All 5 tools are integrated with a **centralized analytics service** in `frontend/src/services/analytics.ts`.

```
User Action
    │
    ▼
analytics.track('event_name', { ...properties })
    │
    ├──▶  PostHog   (product analytics + session replay)
    ├──▶  Mixpanel  (funnels + cohorts)
    └──▶  Amplitude (behavioral analytics)

index.html <head>
    ├──▶  Hotjar    (heatmaps + scroll maps + recordings)
    └──▶  Clarity   (rage clicks + dead clicks + recordings)
```

### Why a centralized service?

- **Single source of truth** — one call fires to all platforms.
- **Easy to add/remove** tools without hunting through your codebase.
- **Consistent event names** across all dashboards.

---

## Environment Variables Setup

1.  Copy `.env.example` → `.env` in the `frontend/` directory:
    ```bash
    cp frontend/.env.example frontend/.env
    ```

2.  Fill in each key from the respective dashboards:

| Variable | Where to get it |
|---|---|
| `VITE_POSTHOG_KEY` | [app.posthog.com](https://app.posthog.com) → Project Settings → API Keys |
| `VITE_POSTHOG_HOST` | `https://app.posthog.com` (or your self-hosted URL) |
| `VITE_MIXPANEL_TOKEN` | [mixpanel.com](https://mixpanel.com) → Project Settings → Token |
| `VITE_AMPLITUDE_KEY` | [app.amplitude.com](https://app.amplitude.com) → Settings → API Key |
| `VITE_HOTJAR_ID` | [hotjar.com](https://www.hotjar.com) → Settings → Site ID |
| `VITE_CLARITY_PROJECT_ID` | [clarity.microsoft.com](https://clarity.microsoft.com) → Project → Settings |

> [!IMPORTANT]
> Hotjar and Clarity IDs must be entered **directly in `index.html`** in addition to the `.env` file. Search for `YOUR_HOTJAR_ID` and `YOUR_CLARITY_PROJECT_ID` in `frontend/index.html` and replace them.

---

## 1. PostHog — Product Analytics + Session Replay

**File:** `frontend/src/services/analytics.ts`
**Dashboard:** [app.posthog.com](https://app.posthog.com)

### What it tracks

| Feature | Description |
|---|---|
| **Page Views** | Auto-tracked on every route change |
| **Clicks & Inputs** | Auto-captured (autocapture: true) |
| **Session Recordings** | Full video replay of user sessions |
| **Custom Events** | Via `analytics.track()` |
| **Funnels** | Build in the PostHog dashboard |
| **Cohorts** | Group users by behavior |
| **Feature Flags** | Roll out features to specific user groups |

### Key Config (in `analytics.ts`)

```typescript
posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  capture_pageview: true,
  session_recording: { maskAllInputs: false },
  autocapture: true,
});
```

### Self-Hosted PostHog

Set `VITE_POSTHOG_HOST=https://your-posthog-instance.com` to point to a self-hosted instance (Docker required — see [PostHog self-host docs](https://posthog.com/docs/self-host)).

---

## 2. Mixpanel — Funnel & Retention Analytics

**File:** `frontend/src/services/analytics.ts`
**Dashboard:** [mixpanel.com](https://mixpanel.com)

### What it tracks

| Feature | Description |
|---|---|
| **Funnels** | Step-by-step conversion analysis |
| **Retention** | Weekly/monthly user return rates |
| **Cohorts** | Segments based on first action |
| **User Profiles** | Set properties via `analytics.identify()` |

### Key Config

```typescript
mixpanel.init(MIXPANEL_TOKEN, {
  track_pageview: true,
  persistence: 'localStorage',  // user ID survives page reload
});
```

---

## 3. Amplitude — Behavioral Analytics

**File:** `frontend/src/services/analytics.ts`
**Dashboard:** [app.amplitude.com](https://app.amplitude.com)

### What it tracks

| Feature | Description |
|---|---|
| **Sessions** | Auto-tracked session start/end |
| **Page Views** | Auto-tracked on route changes |
| **Form Interactions** | Inputs, submissions |
| **Custom Events** | Via `analytics.track()` |
| **Revenue Attribution** | Track what features drive revenue |

### Key Config

```typescript
amplitude.init(AMPLITUDE_KEY, {
  defaultTracking: {
    sessions: true,
    pageViews: true,
    formInteractions: true,
  }
});
```

---

## 4. Hotjar — Heatmaps & UX Recording

**File:** `frontend/index.html` (`<head>`)
**Dashboard:** [hotjar.com](https://www.hotjar.com)

### What it tracks

| Feature | Description |
|---|---|
| **Heatmaps** | Where users click most |
| **Scroll Maps** | How far users scroll |
| **Session Recordings** | Full visual replay |
| **Surveys** | On-page user feedback |

### Configuration

Hotjar is injected via a `<script>` tag in `index.html`. No npm package exists.

```html
<!-- In index.html <head>: -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid: YOUR_NUMERIC_ID, hjsv:6};
    ...
  })(window, document, ...);
</script>
```

**Replace `YOUR_HOTJAR_ID`** in `frontend/index.html` with your numeric Site ID from the Hotjar dashboard.

> [!NOTE]
> Hotjar's free tier provides limited recordings per month. Consider upgrading if you need more.

---

## 5. Microsoft Clarity — Free UX Tracking

**File:** `frontend/index.html` (`<head>`)
**Dashboard:** [clarity.microsoft.com](https://clarity.microsoft.com)
**Cost:** 100% Free, no recording limits.

### What it tracks

| Feature | Description |
|---|---|
| **Rage Clicks** | Rapid repeated clicks (signals frustration) |
| **Dead Clicks** | Clicks on non-interactive elements |
| **Session Recordings** | Unlimited full session replays |
| **Scroll Depth** | How far users scroll |
| **Heatmaps** | Click density maps |

### Configuration

```html
<!-- In index.html <head>: -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    ...
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

**Replace `YOUR_CLARITY_PROJECT_ID`** in `frontend/index.html` with your Project ID from the Clarity dashboard.

---

## Tracking Events in Your Code

Import the analytics service and use the `track()` function anywhere in your components:

```typescript
import analytics from '@/services/analytics';

// Track a subscription
analytics.track('subscription_created', {
  plan: 'fleet_management',
  amount: 2000,
  currency: 'KES',
});

// Track a sale
analytics.track('sale_completed', {
  order_id: 'ORD-001',
  total: 1500,
  items: 3,
  payment_method: 'mpesa',
});

// Track a feature usage
analytics.track('inventory_exported', {
  format: 'excel',
  row_count: 150,
});

// Track a page view (for custom routes)
analytics.trackPageView('Fleet Dashboard');
```

### Recommended Events to Track

| Event | When to fire |
|---|---|
| `login_success` | After successful login |
| `sale_completed` | After POS checkout |
| `product_created` | After adding a product |
| `subscription_created` | After Extra Features payment |
| `report_generated` | After a report is exported |
| `inventory_exported` | When Excel/Table export is used |
| `staff_added` | When a new employee is added |

---

## Identifying Users

After login, call `analytics.identify()` to link events to a specific user across all platforms:

```typescript
import analytics from '@/services/analytics';

// In your login success handler:
analytics.identify(user.id.toString(), {
  name: user.full_name,
  role: user.role,
  company: settings.company_name,
  plan: 'starter',
});
```

### On Logout

Call `analytics.reset()` to unlink the user:

```typescript
analytics.reset(); // clears user identity from PostHog, Mixpanel, Amplitude
```

---

## Feature Flags (PostHog)

Use PostHog's feature flags to roll out features to specific users:

```typescript
import analytics from '@/services/analytics';

// Check if a flag is enabled for the current user
const isNewDashboardEnabled = analytics.isFeatureEnabled('new-dashboard');

if (isNewDashboardEnabled) {
  // Show the new dashboard
} else {
  // Show the old one
}
```

Feature flags are managed in the [PostHog dashboard](https://app.posthog.com) — no code deployment required to toggle them.

---

## Adding the Centralized analytics.ts service to your components

Connect analytics at key moments in the user journey. For example, in `ExtraFeatures.tsx`:

```typescript
import analytics from '@/services/analytics';

const processPayment = async () => {
  // On success:
  analytics.track('subscription_created', {
    module: 'fleet',
    amount: 2000,
    currency: 'KES',
  });
};
```

---

*Last updated: 2026-02-20 — QuickBiza POS v1.0*
