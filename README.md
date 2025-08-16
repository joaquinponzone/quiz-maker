# 🧠 Quiz Maker - AI-Powered Quiz Generator

> Transform any PDF or Markdown document into an interactive quiz using AI

## ✨ Features

- **📄 Multi-Format Support**: Upload PDF or Markdown files
- **🤖 AI-Powered Generation**: Uses OpenAI GPT-4o Mini for intelligent quiz creation
- **🎯 Interactive Quizzes**: Multiple choice questions with instant feedback
- **💾 Persistent Storage**: Quiz progress saved with IndexedDB
- **🔄 Resume Sessions**: Continue where you left off after page refresh
- **🌍 Spanish Language**: Fully localized interface and AI responses
- **🎨 Brutalist Design**: Sharp, modern UI with crisp shadows
- **📱 Responsive**: Works perfectly on desktop and mobile
- **⚡ Real-time Streaming**: Watch questions generate in real-time

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joaquinponzone/quiz-maker.git
   cd quiz-maker
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

1. **Upload a Document**: Drag and drop or select a PDF/Markdown file (max 10MB)
2. **AI Processing**: The AI analyzes your document and generates 4 multiple-choice questions
3. **Take the Quiz**: Answer questions with real-time progress tracking
4. **Review Results**: See your score and review correct answers
5. **Save Progress**: Your quiz state is automatically saved for later

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) + OpenAI GPT-4o Mini
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Storage**: IndexedDB for client-side persistence
- **Language**: TypeScript for type safety
- **Package Manager**: [Bun](https://bun.sh/) for fast installs

## 📁 Project Structure

```
quiz-maker/
├── app/
│   ├── (preview)/          # Main application pages
│   └── api/
│       └── generate-quiz/  # AI quiz generation endpoint
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── quiz.tsx           # Main quiz component
│   ├── score.tsx          # Score display
│   └── quiz-overview.tsx  # Quiz review component
├── lib/
│   ├── schemas.ts         # Zod schemas for validation
│   ├── utils.ts           # Utility functions
│   └── quiz-cache.ts      # IndexedDB caching logic
└── public/                # Static assets
```

## 🎨 Design Philosophy

This project embraces **brutalist design principles**:
- Sharp, geometric shadows without blur
- Bold typography with clear hierarchy
- High contrast color schemes
- Minimalist, functional interfaces

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |

### Customization

- **AI Model**: Change the model in `app/api/generate-quiz/route.ts`
- **Question Count**: Modify the schema in `lib/schemas.ts`
- **Styling**: Update colors in `app/(preview)/globals.css`
- **Language**: Change prompts in the API route for different languages

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect to [Vercel](https://vercel.com)
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for the amazing AI integration
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [OpenAI](https://openai.com/) for the powerful AI models
- [Next.js](https://nextjs.org/) for the excellent framework

## 📞 Support

If you have any questions or need help:

- 🐛 [Report a bug](https://github.com/joaquinponzone/quiz-maker/issues)
- 💡 [Request a feature](https://github.com/joaquinponzone/quiz-maker/issues)
- 📧 [Contact me](https://github.com/joaquinponzone)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/joaquinponzone">@joaquinponzone</a></p>
  <p>⭐ Star this repo if you found it useful!</p>
</div>

