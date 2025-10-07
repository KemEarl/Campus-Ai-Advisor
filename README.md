# Campus-Ai-Advisor

A sophisticated AI-powered campus assistant that provides personalized support to university students. Built with React.js, Node.js, and integrated with multiple AI providers for intelligent conversations.

## Features We're Aiming For

### AI-Powered Assistance
- Intelligent conversations with GPT-powered responses for campus-related queries
- Personalized context that remembers student majors, years, and preferences
- 24/7 availability as an always-on campus support system

### Premium Metallic UI
- Sleek brushed metal aesthetic with blue-silver color scheme
- Fully responsive layout optimized for desktop, tablet, and mobile devices
- Smooth animations and professional transitions

### Secure Authentication
- JWT-based security for protected user sessions
- Role-based access for personalized experiences based on student profiles
- Secure registration with BCrypt password hashing

### Smart Features
- Persistent conversation history per user
- Context awareness with major-specific course recommendations
- Proactive support with intelligent suggestions based on academic year

## Quick Start

### Prerequisites
- Node.js (v22.19.0 or higher)
- npm or yarn
- OpenAI API account (optional)
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd campus-ai-advisor
   ```

2. Backend Setup
   ```
   cd backend
   npm install
   ```

3. Frontend Setup
   ```
   cd ../frontend
   npm install
   ```

4. Environment Configuration
   
   Create backend/.env:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key
   JWT_SECRET=your-super-secure-jwt-secret
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   HUGGINGFACE_API_KEY=your-huggingface-token-optional
   ```

### Database Setup

1. Create Supabase Project
   - Visit Supabase website
   - Create new project
   - Get API credentials from Settings -> API

2. Run Database Schema
   ```sql
   CREATE TABLE users (
     id BIGSERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     major VARCHAR(100),
     year INTEGER,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE conversations (
     id BIGSERIAL PRIMARY KEY,
     user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
     message TEXT NOT NULL,
     sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_conversations_user_id ON conversations(user_id);
   CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
   ```

### Running the Application

1. Start Backend Server
   ```
   cd backend
   npm run dev
   ```
   Server runs on: http://localhost:5000

2. Start Frontend Development Server
   ```
   cd frontend
   npm start
   ```
   App runs on: http://localhost:3000

## Technology Stack

### Frontend
- React.js - UI framework
- CSS3 - Metallic styling with gradients and animations
- Axios - HTTP client for API communication
- Modern ES6+ - Latest JavaScript features

### Backend
- Node.js - Runtime environment
- Express.js - Web application framework
- JWT - Authentication tokens
- BCrypt - Password hashing
- Supabase - PostgreSQL database
- Multiple AI providers - OpenAI, HuggingFace, and local mock responses

### APIs & Services
- OpenAI GPT - Intelligent conversation handling (when available)
- HuggingFace - Free alternative AI models
- Local Mock Responses - Fallback for development without API keys
- Supabase - Database and real-time features
- RESTful API - Clean backend architecture

## Project Structure

```
campus-ai-advisor/
├── backend/
│   ├── server.js          # Main server file
│   ├── ai/
│   │   └── assistant.js   # Multi-provider AI integration
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling with metallic theme
│   │   └── OG_Eduvos.jpg  # Campus background image
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/register - User registration
- POST /api/login - User login
- GET /api/profile - Get user profile (protected)

### AI Chat
- POST /api/chat - AI conversation (protected)
- POST /api/simple-chat - Basic AI chat (unprotected)

### System
- GET /api/health - Server health check
- GET /api/debug - Environment debugging
- GET /api/ai-health - AI service status
- GET /api/setup-database - Database status check

## UI Components

### Main Interface
- Metallic Chat Container - Brushed metal message area
- Floating Login Modal - Split-screen authentication
- Responsive Design - Mobile-optimized layout

### Authentication Modal
- Image Side - Campus background with overlay
- Form Side - Elegant login/registration forms
- Enhanced Inputs - Styled form controls with validation

### Chat Features
- Message Bubbles - Themed user and AI messages
- Typing Indicators - Animated loading states
- Personalized Welcome - Context-aware greetings

## Configuration

### Environment Variables
```
# Required for database
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# AI Providers (at least one recommended)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_optional

# Optional
PORT=5000  # Backend port (default: 5000)
```

### AI Provider Configuration
The system supports multiple AI providers:
- OpenAI GPT: Full-featured, requires billing
- HuggingFace: Free alternative with limited models
- Local Mock: Smart mock responses for development

Switch providers in ai/assistant.js by changing the provider variable.

## Deployment

### Backend Deployment (Vercel)
1. Install Vercel CLI: npm i -g vercel
2. In backend directory: vercel
3. Set environment variables in Vercel dashboard

### Frontend Deployment (Netlify)
1. Build project: npm run build
2. Drag build folder to Netlify
3. Configure environment variables

### Database Deployment
- Supabase handles database hosting automatically
- Ensure proper CORS configuration for your domain

## Troubleshooting

### Common Issues

1. Registration Fails
   - Check Supabase table creation
   - Verify environment variables
   - Check server console for detailed errors

2. AI Not Responding
   - System uses mock responses if no API keys are available
   - Check AI health endpoint for provider status
   - Review server logs for API errors

3. Styling Issues
   - Clear browser cache
   - Check CSS file loading
   - Verify image paths

### Debug Endpoints
- GET /api/health - Basic server status
- GET /api/debug - Detailed environment info
- GET /api/ai-health - AI service status and current provider
- GET /api/setup-database - Database connection status

## Contributing

1. Fork the repository
2. Create feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT integration
- HuggingFace for free AI models
- Supabase for database services
- React Community for excellent documentation
- Eduvos for the campus inspiration

## Support

For support and questions:
- Create an issue in the repository
- Check the debugging endpoints
- Review the troubleshooting section

Built for the campus community - Making student life easier, one conversation at a time.
