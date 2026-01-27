// Google Analytics 4 (GA4) Utilities
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined') return;
  
  // Add GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('✅ Google Analytics initialized:', measurementId);
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, eventParams);
};

// Track CPS Punisher specific events
export const trackCPSEvent = {
  // Document events
  documentUploaded: (docType: string, fileType: string) => {
    trackEvent('document_uploaded', {
      category: 'Document',
      doc_type: docType,
      file_type: fileType,
    });
  },

  documentAnalyzed: (violationsFound: number) => {
    trackEvent('document_analyzed', {
      category: 'Document',
      violations_found: violationsFound,
    });
  },

  // Violation events
  violationChecked: (violationType: string) => {
    trackEvent('violation_checked', {
      category: 'Violation',
      violation_type: violationType,
    });
  },

  // Defense strategy events
  strategyGenerated: (violationCount: number) => {
    trackEvent('strategy_generated', {
      category: 'Defense',
      violation_count: violationCount,
    });
  },

  strategyExported: (format: string) => {
    trackEvent('strategy_exported', {
      category: 'Defense',
      export_format: format,
    });
  },

  // Timeline events
  timelineEventAdded: () => {
    trackEvent('timeline_event_added', {
      category: 'Timeline',
    });
  },

  // Document generator events
  documentGenerated: (docType: string) => {
    trackEvent('document_generated', {
      category: 'Generator',
      document_type: docType,
    });
  },

  // Rights guide events
  rightsGuideViewed: (section: string) => {
    trackEvent('rights_guide_viewed', {
      category: 'Rights',
      section: section,
    });
  },

  // Case law events
  caseLawSearched: (query: string) => {
    trackEvent('case_law_searched', {
      category: 'CaseLaw',
      search_query: query,
    });
  },

  caseLawViewed: (caseName: string) => {
    trackEvent('case_law_viewed', {
      category: 'CaseLaw',
      case_name: caseName,
    });
  },

  // Subscription events
  subscriptionViewed: (tier: string) => {
    trackEvent('subscription_viewed', {
      category: 'Subscription',
      tier: tier,
    });
  },

  subscriptionUpgraded: (fromTier: string, toTier: string, price: number) => {
    trackEvent('subscription_upgraded', {
      category: 'Subscription',
      from_tier: fromTier,
      to_tier: toTier,
      value: price,
    });
  },

  // Auth events
  userSignedUp: (method: string) => {
    trackEvent('sign_up', {
      category: 'Auth',
      method: method,
    });
  },

  userSignedIn: (method: string) => {
    trackEvent('sign_in', {
      category: 'Auth',
      method: method,
    });
  },

  // Virtual Case Binder events
  fileUploadedToBinder: (fileType: string, category: string) => {
    trackEvent('file_uploaded_to_binder', {
      category: 'CaseBinder',
      file_type: fileType,
      file_category: category,
    });
  },

  audioRecorded: () => {
    trackEvent('audio_recorded', {
      category: 'CaseBinder',
    });
  },

  // AI Analysis events
  aiAnalysisRun: (tier: string, tokensUsed?: number) => {
    trackEvent('ai_analysis_run', {
      category: 'AI',
      subscription_tier: tier,
      tokens_used: tokensUsed,
    });
  },

  // Error tracking (non-Sentry)
  featureError: (feature: string, errorType: string) => {
    trackEvent('feature_error', {
      category: 'Error',
      feature: feature,
      error_type: errorType,
    });
  },

  // Engagement events
  tabSwitched: (tabName: string) => {
    trackEvent('tab_switched', {
      category: 'Engagement',
      tab_name: tabName,
    });
  },

  helpModalOpened: (topic: string) => {
    trackEvent('help_modal_opened', {
      category: 'Engagement',
      help_topic: topic,
    });
  },

  // Generic user action tracking
  userAction: (action: string, label?: string, value?: number) => {
    trackEvent('user_action', {
      category: 'Engagement',
      action: action,
      label: label,
      value: value,
    });
  },
};

// Track user properties (for user segmentation)
export const setUserProperties = (properties: {
  subscriptionTier?: string;
  caseStage?: string;
  violationsCount?: number;
  [key: string]: any;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('set', 'user_properties', properties);
};

// Enable/disable tracking (for privacy)
export const setTrackingConsent = (granted: boolean) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  });
};
