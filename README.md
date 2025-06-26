# 🤖 AI Estimator SaaS Platform

> **Embeddable AI-powered estimators for custom business websites**

A SaaS platform that provides businesses with intelligent quoting systems that can be embedded into any website. Business owners upload their pricing documents which AI reads directly during customer conversations, providing instant contextual quotes through voice or text interactions.

## 🎯 What This Platform Does

**For the Website Developer:**
- Build custom websites for businesses
- Embed AI estimators seamlessly into each site
- One platform serves all your clients

**For Business Owners:**
- Upload any Claude-readable files (Excel, CSV, PDF, Word, images, code files, etc.)
- Files are stored as-is and read directly by AI (zero processing overhead)
- Get a unique AI estimator for their business with conversation persistence
- Manage files easily through the dashboard (upload, list, delete)

**For End Customers:**
- Visit business websites and chat with AI for quotes
- Natural conversation flow with full context maintained
- Voice or text input - AI responds in same format
- Complete voice conversation experience

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Authentication** | Clerk |
| **AI/LLM** | Claude 3.5 Sonnet (Anthropic) |
| **Speech-to-Text** | Deepgram |
| **Text-to-Speech** | ElevenLabs |
| **File System** | Direct file storage with Claude interpretation |
| **Database** | Planned: PostgreSQL with Prisma |
| **Deployment** | Vercel |

## 📋 Current Status (Phase 0: Demo Ready)

**✅ Working Features:**
- ✅ **Business owner authentication and dashboard**
- ✅ **Multi-format file upload** (`.txt`, `.md`, `.csv`, `.json`, `.xml`, `.pdf`, `.docx`, `.xlsx`, `.py`, `.js`, `.ts`, `.html`, `.css`, `.png`, `.jpg`, `.gif`, `.webp`)
- ✅ **Simplified file system** - files stored as-is in `business_files/{business_id}/`
- ✅ **Enhanced file management** - list files with details, delete files, file validation
- ✅ **AI-powered quote generation** with full business file context
- ✅ **Conversation persistence** - maintains context across messages in same session
- ✅ **Complete voice conversation loop** (STT → AI → TTS)
- ✅ **Business-specific chat pages** (`/business/[business_id]`)
- ✅ **Business file isolation** - users only access their own files (using Clerk user ID)
- ✅ **Polished UI/UX** suitable for demo presentations
- ✅ **Clean build and deployment ready**

**🚧 Planned for Phase 1:**
- 🔄 **Quote persistence for logged-in users**
- 🔄 **Database-backed multi-tenancy**
- 🔄 **Embeddable widget system**
- 🔄 **Advanced business management**

## 🏗️ Architecture

```
📁 File Upload → 💾 Store as-is → 💬 Chat Request → 🤖 Claude reads all business files as context → 💬 Response
```

### File System
- **Structure**: `business_files/{business_id}/{filename}`
- **Processing**: None - files stored as-is, Claude reads/interprets directly during chat
- **Supported Formats**: Any Claude-readable format
- **Isolation**: Using Clerk user ID as business ID for Phase 0

### Conversation Flow
- **Frontend**: Sends full conversation history with each message
- **Backend**: Processes complete conversation context with Claude
- **Result**: Natural conversation flow without losing context

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd estimator
   pnpm install
   ```

2. **Set up environment variables:**
   Create `.env.local` with:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Anthropic Claude API
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Deepgram Speech-to-Text
   DEEPGRAM_API_KEY=...
   
   # ElevenLabs Text-to-Speech
   ELEVENLABS_API_KEY=...
   ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```

4. **Test the system:**
   - Go to `/dashboard` to upload business files
   - Visit `/business/{your-user-id}` to test the chat interface
   - Try both voice and text interactions

## 📚 Documentation

- **Technical Specifications:** [docs/specs/](./docs/specs/)
- **Phase 0 Plan:** [docs/specs/phase-0-demo-ready-plan.md](./docs/specs/phase-0-demo-ready-plan.md)

---

**Phase 0: Demo Ready! 🎉 Ready to revolutionise how businesses provide quotes online! 🚀**

