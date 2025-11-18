# Coaching Management System - Frontend

A modern, responsive web application for managing coaching sessions, user roles, payments, and performance metrics. Built with React, TypeScript, and Vite.

## 🎯 Overview

This is the frontend application for the Coaching Management System, designed to streamline session booking, coach/entrepreneur management, and performance tracking. It supports multiple user roles including Admin, Coach, Manager, and Entrepreneur.

## ✨ Features

- **Authentication & Authorization**
  - User login and registration
  - Role-Based Access Control (RBAC)
  - Protected routes based on user roles

- **Dashboard**
  - Role-specific dashboards (Admin, Coach, Manager, Entrepreneur)
  - Activity feeds and performance metrics
  - Goal overview and upcoming sessions
  - User and payments management tables

- **Session Management**
  - View all coaching sessions
  - Create new sessions
  - Edit existing sessions
  - Session details and history
  - Calendar view of sessions

- **Payment Management**
  - Track payments
  - View payment history
  - Payment status updates

- **Performance Metrics**
  - Statistics cards
  - Goal tracking
  - User performance overview

## 🛠️ Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5
- **Build Tool**: Vite 5.4.0
- **Routing**: TanStack Router 1.135.2
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **UI Components**: Radix UI + Shadcn UI
- **Styling**: Tailwind CSS 4.1.9
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mehdiAlouche/coaching-management-system-frontend.git
cd coaching-management-system-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API configuration:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run routes:generate`** - Generate route types with TanStack Router

## 📁 Project Structure

```
src/
├── components/
│   └── dashboard/          # Dashboard-specific components
│       ├── ActivityFeed.tsx
│       ├── GoalOverview.tsx
│       ├── PaymentsTable.tsx
│       ├── StatsCards.tsx
│       ├── UpcomingSessions.tsx
│       └── UsersTable.tsx
├── context/
│   └── AuthContext.tsx     # Authentication context
├── lib/
│   ├── api-client.ts       # Axios instance configuration
│   ├── api-endpoints.ts    # API endpoint constants
│   ├── queries.ts          # React Query hooks
│   └── rbac.ts             # Role-based access control utilities
├── pages/
│   ├── CalendarPage.tsx
│   ├── CreateSessionPage.tsx
│   ├── DashboardPage.tsx
│   ├── EditSessionPage.tsx
│   ├── SessionDetailsPage.tsx
│   └── SessionsPage.tsx
├── routes/
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Home/landing
│   ├── login.tsx
│   ├── register.tsx
│   ├── _authenticated.tsx  # Protected routes layout
│   ├── _authenticated.dashboard.tsx
│   ├── _authenticated.dashboard.*.tsx  # Role-specific dashboards
│   ├── _authenticated.sessions.*.tsx   # Session management routes
│   ├── _authenticated.calendar.tsx
│   └── routeTree.gen.ts    # Auto-generated route types
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app component
├── main.tsx                # Application entry point
└── vite-env.d.ts          # Vite type definitions
```

## 🔐 Authentication & Authorization

The application implements Role-Based Access Control (RBAC) with the following roles:

- **Admin** - Full system access and management
- **Coach** - Manage own sessions and client interactions
- **Manager** - Oversee coaches and sessions
- **Entrepreneur** - Book and manage personal coaching sessions

Protected routes are enforced through the authentication context and RBAC utilities.

## 🔗 API Integration

The frontend communicates with the backend API using Axios. API endpoints and configurations are centralized in:

- **`lib/api-client.ts`** - Axios instance setup
- **`lib/api-endpoints.ts`** - Endpoint constants
- **`lib/queries.ts`** - React Query hooks for data fetching

## 🎨 Styling

- Uses Tailwind CSS for utility-first styling
- Radix UI and Shadcn UI for accessible, unstyled components
- Consistent design system with theming support via next-themes

## 🧪 Code Quality

- ESLint for code linting
- TypeScript for type safety
- Vite for fast development and optimized builds

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- **Project Owner**: Mehdi idouallouche
- **Repository**: [coaching-management-system-frontend](https://github.com/mehdiAlouche/coaching-management-system-frontend)

## 📞 Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔧 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### Dependencies Issues

Clear node_modules and reinstall:

```bash
rm -r node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

Ensure your `.env.local` file is in the project root and variables are prefixed with `VITE_`.

