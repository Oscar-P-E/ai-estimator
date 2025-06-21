# 🤖 AI Estimator SaaS Platform

> **Embeddable AI-powered estimators for custom business websites**

A SaaS platform that provides businesses with intelligent quoting systems that can be embedded into any website. Business owners upload their pricing documents, and customers get instant AI-powered quotes through voice or text interactions.

## 🎯 What This Platform Does

**For the Website Developer:**
- Build custom websites for businesses
- Embed AI estimators seamlessly into each site
- One platform serves all your clients

**For Business Owners:**
- Upload pricing documents (Excel, CSV, PDF, Word - any format)
- Get a unique AI estimator for their business
- Manage customer interactions through a dashboard

**For End Customers:**
- Visit business websites and chat with AI for quotes
- No login required - just describe what they need
- Voice or text input - AI responds appropriately

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
| **Document Processing** | XLSX, planned: multi-format AI analysis |
| **Database** | Planned: PostgreSQL with Prisma |
| **Deployment** | Vercel |

## 📋 Current Status

**Working Features:**
- Business owner authentication and dashboard
- Document upload and processing (Excel/CSV)
- AI-powered quote generation
- Voice input with speech-to-text
- **NEW: Voice responses with text-to-speech**
- Business-specific chat pages

**In Development:**
- Enhanced document processing
- Embeddable widget system
- Multi-business support with database

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

## 📚 Documentation

- **Technical Specifications:** [docs/specs/](./docs/specs/)

---

**Ready to revolutionise how businesses provide quotes online! 🚀**

