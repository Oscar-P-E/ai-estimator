# AI-Powered Quoting Assistant

This project is a Next.js web application that enables business owners to provide instant, AI-powered quoting to their clients. Business owners can log in, upload their own pricing documents, and receive a unique public chat page where their clients can interact with an AI assistant to get accurate, personalized quotes.

## Features
- **Business Owner Dashboard**: Secure login, document upload, and management.
- **Multi-Tenant Public Chat**: Each business gets a unique public chat page for their clients.
- **Conversational AI Interface**: Clients can chat or speak with the AI to request quotes.
- **Flexible Document Processing**: Upload Excel, CSV, or similar files with any structure; the system extracts pricing data.
- **Quote Generation**: The AI uses the extracted data to generate quotes, asking clarifying questions as needed.
- **Voice Input**: Users can interact with the AI using speech recognition (Deepgram-powered, works in all browsers).

## User Roles & Workflow

### 1. Business Owner (e.g., Roof Installer, Plumber)
- Logs in to a secure dashboard.
- Uploads one or more pricing documents (Excel, CSV, etc.).
- Receives a unique public chat page link (e.g., `/business/[userId]`).
- Shares this link with clients.

### 2. End Customer (the business owner's client)
- Visits the business's public chat page.
- Chats with the AI (via text or voice) to describe their needs and get a quote.
- The AI uses the business's uploaded pricing documents to ask clarifying questions and generate a quote.

## Tech Stack
- **Next.js** (React, API routes, App Router)
- **TypeScript**
- **Clerk** (authentication, multi-tenancy)
- **xlsx** (for Excel file parsing)
- **Deepgram** (for browser-compatible speech-to-text)
- **Tailwind CSS** (modern, responsive UI)

