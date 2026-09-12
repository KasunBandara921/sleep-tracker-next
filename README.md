# 🌙 Sleep Tracker

An AI-powered sleep tracking and analytics web application built with **Next.js 16**, **React 19**, **Prisma**, **Neon PostgreSQL**, **Clerk Authentication**, and **Groq AI**.

---

## ✨ Features

- **📊 Comprehensive Sleep Analytics**:
  - Track daily sleep duration and sleep quality tags/notes.
  - View real-time average sleep duration, best & worst nights, and cumulative sleep debt.
  - Interactive sleep history charts powered by **Chart.js** & **react-chartjs-2**.
- **🤖 AI Sleep Coach & Insights**:
  - Powered by **Groq API** for fast, context-aware analysis of your sleep logs.
  - Generates personalized recommendations and sleep pattern breakdowns.
  - Interactive Q&A: Ask questions directly to your AI Sleep Coach about your sleep habits.
- **🔐 Secure Authentication**:
  - Seamless authentication and user management with **Clerk**.
  - User-isolated sleep logs and personal dashboard.
- **🎨 Modern UI/UX**:
  - Responsive design styled with **Tailwind CSS v4**.
  - Fast server actions and dynamic client components.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **Database & ORM**: [Neon PostgreSQL](https://neon.tech/) with [Prisma ORM 7](https://www.prisma.io/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **AI Integration**: [Groq Cloud API](https://groq.com/)

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v20+ recommended
- **npm**, **pnpm**, or **yarn**
- Accounts for **Clerk**, **Neon**, and **Groq**

---

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/sleep-tracker.git
cd sleep-tracker
npm install
```

---

### 3. Environment Setup

Create a `.env` file in the root directory and add the following keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Groq AI
GROQ_API_KEY=gsk_...
```

---

### 4. Database Setup

Generate the Prisma Client and sync your database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

---

### 5. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
├── app/
│   ├── actions/             # Server actions (CRUD records, AI insights)
│   ├── insight/             # AI Sleep Coach page
│   ├── sign-in/ & sign-up/  # Clerk auth pages
│   ├── layout.tsx           # App shell with ClerkProvider & Navbar
│   └── page.tsx             # Main dashboard
├── components/              # UI & Chart components
│   ├── AISleepInsights.tsx  # Interactive AI coach component
│   ├── AddNewRecord.tsx     # Form to log sleep entries
│   ├── BarChart.tsx         # Chart.js visualization
│   └── ...
├── lib/
│   ├── db.ts                # Prisma client instance
│   └── checkUser.ts         # Clerk user sync with database
├── prisma/
│   └── schema.prisma        # Prisma database schema
└── types/                   # TypeScript interfaces
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production bundle.
- `npm run start`: Runs the production server.
- `npm run lint`: Runs ESLint checks.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
