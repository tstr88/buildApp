# buildApp Project Structure

## Overview
This document provides a detailed overview of the buildApp project structure and setup.

## Directory Structure

```
buildapp/
├── .git/                       # Git repository
├── .gitignore                  # Git ignore patterns
├── .prettierrc.json            # Prettier configuration (shared)
├── .prettierignore             # Prettier ignore patterns
├── package.json                # Root package.json with monorepo scripts
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md        # This file
│
├── backend/                    # Backend application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── database.ts    # PostgreSQL connection setup
│   │   ├── controllers/       # Route controllers (empty, ready for features)
│   │   ├── middleware/        # Express middleware (empty, ready for features)
│   │   ├── models/            # Database models (empty, ready for features)
│   │   ├── routes/            # API routes (empty, ready for features)
│   │   ├── services/          # Business logic (empty, ready for features)
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts       # Global type definitions
│   │   ├── utils/             # Utility functions
│   │   │   └── index.ts       # Helper functions
│   │   └── index.ts           # Application entry point
│   ├── .env.example           # Environment variables template
│   ├── eslint.config.js       # ESLint configuration
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration (strict mode)
│
└── frontend/                   # Frontend application
    ├── public/                # Public static files
    ├── src/
    │   ├── assets/            # Static assets
    │   │   └── fonts/         # Font files (prepared for local fonts)
    │   ├── components/        # Reusable components (empty, ready for features)
    │   ├── context/           # React Context providers (empty, ready for features)
    │   ├── hooks/             # Custom React hooks (empty, ready for features)
    │   ├── i18n/              # Internationalization
    │   │   ├── locales/       # Translation files
    │   │   │   ├── en.json    # English translations
    │   │   │   └── ka.json    # Georgian translations
    │   │   └── config.ts      # i18next configuration
    │   ├── pages/             # Page components (empty, ready for features)
    │   ├── services/          # API services
    │   │   └── api.ts         # API service class
    │   ├── types/             # TypeScript types
    │   │   └── index.ts       # Global type definitions
    │   ├── utils/             # Utility functions
    │   │   └── index.ts       # Helper functions
    │   ├── App.tsx            # Main App component
    │   ├── main.tsx           # Application entry point
    │   └── index.css          # Global styles with Tailwind
    ├── .env.example           # Environment variables template
    ├── eslint.config.js       # ESLint configuration
    ├── postcss.config.js      # PostCSS configuration
    ├── tailwind.config.js     # Tailwind CSS configuration
    ├── vite.config.ts         # Vite configuration
    ├── package.json           # Frontend dependencies
    └── tsconfig.json          # TypeScript configuration (strict mode)
```

## Key Files Created

### Root Level
- **.gitignore**: Comprehensive ignore patterns for node_modules, env files, build outputs
- **.prettierrc.json**: Shared code formatting configuration
- **package.json**: Monorepo management scripts
- **README.md**: Complete setup and usage documentation

### Backend
- **src/index.ts**: Express server setup with CORS and health check endpoint
- **src/config/database.ts**: PostgreSQL connection pool configuration
- **src/types/index.ts**: Shared TypeScript interfaces
- **src/utils/index.ts**: Utility functions (response helpers, validation)
- **.env.example**: All required environment variables with descriptions
- **tsconfig.json**: Strict TypeScript configuration
- **eslint.config.js**: ESLint rules with TypeScript and Prettier

### Frontend
- **src/main.tsx**: React application entry point
- **src/index.css**: Tailwind CSS with FiraGO font imports
- **src/i18n/config.ts**: i18next setup for Georgian and English
- **src/i18n/locales/ka.json**: Georgian translations
- **src/i18n/locales/en.json**: English translations
- **src/services/api.ts**: Type-safe API client
- **src/types/index.ts**: Shared TypeScript interfaces
- **src/utils/index.ts**: Utility functions (formatting, validation)
- **tailwind.config.js**: Custom color palette and Georgian font
- **vite.config.ts**: Vite build configuration
- **.env.example**: Frontend environment variables

## Technology Stack Summary

### Frontend
- React 19 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS with custom design system
- React Router DOM for routing
- i18next for internationalization (Georgian/English)
- FiraGO font for Georgian language support
- ESLint + Prettier for code quality

### Backend
- Node.js with TypeScript
- Express framework
- PostgreSQL database with native pg client
- CORS enabled for cross-origin requests
- Environment-based configuration
- ESLint + Prettier for code quality

### Development Tools
- TypeScript strict mode enabled everywhere
- ESLint configured for both projects
- Prettier for consistent code formatting
- Git repository initialized
- Comprehensive .gitignore

## Design System

### Colors (Tailwind)
```css
charcoal: #121212           /* Primary dark */
concrete-light: #F2F2F2     /* Light background */
concrete: #E6E6E6           /* Default gray */
graphite: #222222           /* Secondary dark */
success: #2E7D32            /* Success states */
caution: #F5A300            /* Warning states */
action: #2563EB             /* Primary actions */
```

### Typography
- **Font**: FiraGO (loaded via CDN)
- **Weights**: 400, 500, 600, 700
- **Language Support**: Georgian and Latin scripts

## Next Steps

The scaffolding is complete. Next phases should include:

1. **Database Schema**: Create PostgreSQL tables and migrations
2. **Authentication**: JWT-based auth system
3. **API Endpoints**: RESTful API for marketplace features
4. **Frontend Components**: Reusable UI components
5. **Pages**: Home, Products, Auth, Profile, etc.
6. **State Management**: Context or Redux for complex state
7. **Testing**: Jest/Vitest + React Testing Library
8. **Deployment**: Docker configuration and CI/CD

## Available Commands

### Root Level
```bash
npm run install:all        # Install all dependencies
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run build:backend      # Build backend
npm run build:frontend     # Build frontend
npm run lint:backend       # Lint backend code
npm run lint:frontend      # Lint frontend code
npm run format:all         # Format all code
```

### Backend (in backend/)
```bash
npm run dev                # Start with hot reload
npm run build              # Compile TypeScript
npm start                  # Run production build
npm run lint               # Check code
npm run lint:fix           # Fix linting issues
npm run format             # Format code
```

### Frontend (in frontend/)
```bash
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Check code
npm run lint:fix           # Fix linting issues
npm run format             # Format code
```

## Configuration Files

### TypeScript
- Strict mode enabled in both projects
- Consistent compiler options
- Path aliases can be added as needed

### ESLint
- TypeScript rules enabled
- React hooks rules (frontend)
- Prettier integration
- Custom rules for unused vars, explicit any, etc.

### Prettier
- Single quotes
- 2-space indentation
- Semicolons required
- 100 character line width
- Trailing commas (ES5)

## Environment Variables

### Backend (.env)
- PORT, NODE_ENV
- Database connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- CORS origins
- JWT secret and expiry
- File upload configuration

### Frontend (.env)
- VITE_API_BASE_URL
- VITE_APP_NAME
- VITE_DEFAULT_LANGUAGE

## Notes

- All dependencies are installed
- Git repository initialized
- No features implemented yet - pure scaffolding
- Ready for feature development
- Mobile-first responsive design ready with Tailwind
- Bilingual support configured and ready to use
