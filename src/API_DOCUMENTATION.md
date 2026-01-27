# CPS Case Defense Analyzer - API Documentation

**Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [SDK & Client Libraries](#sdk--client-libraries)
9. [Code Examples](#code-examples)

---

## 🎯 Overview

The CPS Case Defense Analyzer uses a combination of Supabase backend services and custom Edge Functions to provide a robust API for data management, authentication, and AI processing.

### **Base URLs**

```
Development:  http://localhost:3000
Production:   https://api.cpsdefenseanalyzer.com
Supabase:     https://rewgkrgmcmikivxjnfdq.supabase.co
```

### **API Architecture**

```
Client Application (React)
        ↓
API Client (utils/api.ts)
        ↓
Supabase Edge Functions
        ↓
PostgreSQL Database
```

### **Technology Stack**

- **Backend:** Supabase (PostgreSQL, Storage, Auth)
- **Edge Functions:** Deno runtime
- **Authentication:** Supabase Auth (JWT tokens)
- **Storage:** Supabase Storage (S3-compatible)
- **Real-time:** Supabase Realtime (WebSockets)

---

## 🔐 Authentication

### **Authentication Methods**

1. **Email/Password** (Primary)
2. **Magic Link** (Planned)
3. **OAuth** (Google, GitHub - Planned)

### **Getting Access Tokens**

**Sign Up:**
```typescript
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "data": {
    "full_name": "John Doe",
    "user_type": "parent" | "attorney"
  }
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "user_type": "parent"
    }
  }
}
```

**Sign In:**
```typescript
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

**Refresh Token:**
```typescript
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

### **Using Access Tokens**

Include the access token in all API requests:

```typescript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Token Expiration**

- Access tokens expire after **1 hour**
- Refresh tokens expire after **7 days**
- Use refresh token to obtain new access token

---

## 📡 API Endpoints

### **User Data Management**

#### **Save User Data**

```typescript
POST /functions/v1/server/save-data
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "documents": [
    {
      "id": "doc_123",
      "title": "Removal Order",
      "content": "Document content...",
      "date": "2024-11-15",
      "type": "removal_order"
    }
  ],
  "timelineEvents": [
    {
      "id": "event_123",
      "date": "2024-11-01",
      "title": "CPS Initial Contact",
      "description": "First contact with caseworker"
    }
  ],
  "caseDetails": {
    "caseNumber": "2024-CPS-12345",
    "county": "Los Angeles County",
    "dateOpened": "2024-11-01",
    "caseworker": "Jane Smith",
    "attorney": "John Doe, Esq."
  },
  "violations": {
    "fourthAmendment": true,
    "noReasonableEfforts": true,
    // ... other violations
  }
}

Response:
{
  "success": true,
  "message": "Data saved successfully",
  "savedAt": "2024-11-24T10:30:00Z"
}

Error Response:
{
  "success": false,
  "error": "Invalid data format",
  "details": "Missing required field: documents"
}
```

#### **Load User Data**

```typescript
GET /functions/v1/server/load-data
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "documents": [...],
    "timelineEvents": [...],
    "caseDetails": {...},
    "violations": {...},
    "lastSaved": "2024-11-24T10:30:00Z"
  }
}

Error Response:
{
  "success": false,
  "error": "No data found for user"
}
```

#### **Delete User Data**

```typescript
DELETE /functions/v1/server/delete-data
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "All user data deleted successfully"
}
```

---

### **Document Management**

#### **Upload Document**

```typescript
POST /storage/v1/object/documents/{userId}/{documentId}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- file: [Binary file data]
- metadata: {
    "title": "Removal Order",
    "type": "removal_order",
    "uploadedAt": "2024-11-24T10:30:00Z"
  }

Response:
{
  "Key": "documents/user_123/doc_456.pdf",
  "Id": "uuid",
  "path": "user_123/doc_456.pdf"
}
```

#### **Download Document**

```typescript
GET /storage/v1/object/public/documents/{userId}/{documentId}
Authorization: Bearer {access_token}

Response:
[Binary file data]
```

#### **Delete Document**

```typescript
DELETE /storage/v1/object/documents/{userId}/{documentId}
Authorization: Bearer {access_token}

Response:
{
  "message": "Document deleted successfully"
}
```

#### **List User Documents**

```typescript
GET /storage/v1/object/list/documents/{userId}
Authorization: Bearer {access_token}

Response:
[
  {
    "name": "doc_123.pdf",
    "id": "uuid",
    "updated_at": "2024-11-24T10:30:00Z",
    "created_at": "2024-11-20T08:00:00Z",
    "last_accessed_at": "2024-11-24T10:30:00Z",
    "metadata": {
      "size": 102400,
      "mimetype": "application/pdf"
    }
  }
]
```

---

### **AI Analysis**

#### **Analyze Document**

```typescript
POST /functions/v1/server/analyze-document
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "documentId": "doc_123",
  "documentType": "removal_order",
  "documentContent": "Full text content of document...",
  "userTier": "free" | "premium" | "attorney",
  "caseContext": {
    "caseNumber": "2024-CPS-12345",
    "state": "California"
  }
}

Response:
{
  "success": true,
  "analysis": {
    "summary": "This removal order contains several potential violations...",
    "violationsDetected": [
      "fourthAmendment",
      "noReasonableEfforts"
    ],
    "timelineEvents": [
      {
        "date": "2024-11-01",
        "title": "Removal Date",
        "description": "Children removed from home"
      }
    ],
    "caseInfo": {
      "caseNumber": "2024-CPS-12345",
      "dates": ["2024-11-01", "2024-11-05"],
      "names": ["Jane Smith", "Officer Johnson"]
    },
    "recommendations": [
      "Consult with attorney about Fourth Amendment violation",
      "File motion to suppress evidence obtained from illegal entry"
    ],
    "fullAnalysis": "Detailed AI-generated analysis text...",
    "tier": "attorney",
    "analysisDepth": "professional"
  },
  "creditsUsed": 10,
  "remainingCredits": 990
}
```

#### **Generate Strategy**

```typescript
POST /functions/v1/server/generate-strategy
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "caseDetails": {...},
  "violations": {...},
  "goal": "reunification",
  "userTier": "premium"
}

Response:
{
  "success": true,
  "strategy": {
    "immediateActions": [...],
    "shortTermStrategy": [...],
    "longTermStrategy": [...],
    "evidence": [...],
    "legalBasis": [...]
  }
}
```

#### **Check AI Credits**

```typescript
GET /functions/v1/server/ai-credits
Authorization: Bearer {access_token}

Response:
{
  "tier": "attorney",
  "monthlyAllowance": 1000,
  "used": 235,
  "remaining": 765,
  "resetDate": "2024-12-01T00:00:00Z"
}
```

---

### **Subscription Management**

#### **Get Subscription Status**

```typescript
GET /functions/v1/server/subscription
Authorization: Bearer {access_token}

Response:
{
  "tier": "premium",
  "status": "active",
  "currentPeriodStart": "2024-11-01T00:00:00Z",
  "currentPeriodEnd": "2024-12-01T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "stripeCustomerId": "cus_xxxxx",
  "stripeSubscriptionId": "sub_xxxxx"
}
```

#### **Create Checkout Session**

```typescript
POST /functions/v1/server/create-checkout
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "tier": "premium" | "attorney",
  "successUrl": "https://app.example.com/success",
  "cancelUrl": "https://app.example.com/cancel"
}

Response:
{
  "sessionId": "cs_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_xxxxx"
}
```

#### **Cancel Subscription**

```typescript
POST /functions/v1/server/cancel-subscription
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Subscription will be canceled at period end",
  "cancelAt": "2024-12-01T00:00:00Z"
}
```

#### **Update Subscription**

```typescript
POST /functions/v1/server/update-subscription
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "newTier": "attorney"
}

Response:
{
  "success": true,
  "message": "Subscription updated successfully",
  "newTier": "attorney",
  "effectiveDate": "2024-11-24T10:30:00Z"
}
```

---

### **Community Forum (Premium)**

#### **Get Forum Posts**

```typescript
GET /functions/v1/server/forum/posts?category={category}&limit={limit}&offset={offset}
Authorization: Bearer {access_token}

Query Parameters:
- category (optional): "success-stories" | "legal-tips" | "general" | "q-and-a"
- limit (optional): Number of posts (default: 20, max: 100)
- offset (optional): Pagination offset (default: 0)

Response:
{
  "posts": [
    {
      "id": "post_123",
      "userId": "user_456",
      "username": "Anonymous User", // or actual name
      "isAnonymous": true,
      "category": "success-stories",
      "title": "Won my case!",
      "content": "After 6 months of fighting...",
      "createdAt": "2024-11-20T10:00:00Z",
      "updatedAt": "2024-11-20T10:00:00Z",
      "replyCount": 5,
      "likeCount": 12
    }
  ],
  "total": 150,
  "hasMore": true
}
```

#### **Create Forum Post**

```typescript
POST /functions/v1/server/forum/posts
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "category": "legal-tips",
  "title": "Important tip about Fourth Amendment",
  "content": "Here's what I learned...",
  "isAnonymous": true
}

Response:
{
  "success": true,
  "post": {
    "id": "post_789",
    "createdAt": "2024-11-24T10:30:00Z"
  }
}
```

#### **Reply to Post**

```typescript
POST /functions/v1/server/forum/posts/{postId}/replies
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "content": "Thank you for sharing...",
  "isAnonymous": false
}

Response:
{
  "success": true,
  "reply": {
    "id": "reply_123",
    "createdAt": "2024-11-24T10:30:00Z"
  }
}
```

---

### **Attorney Suite Features**

#### **Multi-Client Management**

```typescript
GET /functions/v1/server/attorney/clients
Authorization: Bearer {access_token}

Response:
{
  "clients": [
    {
      "id": "client_123",
      "name": "Client A",
      "caseNumber": "2024-CPS-001",
      "status": "active",
      "lastActivity": "2024-11-24T09:00:00Z",
      "violationCount": 5,
      "documentCount": 12
    }
  ],
  "total": 25
}
```

#### **Switch Active Client**

```typescript
POST /functions/v1/server/attorney/switch-client
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "clientId": "client_456"
}

Response:
{
  "success": true,
  "activeClient": {
    "id": "client_456",
    "name": "Client B",
    "caseNumber": "2024-CPS-002"
  }
}
```

#### **Generate Legal Document (AI Paralegal)**

```typescript
POST /functions/v1/server/attorney/generate-document
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "documentType": "motion-to-suppress" | "motion-to-dismiss" | "complaint-1983",
  "caseDetails": {...},
  "violations": {...},
  "jurisdiction": "California",
  "courtName": "Superior Court of Los Angeles County"
}

Response:
{
  "success": true,
  "document": {
    "title": "Motion to Suppress Evidence",
    "content": "Full formatted legal document...",
    "citations": [...],
    "generatedAt": "2024-11-24T10:30:00Z"
  },
  "creditsUsed": 50
}
```

---

## 📊 Data Models

### **User Model**

```typescript
interface User {
  id: string;                    // UUID
  email: string;
  created_at: string;            // ISO 8601
  user_metadata: {
    full_name: string;
    user_type: 'parent' | 'attorney';
    phone?: string;
    state?: string;
  };
  subscription: {
    tier: 'free' | 'premium' | 'attorney';
    status: 'active' | 'canceled' | 'past_due';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}
```

### **Document Model**

```typescript
interface Document {
  id: string;                    // Unique identifier
  title: string;                 // Document name
  content: string;               // Full text content
  date: string;                  // ISO 8601 date
  type: DocumentType;            // See DocumentType enum
  fileUrl?: string;              // URL to stored file
  metadata?: {
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  };
}

enum DocumentType {
  'removal_order' = 'Removal Order',
  'investigation_report' = 'Investigation Report',
  'court_order' = 'Court Order',
  'service_plan' = 'Service Plan',
  'medical_records' = 'Medical Records',
  'police_report' = 'Police Report',
  'school_records' = 'School Records',
  'visitation_log' = 'Visitation Log',
  'case_notes' = 'Case Notes',
  'other' = 'Other'
}
```

### **Timeline Event Model**

```typescript
interface TimelineEvent {
  id: string;
  date: string;                  // ISO 8601
  title: string;
  description: string;
  category?: 'contact' | 'hearing' | 'visit' | 'service' | 'other';
  importance?: 'low' | 'medium' | 'high' | 'critical';
}
```

### **Case Details Model**

```typescript
interface CaseDetails {
  caseNumber: string;
  county: string;
  dateOpened: string;            // ISO 8601
  caseworker: string;
  attorney?: string;
  state?: string;
  children?: {
    count: number;
    ages?: number[];
  };
  status?: 'open' | 'closed' | 'in-progress';
}
```

### **Violations Model**

```typescript
interface Violations {
  // Constitutional (4)
  fourthAmendment: boolean;
  fourteenthAmendment: boolean;
  firstAmendment: boolean;
  fifthAmendment: boolean;
  
  // Procedural (6)
  noMirandaRights: boolean;
  noWrittenNotice: boolean;
  improperInvestigation: boolean;
  missedDeadlines: boolean;
  noSafetyPlan: boolean;
  noReasonableEfforts: boolean;
  
  // Evidence (5)
  falsifiedReports: boolean;
  hearsayEvidence: boolean;
  noPhysicalEvidence: boolean;
  biasedInvestigation: boolean;
  cherryPickedEvidence: boolean;
  
  // Rights (4)
  deniedLegalCounsel: boolean;
  forcedToSign: boolean;
  deniedVisitation: boolean;
  noInterpreter: boolean;
  
  // Services (5)
  noServicesOffered: boolean;
  inappropriatePlacement: boolean;
  separatedSiblings: boolean;
  noRelativePlacement: boolean;
  inadequateCasePlan: boolean;
}
```

### **AI Analysis Response Model**

```typescript
interface AIAnalysisResponse {
  success: boolean;
  analysis: {
    summary: string;
    violationsDetected: string[];
    timelineEvents: TimelineEvent[];
    caseInfo: {
      caseNumber?: string;
      dates?: string[];
      names?: string[];
      locations?: string[];
    };
    recommendations: string[];
    fullAnalysis: string;
    tier: 'free' | 'premium' | 'attorney';
    analysisDepth: 'basic' | 'detailed' | 'professional';
  };
  creditsUsed: number;
  remainingCredits: number;
}
```

---

## ⚠️ Error Handling

### **Error Response Format**

All errors follow this format:

```typescript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details",
  "timestamp": "2024-11-24T10:30:00Z"
}
```

### **HTTP Status Codes**

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

### **Common Error Codes**

```typescript
ERROR_CODES = {
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_DATA: 'Invalid request data',
  NOT_FOUND: 'Resource not found',
  RATE_LIMIT: 'Rate limit exceeded',
  INSUFFICIENT_CREDITS: 'Insufficient AI credits',
  TIER_REQUIRED: 'Premium/Attorney tier required',
  STORAGE_LIMIT: 'Storage limit exceeded',
  SERVER_ERROR: 'Internal server error'
}
```

### **Error Handling Examples**

```typescript
try {
  const response = await api.saveData(accessToken, data);
  if (!response.success) {
    throw new Error(response.error);
  }
} catch (error) {
  if (error.code === 'INVALID_TOKEN') {
    // Refresh token or redirect to login
  } else if (error.code === 'RATE_LIMIT') {
    // Show rate limit message
  } else {
    // Generic error handling
  }
}
```

---

## 🚦 Rate Limiting

### **Rate Limits by Tier**

| Tier | API Calls/Hour | AI Requests/Day | Document Uploads/Day |
|------|----------------|-----------------|----------------------|
| Free | 100 | 10 | 3 |
| Premium | 1,000 | 100 | Unlimited |
| Attorney | 10,000 | 1,000 | Unlimited |

### **Rate Limit Headers**

Response headers include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1700838000
```

### **Rate Limit Exceeded Response**

```typescript
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retryAfter": 3600,  // Seconds until reset
  "limit": 100,
  "resetAt": "2024-11-24T11:00:00Z"
}
```

---

## 🔔 Webhooks

### **Stripe Webhooks**

Listen for subscription events:

```typescript
POST /functions/v1/server/webhooks/stripe
Headers:
  stripe-signature: {signature}

Event Types:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

Example Payload:
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "customer": "cus_xxxxx",
      "status": "active",
      "current_period_end": 1733097600
    }
  }
}
```

### **Webhook Security**

Verify webhook signatures:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 📚 SDK & Client Libraries

### **JavaScript/TypeScript Client**

Located at `utils/api.ts`:

```typescript
import { api } from './utils/api';

// Save data
await api.saveData(accessToken, {
  documents,
  timelineEvents,
  caseDetails,
  violations
});

// Load data
const response = await api.loadData(accessToken);

// Upload document
await api.uploadDocument(accessToken, file, metadata);
```

### **API Client Implementation**

```typescript
// utils/api.ts
export const api = {
  async saveData(accessToken: string, data: any) {
    const response = await fetch(`${API_URL}/save-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data');
    }
    
    return await response.json();
  },
  
  async loadData(accessToken: string) {
    const response = await fetch(`${API_URL}/load-data`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    
    return await response.json();
  },
};
```

---

## 💡 Code Examples

### **Complete Authentication Flow**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign up
async function signUp(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (error) throw error;
  return data;
}

// Sign in
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

// Get session
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### **Complete Data Save Flow**

```typescript
import { api } from './utils/api';

async function saveUserData(accessToken: string) {
  try {
    // Prepare data
    const data = {
      documents: documents,
      timelineEvents: timelineEvents,
      caseDetails: caseDetails,
      violations: violations,
    };
    
    // Save to cloud
    const response = await api.saveData(accessToken, data);
    
    if (response.success) {
      console.log('Data saved successfully');
      toast.success('Data synced to cloud');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Error saving data:', error);
    toast.error('Failed to sync data');
    // Fall back to local storage
    localStorage.setItem('cpsDefenseData', JSON.stringify(data));
  }
}
```

### **Document Upload with Progress**

```typescript
async function uploadDocument(file: File, metadata: any) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return await response.json();
}
```

### **AI Analysis Request**

```typescript
async function analyzeDocument(
  documentId: string,
  content: string,
  tier: string
) {
  const response = await fetch(`${API_URL}/analyze-document`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      documentId,
      documentContent: content,
      userTier: tier,
      caseContext: caseDetails,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Analysis failed');
  }
  
  const result = await response.json();
  
  // Update UI with results
  if (result.success) {
    setAnalysis(result.analysis);
    setViolations(result.analysis.violationsDetected);
    setTimelineEvents(result.analysis.timelineEvents);
  }
  
  return result;
}
```

---

## 🔒 Security Best Practices

### **1. Token Storage**

```typescript
// ✅ DO: Store tokens securely
localStorage.setItem('access_token', token);

// ❌ DON'T: Expose tokens in URLs
const url = `/api/data?token=${token}`; // Bad!
```

### **2. API Request Security**

```typescript
// ✅ DO: Always use HTTPS
const API_URL = 'https://api.example.com';

// ✅ DO: Validate responses
if (response.success && response.data) {
  // Process data
}

// ✅ DO: Handle errors gracefully
try {
  await api.call();
} catch (error) {
  console.error('API error:', error);
  showUserError('Something went wrong');
}
```

### **3. Data Validation**

```typescript
// ✅ DO: Validate before sending
function validateCaseDetails(details: CaseDetails): boolean {
  return (
    details.caseNumber &&
    details.county &&
    details.dateOpened &&
    isValidDate(details.dateOpened)
  );
}
```

---

## 📊 API Performance

### **Response Times**

| Endpoint | Average | P95 | P99 |
|----------|---------|-----|-----|
| /load-data | 150ms | 300ms | 500ms |
| /save-data | 200ms | 400ms | 600ms |
| /analyze-document | 2s | 4s | 6s |
| /upload | 500ms | 1s | 2s |

### **Optimization Tips**

1. **Use caching** for frequently accessed data
2. **Batch requests** when possible
3. **Implement pagination** for large datasets
4. **Use compression** for large payloads
5. **Monitor rate limits** to avoid throttling

---

## 📞 Support

### **API Issues**

For API-related issues:
- Check API status: `https://status.cpsdefenseanalyzer.com`
- Review error codes in this documentation
- Contact support: `api-support@cpsdefenseanalyzer.com`

### **Rate Limits**

If you need higher rate limits:
- Upgrade to Premium or Attorney tier
- Contact sales for custom enterprise plans

---

## 🔄 Versioning

Current API version: **v1**

### **Version History**

- **v1.0** (Nov 2025) - Initial release

### **Deprecation Policy**

- 90-day notice for deprecations
- 6-month support for deprecated endpoints
- Version included in URL path

---

**API Documentation Version:** 1.0  
**Last Updated:** November 24, 2025  
**Maintained By:** CPS Defense Analyzer Development Team

---

© 2025 CPS Case Defense Analyzer - API Documentation
