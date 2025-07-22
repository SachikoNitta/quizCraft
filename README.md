# QuizCraft - AI Certification Quiz Generator

A modern Next.js application that creates personalized certification practice quizzes using Google's Gemini AI. Experience real-time question generation with permanent local storage and an elegant, minimalistic interface.

## ✨ Key Features

### 🔥 **Live Quiz Sessions**
- **One-by-one generation**: Questions generate in real-time as you progress through the quiz
- **Instant feedback**: Get immediate explanations after each answer
- **Progress auto-save**: Never lose your progress - every answer is automatically saved
- **Exit anytime**: Start a quiz, exit halfway, and continue later exactly where you left off

### 🤖 **Smart AI Generation**
- **Latest content**: AI generates questions based on current certification exam objectives and best practices
- **Adaptive difficulty**: Questions cover various domains and difficulty levels within each certification
- **Context-aware**: Each question builds upon the certification's specific requirements and terminology

### 💾 **Permanent Storage**
- **Local persistence**: All quizzes and progress stored permanently in your browser's localStorage
- **Survives refreshes**: Data persists through browser restarts, tab closures, and computer reboots
- **Privacy-first**: All data stays on your device - nothing sent to external servers
- **Smart management**: Automatic deduplication and progress tracking

### 🌍 **Multi-Language Support**
Generate quizzes in 20+ languages including:
- English, Spanish, French, German, Italian, Portuguese
- Japanese (日本語), Korean (한국어), Chinese (中文)
- Hindi (हिन्दी), Arabic (العربية), Russian (Русский)
- And 14+ more languages with native script support

### 🎨 **Beautiful Interface**
- **Minimalistic design**: Clean, distraction-free interface with pastel gradients
- **Glassmorphism effects**: Modern UI with backdrop blur and transparency
- **Full-width layout**: Browser-wide responsive design that maximizes screen real estate
- **Smooth animations**: Floating cards and seamless transitions throughout
- **Mobile-optimized**: Perfect experience on desktop, tablet, and mobile devices

### 📊 **Progress Tracking**
- **Visual indicators**: Easily identify complete vs. in-progress quizzes
- **Real-time scoring**: See your score update as you progress
- **Session history**: Browse all your quiz attempts with timestamps
- **Status badges**: Clear visual distinction between completed and ongoing sessions

## Getting Started

### Prerequisites

- Node.js 18+ 
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🚀 How to Use

### 1. Start a Live Quiz Session

1. Click **"Start Quiz"** in the header navigation
2. Enter your **Gemini API Key** (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))
3. Specify the **Certificate Name** (e.g., "AWS Solutions Architect", "Google Cloud Professional Cloud Architect")
4. Select your **preferred language** from 20+ supported options
5. Choose the **number of questions** (1-20)
6. Click **"Start Quiz Session"**

### 2. Interactive Quiz Experience

- **Real-time generation**: First question generates immediately, subsequent questions create as you progress
- **Answer and learn**: Select your answer, submit, and get instant detailed explanations
- **Visual progress**: Track your advancement with the progress bar and question counter
- **Auto-save**: Every answer is automatically saved - never lose your progress
- **Exit flexibility**: Use "Exit Quiz" to pause and continue later

### 3. Browse Your Quiz Collection

- Navigate to **"My Quizzes"** to see all your quiz sessions
- **Visual status indicators**:
  - 🟢 **Complete**: Finished quizzes with all questions answered
  - 🟠 **In Progress**: Partially completed sessions you can resume
- **Quick actions**:
  - **Start Quiz**: Begin taking the quiz or resume where you left off
  - **Download**: Export as JSON file for backup
  - **Copy**: Copy JSON to clipboard for sharing

### 4. Persistent Storage

- **Automatic saving**: All progress saves to your browser's local storage
- **Permanent data**: Quizzes persist through browser refreshes and computer restarts
- **Privacy-focused**: All data stays on your device - nothing sent to servers
- **Storage info**: View your total quiz count and storage usage

### 5. Advanced Features

- **Resume incomplete quizzes**: Continue exactly where you left off
- **Multiple concurrent sessions**: Work on different certifications simultaneously  
- **Export/Import**: Backup your quiz data or share with others
- **Responsive design**: Seamless experience across all devices

## API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in the application

**Note**: Your API key is only used locally and is never stored or transmitted anywhere except to Google's Gemini API.

## Supported Certifications

The quiz maker can generate questions for any professional certification, including but not limited to:

- **Cloud Platforms**: AWS, Google Cloud, Microsoft Azure
- **DevOps**: Docker, Kubernetes, Jenkins, Terraform
- **Security**: CISSP, CompTIA Security+, CISM
- **Project Management**: PMP, Scrum Master, Agile
- **Database**: Oracle, MySQL, PostgreSQL, MongoDB
- **Networking**: Cisco, CompTIA Network+
- **And many more!**

## 🛠️ Technical Details

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom gradient utilities
- **AI Integration**: Google Gemini 2.0 Flash API
- **Storage**: Browser localStorage with automatic persistence
- **Icons**: Lucide React icon library
- **Architecture**: Server-side API routes with client-side UI

### Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main application entry point
│   └── api/
│       ├── generate-quiz/          # Legacy bulk generation API
│       └── generate-question/      # Real-time single question API
├── components/
│   ├── AppLayout.tsx              # Header navigation layout
│   ├── QuizForm.tsx               # Quiz session setup form
│   ├── QuizSession.tsx            # Live quiz interface with real-time generation
│   ├── QuizList.tsx               # Quiz collection browser with status indicators
│   └── QuizTaker.tsx              # Completed quiz review interface
├── lib/
│   ├── gemini.ts                  # AI API integration utilities
│   └── storage.ts                 # localStorage persistence layer
└── types/
    └── quiz.ts                    # Comprehensive type definitions
```

### Key Innovations

- **Real-time Question Generation**: Questions generate one-by-one as users progress
- **Persistent Session Management**: Advanced localStorage implementation with session tracking
- **Server-side AI Processing**: CORS-compliant API routes handle all AI interactions
- **Progressive Question Building**: Each answered question is immediately stored and available for browsing

## 🔧 Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Gemini API key is valid and has sufficient quota
   - Get a fresh key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Check that your API key has access to the Gemini 2.0 Flash model

2. **Question Generation Fails**: 
   - Check your internet connection stability
   - Try with a shorter certification name
   - Reduce the number of questions if experiencing timeouts

3. **Progress Not Saving**: 
   - Ensure your browser allows localStorage
   - Check that you're not in private/incognito mode
   - Clear browser cache if experiencing corruption

4. **Build Errors**: 
   - Run `npm install` to ensure all dependencies are installed
   - Use Node.js version 18 or higher
   - Clear `node_modules` and reinstall if needed

### Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **localStorage support**: Required for persistence features
- **ES6+ support**: Required for modern JavaScript features

### Performance Tips

- **Optimal question count**: 5-10 questions for best experience
- **Network stability**: Stable internet required for real-time generation
- **Storage cleanup**: Use browser dev tools to clear localStorage if needed

### Getting Help

If you encounter issues:

1. **Check browser console** for error messages and network issues
2. **Verify API key** is correct and has sufficient quota
3. **Test connectivity** to api.openai.com and generativelanguage.googleapis.com
4. **Try different certifications** to isolate content-specific issues
5. **Clear browser storage** if experiencing persistent errors

### Data Export/Backup

To backup your quiz data:
1. Go to "My Quizzes" tab
2. Use the download button on each quiz to export as JSON
3. Store the JSON files safely for reimport if needed

### Privacy & Security

- ✅ All quiz data stored locally in your browser
- ✅ API key only sent to Google's Gemini API
- ✅ No personal data transmitted to third parties
- ✅ Quiz content can be exported and deleted anytime
