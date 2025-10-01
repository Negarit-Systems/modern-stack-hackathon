# Modern Stack Hackathon - AI-Powered Research Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Latest-orange)](https://www.convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Latest-38B2AC)](https://tailwindcss.com/)

A cutting-edge collaborative research platform that transforms web data into actionable intelligence using AI-powered insights and real-time collaboration tools. Built for modern research teams who need to move fast and work smarter.

## ✨ Features

### Core Capabilities
- **AI-Powered Research**: Generate comprehensive summaries and actionable insights from web data using advanced AI models (OpenAI GPT)
- **Real-Time Collaboration**: Work seamlessly with your team using integrated comments, chat, and shared workspaces
- **Web Crawling & Data Extraction**: Automatically crawl websites to collect, analyze, and organize data for deeper research
- **Rich Text Editor**: Professional document editing with collaborative features
- **Interactive Whiteboard**: Visual collaboration with drawing and diagramming tools
- **Document Management**: Organize and manage multiple research documents per session

### Advanced Features
- **User Authentication**: Secure authentication with Better Auth
- **Email Invitations**: Invite collaborators via email with Resend integration
- **Real-Time Notifications**: Stay updated with in-app notifications for comments and mentions
- **Export Functionality**: Export research documents as PDF
- **File Upload & Processing**: Upload and process documents with AI embeddings
- **Comment System**: Threaded comments with mentions and replies
- **Group Chat**: Real-time messaging within research sessions

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Charts**: Custom visualization components

### Backend & Database
- **Backend-as-a-Service**: Convex
- **Authentication**: Better Auth
- **Email Service**: Resend
- **Vector Database**: Convex with vector indexing for AI embeddings

### AI & Data Processing
- **AI Models**: OpenAI GPT-4
- **Web Scraping**: Firecrawl
- **PDF Processing**: PDF.js with custom patches
- **Document Parsing**: LangChain

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint
- **Package Manager**: npm
- **Build Tool**: Next.js built-in

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Negarit-Systems/modern-stack-hackathon.git
   cd modern-stack-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

   # Authentication
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your_better_auth_secret
   BETTER_AUTH_URL=http://localhost:3000

   # AI Services
   OPENAI_API_KEY=your_openai_api_key

   # Email Service
   RESEND_API_KEY=your_resend_api_key

   # Web Scraping
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   ```

4. **Set up Convex**
   ```bash
   npx convex dev --once
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Getting Started
1. **Sign Up/Login**: Create an account or sign in to access the platform
2. **Start a Research Session**: Enter a research topic and optionally invite collaborators
3. **Collaborate**: Work on documents, use the whiteboard, and communicate with your team

### Key Workflows

#### Creating a Research Session
- Navigate to the homepage
- Enter your research topic
- Add collaborator emails (optional)
- Click "Start Research" to create your session

#### Document Collaboration
- Switch to the "Editor" view
- Use the rich text editor to write and format your research
- Add comments by selecting text and clicking the comment button
- Reply to comments and mention collaborators

#### Visual Collaboration
- Switch to the "Whiteboard" view
- Draw diagrams, mind maps, or sketches
- Collaborate in real-time with your team

#### AI-Powered Research
- Use the sidebar chat to ask questions about your research
- The AI will analyze your documents and provide insights
- Upload files for additional context

#### Exporting Results
- Click the "Export" button in the dashboard header
- Choose your export format (PDF)
- Download your research document

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── canvas/           # Editor and whiteboard components
│   └── dashboard/        # Dashboard-specific components
├── convex/               # Convex backend
│   ├── crud/            # Database operations
│   ├── functions/       # Serverless functions
│   ├── schemas/         # Database schemas
│   └── auth.ts          # Authentication config
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
└── public/              # Static assets
```

## Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your application

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure tests pass
4. **Commit your changes**
   ```bash
   git commit -m "Add your commit message"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

If you encounter any issues or have questions:

- Check the [Issues](https://github.com/Negarit-Systems/modern-stack-hackathon/issues) page
- Create a new issue with detailed information
- Contact the development team

## 🙏 Acknowledgments

- **Convex** for the powerful backend-as-a-service platform
- **Vercel** for hosting and deployment
- **OpenAI** and **Google** for AI capabilities
- **Firecrawl** for web scraping technology
- **Resend** for reliable email delivery

