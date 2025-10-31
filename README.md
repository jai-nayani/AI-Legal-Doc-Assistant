# Legal Document Assistant 📄

An AI-powered legal document filling system designed for law firms, featuring intelligent placeholder detection, secure authentication, cloud storage, and a comprehensive document management system.

## ✨ Features

### 🤖 AI-Powered Document Processing
- **Smart Placeholder Detection**: Google Gemini AI automatically identifies ALL placeholders in any .docx document
- **Conversational Interface**: Step-by-step guided filling with AI-generated contextual prompts
- **Live Preview**: Real-time document updates with highlighted unfilled placeholders
- **Smart Validation**: Type-aware validation (dates, currency, emails, phone numbers, addresses)
- **Multi-Format Export**: Download as .docx or .pdf with perfect formatting preservation

### 🔐 Enterprise Authentication
- **Supabase Auth**: Secure email/password authentication
- **OAuth Integration**: Sign in with Google
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic session refresh and persistence

### ☁️ Cloud-First Architecture
- **Document Storage**: Automatic cloud backup in Supabase Storage
- **Document History**: Access all your previously filled documents
- **Template Library**: Upload, manage, and reuse document templates
- **Activity Logging**: Track all document operations

### 📊 Dashboard & Management
- **User Dashboard**: Overview of recent documents and quick actions
- **Document History**: Browse, download, and delete past documents
- **Template Management**: Search, upload, and use templates with one click
- **Analytics**: Track filled vs. total placeholders

## 🚀 How It Works

1. **Sign Up / Login**: Secure authentication with email or Google OAuth
2. **Upload Document**: Drop any .docx legal document template
3. **AI Analysis**: Gemini analyzes and identifies all empty placeholders
4. **Fill Fields**: Answer conversational prompts with smart input types
5. **Preview Changes**: See real-time updates with yellow-highlighted unfilled fields
6. **Download**: Export as .docx or .pdf
7. **Auto-Save**: Documents saved to your cloud account automatically

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS v4
- **AI**: Google Gemini 1.5 Flash for intelligent placeholder detection
- **Backend**: Next.js API Routes + Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth
- **Storage**: Supabase Storage for documents and templates
- **State Management**: Zustand
- **Document Processing**: Mammoth.js, docx, jsPDF
- **Deployment**: Netlify-ready configuration

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Google Gemini API key (free tier works)
- Google Cloud Console project (for OAuth)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Adithya_Lexsy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Google Gemini API Key
# Get from: https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase

#### A. Create Database Tables
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and run the contents of `supabase-schema.sql`
4. Copy and run the contents of `supabase-storage.sql`

#### B. Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider (follow `GOOGLE_AUTH_SETUP.md` for detailed steps)
4. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up to get started!

## 🌐 Deployment to Netlify

This project is Netlify-ready. See `DEPLOY_NOW.md` for step-by-step deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

**Important:** Update your Supabase redirect URLs to include your production domain.

## 📖 Usage Guide

### First Time Setup
1. **Sign Up**: Create an account using email/password or Google OAuth
2. **Dashboard**: You'll land on your personal dashboard with quick actions

### Filling a Document
1. **Upload**: Click "Upload Document" and select a .docx file
2. **AI Processing**: Gemini analyzes and extracts all empty placeholders
3. **Conversational Flow**: Answer prompts in the left panel
   - Smart input types (text, date pickers, currency, email)
   - Real-time validation
   - Skip/back navigation
4. **Live Preview**: Right panel shows your document with:
   - Yellow highlights for unfilled placeholders
   - Real-time updates as you type
5. **Download**: Export as .docx or .pdf
6. **Auto-Save**: Document automatically saved to your cloud account

### Template Management
1. Navigate to **Template Library** from dashboard
2. **Upload Templates**: Drop your reusable .docx templates
3. **Search**: Find templates by name
4. **Quick Fill**: Click "Open with Legal Document Assistant" to instantly load and start filling

### Document History
1. Go to **Document History** from dashboard
2. View all previously filled documents
3. See completion status (e.g., "85/100 fields filled")
4. Download or delete documents

## 🤖 AI Features

- **Universal Detection**: Works with ANY document format - no hardcoded patterns
- **Smart Field Typing**: Auto-detects text, currency, date, email, phone, address fields
- **Contextual Prompts**: AI generates conversational questions for each field
- **Empty-Only Detection**: Intelligently skips already-filled fields
- **Type-Aware Validation**: Email format, positive numbers, date formats

## 🔒 Security & Privacy

- **Secure Authentication**: Industry-standard OAuth 2.0 and JWT tokens
- **Encrypted Storage**: All documents encrypted at rest in Supabase
- **Row-Level Security**: Users can only access their own documents
- **HTTPS Only**: All data transmitted over secure connections
- **Session Management**: Automatic token refresh and secure session handling

## 📊 Database Schema

The application uses 5 main tables:
- `profiles`: User profiles and metadata
- `documents`: Document records with status tracking
- `placeholders`: Individual placeholder data
- `templates`: Reusable document templates
- `activity_logs`: Audit trail of all operations

See `supabase-schema.sql` for complete schema.

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for Legal Professionals**