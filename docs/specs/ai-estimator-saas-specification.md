# AI Estimator SaaS Platform - Technical Specification

**Version:** 2.0  
**Created:** June 21, 2025  
**Description:** A SaaS platform that provides embeddable AI-powered estimators for businesses, integrated into custom websites

## 📊 Current State

### ✅ Working Features
- Clerk authentication for business owners
- Excel/CSV document upload and processing
- Claude AI integration for quote generation
- Deepgram STT integration
- Business-specific chat pages (`/business/[slug]`)
- Basic dashboard for document management
- Animated voice input visualization

### ❌ Critical Issues
| Priority | Issue | Impact |
|----------|-------|--------|
| **High** | No embeddable API/widget system for external websites | Blocks core product offering |
| **High** | Rigid document schema limits business model flexibility | Prevents diverse business types |
| **High** | No proper business entity model (using Clerk user ID as business ID) | Architecture debt |
| **Medium** | Only supports Excel/CSV (missing PDF, Word, etc.) | Limited document processing |
| **Medium** | No TTS implementation | Incomplete voice interaction |
| **Medium** | No AI-powered document analysis | Misses flexible pricing extraction |
| **Low** | Custom domain/slug management missing | Professional branding limitations |

## 🏗️ Architecture

### Overview
- **Model:** Multi-tenant SaaS platform with embeddable widgets
- **Deployment:** Single Next.js application serving multiple tenants
- **Target:** Custom business websites with integrated AI estimators

### Data Models

#### Business
```typescript
{
  id: uuid (primary key)
  name: string (required)
  slug: string (unique, required)
  domain?: string (optional)
  owner_user_id: string (required)
  api_key: string (unique, required)
  settings: json (default: {})
  created_at: timestamp
  updated_at: timestamp
}
```

#### PricingDocument
```typescript
{
  id: uuid (primary key)
  business_id: uuid (foreign key → Business.id)
  filename: string (required)
  file_path: string (required)
  file_type: string (required)
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_data: json
  ai_analysis: text
  created_at: timestamp
}
```

#### ChatSession
```typescript
{
  id: uuid (primary key)
  business_id: uuid (foreign key → Business.id)
  session_token: string (unique)
  customer_info?: json (optional)
  created_at: timestamp
  last_activity: timestamp
}
```

#### ChatMessage
```typescript
{
  id: uuid (primary key)
  session_id: uuid (foreign key → ChatSession.id)
  role: 'user' | 'assistant'
  content: text (required)
  metadata: json (default: {})
  created_at: timestamp
}
```

## 🔌 API Design

### REST Endpoints

#### Chat Interaction
```http
POST /api/v1/businesses/{businessId}/chat
```
- **Description:** Public endpoint for customer chat interactions
- **Authentication:** API key or session token
- **Request:**
  ```json
  {
    "message": "string (required)",
    "session_token": "string (optional)",
    "audio_data": "base64 (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "response": "string",
    "session_token": "string",
    "audio_response": "base64 (optional)"
  }
  ```

#### Document Upload
```http
POST /api/v1/businesses/{businessId}/documents
```
- **Description:** Upload pricing documents
- **Authentication:** Business owner authentication
- **Content-Type:** `multipart/form-data`

#### Widget Script
```http
GET /api/v1/embed/widget.js?business_id={id}&theme={theme}&position={position}
```
- **Description:** Embeddable JavaScript widget
- **Parameters:**
  - `business_id` (required)
  - `theme` (optional)
  - `position` (optional)

### Widget System

#### Embed Code
```html
<script src="https://estimator.yourdomain.com/api/v1/embed/widget.js?business_id=YOUR_BUSINESS_ID"></script>
<div id="ai-estimator-widget"></div>
```

#### Widget Features
- ✅ Responsive design
- ✅ Customizable theming
- ✅ Modal or inline positioning
- ✅ Voice and text input
- ✅ Cross-origin support

## 🚀 Features

### 1. Flexible Document Processing
**Goal:** AI-powered document analysis that adapts to any business pricing model

**Implementation Steps:**
1. Add support for PDF, Word, and other document formats
2. Implement Claude document analysis to extract pricing patterns
3. Create dynamic schema generation based on document content
4. Add manual pricing data entry interface as fallback

### 2. Text-to-Speech Integration
**Goal:** Complete the voice interaction loop with TTS responses

**Implementation Steps:**
1. Integrate ElevenLabs or similar TTS service
2. Add voice response settings per business
3. Implement audio streaming for real-time responses

### 3. Business Onboarding Flow
**Goal:** Streamlined setup process for new businesses

**Implementation Steps:**
1. Create business registration form
2. Generate unique slug and API key
3. Document upload wizard
4. Widget configuration interface
5. Testing and deployment tools

### 4. Analytics Dashboard
**Goal:** Insights for business owners on customer interactions

**Implementation Steps:**
1. Chat session tracking
2. Quote generation metrics
3. Popular service/product analysis
4. Customer interaction patterns

### 5. Embeddable Widget System
**Goal:** JavaScript widget for easy integration into client websites

**Implementation Steps:**
1. Create iframe-based widget architecture
2. Implement PostMessage communication
3. Add theming and customization options
4. Ensure mobile responsiveness
5. Add position controls (modal, sidebar, inline)

## ⚙️ Technical Requirements

### Database
- **Type:** PostgreSQL
- **ORM:** Prisma
- **Migrations:** Required for schema changes

### File Storage
- **Service:** AWS S3 or similar
- **Purpose:** Pricing documents and audio files

### AI Services
- **LLM:** Claude 3.5 Sonnet (Anthropic)
- **STT:** Deepgram
- **TTS:** ElevenLabs or Azure Cognitive Services
- **Document Analysis:** Claude with vision capabilities

### Authentication
- **Business Owners:** Clerk (existing)
- **API Access:** API keys and session tokens
- **Customers:** Anonymous with optional contact info

## 📅 Implementation Phases

### Phase 0: Demo Deployment (1 week) 🚨 **IMMEDIATE PRIORITY**
*Get current functionality online as a working demo for validation and customer presentations*

- [ ] Integrate TTS service (ElevenLabs) for voice responses
- [ ] Polish UI/UX for demo presentation
- [ ] Deploy to Vercel with environment variables
- [ ] Test end-to-end functionality (admin upload, public chat, voice I/O)
- [ ] Create demo script and test scenarios

**Success Criteria:**
- ✅ Admin can upload documents and they are processed
- ✅ Public users can chat via text and voice
- ✅ AI responds with voice when user used voice input
- ✅ Site is accessible online with reliable hosting

### Phase 1: Enhanced Document Processing (2-3 weeks) 🔥 **HIGH PRIORITY**
*Improve document handling based on demo feedback and real-world usage*

- [ ] Add support for PDF and Word document formats
- [ ] Implement AI-powered document analysis for flexible schemas
- [ ] Create dynamic pricing data extraction
- [ ] Add manual data entry interface as fallback
- [ ] Improve error handling and user feedback

### Phase 2: Multi-Business Support (2-3 weeks) 🔥 **HIGH PRIORITY**
*Add proper multi-tenant capabilities while keeping current simple deployment*

- [ ] Set up PostgreSQL database (local file system backup)
- [ ] Create Business and PricingDocument models
- [ ] Implement proper business isolation
- [ ] Add business registration and management
- [ ] Migrate existing file-based system to database

### Phase 3: Embeddable Widget System (3-4 weeks) 🟡 **MEDIUM PRIORITY**
*Core SaaS feature - embeddable widgets for client websites*

- [ ] Create embeddable JavaScript widget
- [ ] Implement iframe-based architecture  
- [ ] Add theming and customization options
- [ ] Ensure cross-origin compatibility
- [ ] Test across multiple website environments

### Phase 4: API System (2-3 weeks) 🟡 **MEDIUM PRIORITY**
*REST APIs for programmatic access and widget communication*

- [ ] Design and implement REST APIs
- [ ] Add API authentication and rate limiting
- [ ] Create API documentation
- [ ] Implement session management
- [ ] Add webhook support for integrations

### Phase 5: Business Management & Analytics (3-4 weeks) 🔵 **LOW PRIORITY**
*Advanced features for business owners*

- [ ] Build comprehensive analytics dashboard
- [ ] Add advanced business settings
- [ ] Implement custom domain support
- [ ] Create business onboarding flow
- [ ] Add billing and subscription management

### Phase 6: Scale & Polish (3-4 weeks) 🔵 **LOW PRIORITY**
*Production-ready improvements and scaling*

- [ ] Implement comprehensive monitoring
- [ ] Add performance optimizations
- [ ] Create automated testing suite
- [ ] Implement advanced caching strategies
- [ ] Add enterprise features (SSO, advanced analytics)

**Total Estimated Time:** 15-21 weeks (including demo phase)

## 🧪 Testing Strategy

| Test Type | Coverage |
|-----------|----------|
| **Unit Tests** | All business logic and API endpoints |
| **Integration Tests** | Database operations and external service calls |
| **E2E Tests** | Complete user workflows for both business owners and customers |
| **Widget Tests** | Cross-browser and cross-domain compatibility |

## 🚀 Deployment Considerations

### Hosting
- **Platform:** Vercel or AWS with CDN for widget delivery
- **Environment:** Secure management of API keys and secrets
- **Monitoring:** Application performance and error tracking
- **Scaling:** Database connection pooling and API rate limiting

## 📈 Success Metrics

- **Business Growth:** Number of businesses onboarded
- **Technical Adoption:** Widget embedding rate
- **User Engagement:** Customer interaction volume
- **AI Performance:** Quote generation accuracy
- **Customer Satisfaction:** Customer satisfaction scores

## 🎯 Key Success Factors

1. **Seamless Integration** - Widget must work flawlessly on any website
2. **Flexible Processing** - Handle any business pricing model
3. **User Experience** - Intuitive for both business owners and customers
4. **Performance** - Fast responses and reliable uptime
5. **Scalability** - Support growing number of businesses and interactions

--- 