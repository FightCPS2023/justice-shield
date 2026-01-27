# Required Dependencies for Analytics & Monitoring

## Install These Packages

To enable Google Analytics and Sentry error tracking, install these packages:

```bash
npm install @sentry/react
```

## Package Details

### @sentry/react
- **Version:** Latest (^7.0.0 or higher recommended)
- **Purpose:** Error tracking, performance monitoring, session replay
- **Size:** ~120KB minified
- **License:** MIT

## Installation Commands

### npm
```bash
npm install @sentry/react
```

### yarn
```bash
yarn add @sentry/react
```

### pnpm
```bash
pnpm add @sentry/react
```

## Already Included

These packages are already configured in the app:
- React (core framework)
- TypeScript (type safety)

## Optional: Analytics Plugins

If you want enhanced GA4 features:

```bash
npm install @analytics/google-analytics
```

But the built-in implementation in `/utils/analytics.ts` is sufficient for most needs.

## Verification

After installation, verify by checking your `package.json`:

```json
{
  "dependencies": {
    "@sentry/react": "^7.x.x",
    // ... other dependencies
  }
}
```

## Import Usage

These packages are imported in:
- `/utils/sentry.ts` - Sentry configuration
- `/components/ErrorBoundary.tsx` - Error boundary component
- `/App.tsx` - Application initialization

No additional configuration needed beyond environment variables!
