<div align="center">
  
  # ⚡ Aeterna AI
  *Transform text into captivating videos with AI-powered automation* ✨

  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge&logo=clerk)](https://clerk.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Postgres](https://img.shields.io/badge/Postgres-Latest-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
  [![DrizzleORM](https://img.shields.io/badge/Drizzle-ORM-green?style=flat-square)](https://orm.drizzle.team/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-GNU%20GPL-blue)](LICENSE)

  **An intelligent video generation platform powered by AI**

  [Report Bug](https://github.com/Theideabased/aeterna/issues) · [Request Feature](https://github.com/Theideabased/aeterna/issues)

</div>

---

## 🎯 Overview

**Aeterna AI** is a cutting-edge SaaS platform that transforms text prompts into professional-quality videos. Built with Next.js 15 frontend and a Python/FastAPI backend, it leverages advanced AI technologies to automate the entire video creation process from script generation to final rendering.

Perfect for content creators, marketers, educators, and businesses looking to scale their video production without compromising quality.

---

## 🚀 Features

### 🎬 Video Generation Pipeline
- **AI Script Generation** - Intelligent content creation from text prompts
- **Text-to-Speech** - Natural voice synthesis with Edge TTS
- **Automated Subtitles** - AI-powered caption generation with Whisper
- **Stock Media Integration** - Automatic video/image sourcing from Pixabay & Pexels
- **Professional Rendering** - High-quality video output with MoviePy

### 🎨 User Experience
- **Real-Time Progress Tracking** - Live updates on video generation status
- **Video Library** - Organized dashboard with timestamp sorting
- **Processing Priority Queue** - Active generations always visible first
- **Responsive Design** - Beautiful UI built with Tailwind CSS & shadcn/ui

### 🔐 Security & Authentication
- **Clerk Authentication** - Secure user management
- **Firebase Integration** - Reliable data storage
- **PostgreSQL Database** - Robust data persistence with Drizzle ORM

### ⚙️ Technical Excellence
- **Scalable Architecture** - Separate frontend/backend deployment
- **State Persistence** - Task restoration from disk on restart
- **Environment-Based Config** - Seamless local/production switching
- **API-First Design** - RESTful FastAPI backend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  Dashboard │  │   Create   │  │  Video Library     │   │
│  │   & Auth   │  │    Video   │  │  (Real-time Poll)  │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
│         │                │                   │              │
└─────────┼────────────────┼───────────────────┼──────────────┘
          │                │                   │
          └────────────────┴───────────────────┘
                           │
                  HTTPS API Calls
                           │
          ┌────────────────▼───────────────────┐
          │   BACKEND (Python/FastAPI)         │
          │                                     │
          │  ┌──────────────────────────────┐ │
          │  │  Video Generation Engine     │ │
          │  │  • Script Generation (LLM)   │ │
          │  │  • Voice Synthesis (TTS)     │ │
          │  │  • Media Sourcing (APIs)     │ │
          │  │  • Subtitle Generation       │ │
          │  │  • Video Rendering (MoviePy) │ │
          │  └──────────────────────────────┘ │
          │                                     │
          │  ┌──────────────────────────────┐ │
          │  │  Task Manager & Storage      │ │
          │  │  • In-Memory State           │ │
          │  │  • Disk Persistence          │ │
          │  │  • Progress Tracking         │ │
          │  └──────────────────────────────┘ │
          └─────────────────────────────────────┘
```

**Deployment:**
- Frontend: Vercel (or any Next.js host)
- Backend: Google Cloud Run (containerized FastAPI)
- Database: PostgreSQL + Firebase

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Git** for cloning the repository
- **API Keys** (see Environment Variables section)

### 1. Clone the Repository

```bash
git clone https://github.com/Theideabased/aeterna.git
cd aeterna
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
NEXT_PUBLIC_DRIZZLE_DATABASE_URL=postgresql://your_database_url

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

# AI Services (Optional - if using frontend AI features)
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=your_eleven_labs_key
NEXT_PUBLIC_CAPTION_API=your_caption_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key



### 4. Set Up Database

```bash
npm run db:push
```

To open Drizzle Studio for database management:

```bash
npm run db:studio
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!


### Backend (Google Cloud Run)

The backend API is deployed separately. See the [backend repository](https://github.com/Theideabased/aeterna-api) for deployment instructions.



---

## 🎯 Usage

1. **Sign Up/Login** - Create an account using Clerk authentication
2. **Navigate to Create** - Go to "Create New Video" from the dashboard
3. **Enter Your Prompt** - Describe the video you want to generate
4. **Configure Options** - Choose voice, style, and other parameters
5. **Generate** - Click generate and monitor real-time progress
6. **View Videos** - Access your generated videos in the Videos library
7. **Download** - Download completed videos directly

### Video Library Features

- **Real-time Updates** - Progress bars show generation status
- **Smart Sorting** - Processing videos appear first, then by newest
- **Timestamp Tracking** - See exactly when each video was created
- **Easy Management** - View, download, and organize your videos

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.0
- **Language:** JavaScript (React)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Authentication:** Clerk
- **Database ORM:** Drizzle ORM
- **HTTP Client:** Axios
- **Video Player:** Remotion
- **3D Graphics:** Spline

### Backend (Separate Repository)
- **Framework:** FastAPI (Python)
- **Video Processing:** MoviePy
- **AI/ML:** 
  - Whisper (subtitle generation)
  - Edge TTS (text-to-speech)
  - LLM integration for script generation
- **Media APIs:** Pixabay, Pexels
- **Deployment:** Google Cloud Run

### Database & Storage
- **Primary DB:** PostgreSQL (via Drizzle ORM)
- **File Storage:** Firebase
- **Task Persistence:** Disk-based state management

---

## 📁 Project Structure

```
aeterna/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── dashboard/                # Dashboard layout
│   │   ├── create-new/          # Video creation page
│   │   ├── videos/              # Video library with real-time updates
│   │   └── sponsor/             # Sponsorship page
│   ├── _context/                 # React Context providers
│   ├── layout.js                # Root layout
│   └── page.js                  # Landing page
├── components/                   # Reusable React components
│   └── ui/                      # shadcn/ui components
├── configs/                      # Configuration files
│   ├── db.js                    # Database config
│   ├── schema.js                # Database schema
│   ├── aimodel.js               # AI model configs
│   └── FireBaseConfig.jsx       # Firebase setup
├── lib/                         # Utility functions
├── public/                      # Static assets
├── remotion/                    # Video rendering components
├── screenshots/                 # App screenshots
├── .env.local                   # Local environment variables (gitignored)
├── .env.production              # Production environment variables
├── .gitignore                   # Git ignore rules
├── next.config.mjs              # Next.js configuration
├── tailwind.config.js           # Tailwind CSS config
├── drizzle.config.js            # Drizzle ORM config
└── package.json                 # Dependencies and scripts
```

---

## 🔑 API Endpoints

The backend API provides the following endpoints:

### Video Generation
- `POST /api/v1/video` - Create new video generation task
- `GET /api/v1/tasks` - Get all tasks
- `GET /api/v1/tasks/{task_id}` - Get specific task details
- `GET /api/v1/tasks/{task_id}/video` - Download generated video

### Health Check
- `GET /api/v1/ping` - Check API health

---

## 🎨 Screenshots

<details>
  <summary>View Screenshots</summary>
  
  <div align="center">
    <img src="screenshots/image%20(1).png" alt="Dashboard" width="400px"/>
    <img src="screenshots/image%20(2).png" alt="Video Creation" width="400px"/>
    <img src="screenshots/image%20(3).png" alt="Video Library" width="400px"/>
  </div>

</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please ensure your code follows the existing style and includes appropriate tests.

---

## 💖 Support

If you find this project helpful, consider sponsoring! Click the "Sponsor" button in the dashboard to get in touch.

**Contact:** [sogunmusire@gmail.com](mailto:sogunmusire@gmail.com)

---

## 📄 License

Distributed under the GNU General Public License. See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Clerk](https://clerk.dev/) - Authentication made simple
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [MoviePy](https://zulko.github.io/moviepy/) - Video editing library
- All the amazing open-source projects that make this possible

---

<div align="center">
  
  **Built with ❤️ by Theideabased**
  
  [GitHub](https://github.com/Theideabased) • [Email](mailto:sogunmusire@gmail.com)

</div>