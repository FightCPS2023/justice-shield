// Sentry Error Tracking Configuration
// Replace with your actual Sentry DSN from https://sentry.io

import { getEnv, getMode, isDev } from './env';

// Check if Sentry package is available
const isSentryAvailable = (): boolean => {
  try {
    // Try to import Sentry dynamically
    return typeof window !== 'undefined';
  } catch {
    return false;
  }
};

// Initialize Sentry
export const initSentry = () => {
  // Check if running in browser
  if (!isSentryAvailable()) {
    if (isDev()) {
      console.info('ℹ️ Sentry not available in this environment.');
    }
    return;
  }

  // Get DSN from environment variable or use placeholder
  const sentryDSN = getEnv('VITE_SENTRY_DSN', '');
  
  // Only initialize if DSN is provided and not placeholder
  if (!sentryDSN) {
    // Only show warning in development mode
    if (isDev()) {
      console.info('ℹ️ Sentry not configured. To enable error tracking, add VITE_SENTRY_DSN to your .env file.');
    }
    return;
  }

  // Import Sentry dynamically to avoid errors if package not installed
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDSN,
      
      // Environment
      environment: getMode(),
      
      // Release tracking (use git commit hash in production)
      release: `cps-punisher@${getEnv('VITE_APP_VERSION', '1.0.0')}`,
      
      // Performance Monitoring
      integrations: [
        // Browser tracing for performance
        Sentry.browserTracingIntegration(),
        
        // Replay sessions for debugging
        Sentry.replayIntegration({
          maskAllText: true, // Privacy: mask all text
          blockAllMedia: true, // Privacy: block all media
        }),
      ],

    // Performance monitoring sample rate (10% of transactions)
    tracesSampleRate: 0.1,
    
    // Session replay sample rate
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive personal information
      if (event.request) {
        delete event.request.cookies;
        
        // Scrub sensitive query params
        if (event.request.url) {
          event.request.url = event.request.url.replace(/([?&])(email|password|token|key)=[^&]*/gi, '$1$2=REDACTED');
        }
      }
      
      // Scrub user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
    
      // Don't send events in development
      enabled: getMode() === 'production',
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Network errors that users can't fix
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      
      // Third-party script errors
      'Script error',
      
      // Common user errors
      'ResizeObserver loop',
      'Non-Error promise rejection',
    ],
    
    // Allowlist for error domains (only track errors from our domain)
    allowUrls: [
      /https?:\/\/(www\.)?cps-punisher\.com/,
      /https?:\/\/(.*\.)?vercel\.app/,
      /localhost/,
    ],
    });

    console.log('✅ Sentry error tracking initialized');
  }).catch((error) => {
    console.warn('⚠️ Failed to initialize Sentry:', error.message);
    console.info('💡 Install @sentry/react package: npm install @sentry/react');
  });
};

// Capture custom exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
  import('@sentry/react').then((Sentry) => {
    Sentry.captureException(error, {
      extra: context,
    });
  }).catch(() => {
    console.error('Sentry not available:', error);
  });
};

// Capture custom messages
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' | 'fatal' | 'debug' = 'info', context?: Record<string, any>) => {
  import('@sentry/react').then((Sentry) => {
    Sentry.captureMessage(message, {
      level: level as any,
      extra: context,
    });
  }).catch(() => {
    console.warn('Sentry not available:', message);
  });
};

// Set user context (without PII)
export const setSentryUser = (userId: string, subscriptionTier?: string) => {
  import('@sentry/react').then((Sentry) => {
    Sentry.setUser({
      id: userId,
      subscription_tier: subscriptionTier,
      // Note: Do NOT include email, name, or other PII
    });
  }).catch(() => {
    // Silent fail
  });
};

// Clear user context (on logout)
export const clearSentryUser = () => {
  import('@sentry/react').then((Sentry) => {
    Sentry.setUser(null);
  }).catch(() => {
    // Silent fail
  });
};

// Add breadcrumb (trail of events leading to error)
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  import('@sentry/react').then((Sentry) => {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }).catch(() => {
    // Silent fail
  });
};

// CPS Punisher specific error tracking
export const sentryCPS = {
  // Document errors
  documentUploadFailed: (error: Error, fileName: string, fileType: string) => {
    addBreadcrumb('Document upload attempted', 'document', { fileName, fileType });
    captureException(error, {
      feature: 'document_upload',
      file_name: fileName,
      file_type: fileType,
    });
  },

  documentAnalysisFailed: (error: Error, documentId: string) => {
    addBreadcrumb('Document analysis attempted', 'analysis', { documentId });
    captureException(error, {
      feature: 'document_analysis',
      document_id: documentId,
    });
  },

  // AI errors
  aiRequestFailed: (error: Error, tier: string, requestType: string) => {
    addBreadcrumb('AI request attempted', 'ai', { tier, requestType });
    captureException(error, {
      feature: 'ai_analysis',
      subscription_tier: tier,
      request_type: requestType,
    });
  },

  // Case law errors
  caseLawSearchFailed: (error: Error, query: string) => {
    addBreadcrumb('Case law search attempted', 'caselaw', { query });
    captureException(error, {
      feature: 'case_law_search',
      search_query: query,
    });
  },

  // Payment errors
  paymentFailed: (error: Error, tier: string, amount: number) => {
    addBreadcrumb('Payment attempted', 'payment', { tier, amount });
    captureException(error, {
      feature: 'subscription_payment',
      subscription_tier: tier,
      amount: amount,
    });
  },

  // Authentication errors
  authFailed: (error: Error, method: string) => {
    addBreadcrumb('Authentication attempted', 'auth', { method });
    captureException(error, {
      feature: 'authentication',
      auth_method: method,
    });
  },

  // File storage errors
  fileStorageFailed: (error: Error, operation: string, fileId?: string) => {
    addBreadcrumb('File storage operation attempted', 'storage', { operation, fileId });
    captureException(error, {
      feature: 'file_storage',
      operation: operation,
      file_id: fileId,
    });
  },

  // Critical application errors
  criticalError: (error: Error, component: string, action: string) => {
    addBreadcrumb('Critical error occurred', 'critical', { component, action });
    captureMessage(`Critical error in ${component} during ${action}`, 'fatal', {
      component,
      action,
      error_message: error.message,
      error_stack: error.stack,
    });
    captureException(error);
  },
};

// Performance tracking
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  import('@sentry/react').then((Sentry) => {
    if (Sentry.metrics && Sentry.metrics.gauge) {
      Sentry.metrics.gauge(metric, value, {
        unit,
        tags: {
          subscription_tier: 'track-from-context',
        },
      });
    }
  }).catch(() => {
    // Silent fail
  });
};
