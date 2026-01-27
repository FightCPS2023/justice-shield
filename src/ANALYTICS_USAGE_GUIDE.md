# Analytics Usage Guide for Developers

Quick reference for tracking events and errors in The CPS Punisher.

---

## 📊 Tracking Events (Google Analytics)

### Import
```typescript
import { trackCPSEvent } from '../utils/analytics';
```

### Common Events

#### Document Management
```typescript
// User uploads a document
trackCPSEvent.documentUploaded('CPS Report', 'pdf');

// AI analyzes a document
trackCPSEvent.documentAnalyzed(5); // 5 violations found

// File uploaded to Virtual Case Binder
trackCPSEvent.fileUploadedToBinder('photo', 'Evidence');

// Audio recording created
trackCPSEvent.audioRecorded();
```

#### Violations & Defense
```typescript
// User checks a violation
trackCPSEvent.violationChecked('Fourth Amendment');

// Defense strategy generated
trackCPSEvent.strategyGenerated(3); // 3 violations

// Strategy exported
trackCPSEvent.strategyExported('pdf');
```

#### Timeline
```typescript
// Timeline event added
trackCPSEvent.timelineEventAdded();
```

#### Case Law Research
```typescript
// User searches case law
trackCPSEvent.caseLawSearched('fourth amendment child welfare');

// User views a case
trackCPSEvent.caseLawViewed('Doe v. Heck');

// User views rights guide section
trackCPSEvent.rightsGuideViewed('Fourth Amendment Rights');
```

#### Subscriptions
```typescript
// User views pricing
trackCPSEvent.subscriptionViewed('Professional');

// User upgrades
trackCPSEvent.subscriptionUpgraded('Free', 'Professional', 79);
```

#### Authentication
```typescript
// User signs up
trackCPSEvent.userSignedUp('email');

// User signs in
trackCPSEvent.userSignedIn('email');
```

#### AI Usage
```typescript
// AI analysis run
trackCPSEvent.aiAnalysisRun('professional', 1500); // tier, tokens used
```

#### Engagement
```typescript
// Tab switched
trackCPSEvent.tabSwitched('violations');

// Help modal opened
trackCPSEvent.helpModalOpened('How to check violations');
```

---

## 🐛 Tracking Errors (Sentry)

### Import
```typescript
import { sentryCPS, captureException } from '../utils/sentry';
```

### Specific Error Handlers

#### Document Errors
```typescript
try {
  await uploadDocument(file);
} catch (error) {
  sentryCPS.documentUploadFailed(error, file.name, file.type);
}

try {
  const analysis = await analyzeDocument(content);
} catch (error) {
  sentryCPS.documentAnalysisFailed(error, documentId);
}
```

#### AI Errors
```typescript
try {
  const response = await openai.analyze(prompt);
} catch (error) {
  sentryCPS.aiRequestFailed(error, userTier, 'document_analysis');
}
```

#### Case Law Errors
```typescript
try {
  const results = await searchCaseLaw(query);
} catch (error) {
  sentryCPS.caseLawSearchFailed(error, query);
}
```

#### Payment Errors
```typescript
try {
  await stripe.createSubscription(tier);
} catch (error) {
  sentryCPS.paymentFailed(error, tier, amount);
}
```

#### Authentication Errors
```typescript
try {
  await signIn(email, password);
} catch (error) {
  sentryCPS.authFailed(error, 'email');
}
```

#### File Storage Errors
```typescript
try {
  await saveFile(data);
} catch (error) {
  sentryCPS.fileStorageFailed(error, 'save', fileId);
}
```

#### Critical Errors
```typescript
try {
  // Critical operation
} catch (error) {
  sentryCPS.criticalError(error, 'DefenseStrategy', 'generateStrategy');
}
```

### Generic Error Capture
```typescript
import { captureException } from '../utils/sentry';

try {
  // Some operation
} catch (error) {
  captureException(error, {
    feature: 'custom_feature',
    userId: user.id,
    additionalContext: 'any relevant data'
  });
}
```

---

## 🍞 Breadcrumbs (Event Trail)

Add breadcrumbs to track user actions leading to an error:

```typescript
import { addBreadcrumb } from '../utils/sentry';

// User action
addBreadcrumb('User clicked generate strategy', 'user_action', {
  violationCount: 5,
  subscriptionTier: 'professional'
});

// Navigation
addBreadcrumb('Navigated to violations tab', 'navigation');

// Data change
addBreadcrumb('Document uploaded', 'data', {
  documentType: 'CPS Report',
  fileSize: '245KB'
});
```

When an error occurs, Sentry shows all breadcrumbs leading up to it.

---

## 👤 User Context

Set user context for better error tracking:

```typescript
import { setSentryUser, clearSentryUser } from '../utils/sentry';

// On login
setSentryUser(userId, subscriptionTier);

// On logout
clearSentryUser();
```

**Note:** Never include PII (email, name, etc.) in user context.

---

## 📈 Performance Tracking

Track custom performance metrics:

```typescript
import { trackPerformance } from '../utils/sentry';

const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;

trackPerformance('document_analysis_time', duration);
```

---

## 🎯 Example: Complete Feature

```typescript
import { trackCPSEvent } from '../utils/analytics';
import { sentryCPS, addBreadcrumb } from '../utils/sentry';

export const uploadAndAnalyzeDocument = async (file: File) => {
  // Track that user started upload
  addBreadcrumb('Document upload started', 'user_action', {
    fileName: file.name,
    fileType: file.type
  });

  try {
    // Upload document
    const uploaded = await uploadDocument(file);
    
    // Track successful upload
    trackCPSEvent.documentUploaded(uploaded.type, uploaded.fileType);
    
    // Analyze document
    addBreadcrumb('Starting AI analysis', 'process');
    const analysis = await analyzeDocument(uploaded.content);
    
    // Track analysis
    trackCPSEvent.documentAnalyzed(analysis.violationsFound);
    
    return analysis;
    
  } catch (error) {
    // Track error
    if (error instanceof UploadError) {
      sentryCPS.documentUploadFailed(error, file.name, file.type);
    } else if (error instanceof AnalysisError) {
      sentryCPS.documentAnalysisFailed(error, uploaded.id);
    } else {
      // Generic error
      captureException(error, {
        feature: 'document_upload_and_analyze',
        fileName: file.name
      });
    }
    
    // Track failed event
    trackCPSEvent.featureError('document_upload', error.message);
    
    throw error;
  }
};
```

---

## 🔒 Privacy Guidelines

### DO Track ✅
- Feature usage (buttons clicked, tabs opened)
- Document types (CPS Report, Court Order)
- Violation types selected
- Subscription tier
- Error types and frequencies
- Performance metrics
- User flow (navigation paths)

### DON'T Track ❌
- Case numbers
- Names (child, parent, caseworker)
- Addresses
- Phone numbers
- Email addresses
- Document content
- Personal details
- Medical information
- Court case details

### Example: Good vs. Bad

**❌ BAD:**
```typescript
trackEvent('document_uploaded', {
  case_number: '2024-CPS-12345',
  child_name: 'John Doe',
  parent_email: 'parent@email.com'
});
```

**✅ GOOD:**
```typescript
trackCPSEvent.documentUploaded('CPS Report', 'pdf');
// Only tracks document type and file format
```

---

## 🧪 Testing

### Test in Development

```typescript
// Check console for tracking confirmation
trackCPSEvent.documentUploaded('test', 'pdf');
// Should see: Event tracked in console

// Trigger test error
throw new Error('Test error for Sentry');
// Should appear in Sentry dashboard
```

### Verify Tracking

**Google Analytics:**
1. Open GA4 dashboard
2. Go to Realtime → Events
3. Trigger an action in your app
4. Event should appear within 30 seconds

**Sentry:**
1. Throw a test error
2. Check Sentry Issues tab
3. Error should appear immediately

---

## 📝 Naming Conventions

### Event Names
- Use snake_case: `document_uploaded`, `case_law_searched`
- Be specific: `subscription_upgraded` not `upgrade`
- Use past tense: `document_analyzed` not `analyze_document`

### Categories
- `Document` - Document management
- `Violation` - Violation checking
- `Defense` - Defense strategies
- `Timeline` - Timeline events
- `CaseLaw` - Legal research
- `Subscription` - Payment/upgrades
- `Auth` - Authentication
- `CaseBinder` - Virtual Case Binder
- `AI` - AI features
- `Engagement` - User interaction

### Error Context
Always include:
- `feature` - Which feature had the error
- `error_type` - Type of error (network, validation, etc.)
- `subscription_tier` - User's tier (helps prioritize fixes)

---

## 🚀 Best Practices

### 1. Track User Journey
```typescript
// User starts a flow
addBreadcrumb('Started violation checking', 'user_flow');
trackCPSEvent.tabSwitched('violations');

// User completes action
trackCPSEvent.violationChecked('Fourth Amendment');

// User views results
trackCPSEvent.strategyGenerated(3);
```

### 2. Error Context
```typescript
try {
  await operation();
} catch (error) {
  captureException(error, {
    feature: 'specific_feature',
    operation: 'specific_operation',
    userTier: tier,
    attemptNumber: retryCount,
    // Any relevant context
  });
}
```

### 3. Performance Monitoring
```typescript
const timer = Date.now();
await expensiveOperation();
trackPerformance('operation_name', Date.now() - timer);
```

### 4. Don't Over-Track
Track meaningful events, not every button click:
- ✅ Track: Document uploaded, Strategy generated
- ❌ Don't track: Every keystroke, Mouse movements

---

## 📚 Reference

### Full Event List
See `/utils/analytics.ts` for all available `trackCPSEvent.*` methods.

### Full Error List
See `/utils/sentry.ts` for all available `sentryCPS.*` methods.

### Configuration
See `/ANALYTICS_AND_MONITORING_SETUP.md` for setup instructions.

---

## 💡 Tips

1. **Always wrap async operations** in try-catch for error tracking
2. **Add breadcrumbs** before major operations
3. **Track both success and failure** paths
4. **Use consistent naming** for events
5. **Test tracking** before deploying
6. **Review analytics weekly** to improve UX
7. **Fix high-frequency errors** first

---

**Last Updated:** November 28, 2025  
**Version:** 1.0
