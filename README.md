# buildApp

Georgia's premier construction materials marketplace - connecting buyers and suppliers across the country.

## Project Structure

```
buildapp/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # Node.js + Express + TypeScript backend
├── .prettierrc.json   # Shared Prettier configuration
└── .prettierignore    # Prettier ignore patterns
```

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with CSS-based configuration
- **Routing**: React Router DOM
- **Internationalization**: i18next (Georgian & English)
- **Font**: FiraGO (Georgian-optimized)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: pg (native PostgreSQL client)

### Code Quality
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Type Safety**: TypeScript strict mode enabled

## Design System

### Color Palette
- **Charcoal**: `#121212` - Primary dark color
- **Concrete Gray**: `#E6E6E6`, `#F2F2F2` - Neutral backgrounds
- **Graphite**: `#222222` - Secondary dark
- **Success Green**: `#2E7D32` - Success states
- **Caution Amber**: `#F5A300` - Warning states
- **Action Blue**: `#2563EB` - Primary actions

### Typography
- **Font Family**: FiraGO (supports Georgian and Latin scripts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Tailwind CSS v4 Configuration
This project uses Tailwind CSS v4 with the new CSS-based configuration. Custom theme variables are defined in `frontend/src/index.css` using the `@theme` directive:

```css
@theme {
  --color-charcoal: #121212;
  --color-concrete-light: #f2f2f2;
  --color-concrete: #e6e6e6;
  --color-graphite: #222222;
  --color-success: #2e7d32;
  --color-caution: #f5a300;
  --color-action: #2563eb;
  --font-firago: 'FiraGO', sans-serif;
}
```

Use these colors in your components:
```tsx
<div className="bg-[var(--color-charcoal)] text-[var(--color-concrete-light)]">
  Content
</div>
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd buildapp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb buildapp

# Or using psql
psql -U postgres
CREATE DATABASE buildapp;
```

### 3. Environment Configuration

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildapp
DB_USER=postgres
DB_PASSWORD=your_password_here

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
```

#### Frontend
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=buildApp
VITE_DEFAULT_LANGUAGE=ka
```

### 4. Run Development Servers

#### Backend
```bash
cd backend
npm run dev
```
Server will start on http://localhost:5000

#### Frontend
```bash
cd frontend
npm run dev
```
Application will start on http://localhost:5173

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Project Structure Details

### Backend Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (database, etc.)
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript (generated)
├── .env.example        # Environment variables template
├── eslint.config.js    # ESLint configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets (images, fonts)
│   ├── components/     # Reusable React components
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── i18n/           # Internationalization
│   │   ├── locales/    # Translation files (en.json, ka.json)
│   │   └── config.ts   # i18next configuration
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Public static files
├── .env.example        # Environment variables template
├── eslint.config.js    # ESLint configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── vite.config.ts      # Vite configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Language Support

The application supports bilingual content:

- **Georgian (KA)**: Default language
- **English (EN)**: Secondary language

Translation files are located in `frontend/src/i18n/locales/`.

To add new translations:

1. Add keys to both `en.json` and `ka.json`
2. Use the `useTranslation` hook in components:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('app.name')}</h1>;
}
```

## Code Quality Guidelines

### TypeScript
- Strict mode is enabled - all type errors must be resolved
- Use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` if type is truly unknown

### Formatting
- Code is automatically formatted with Prettier
- Run `npm run format` before committing
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required

### Linting
- ESLint is configured for both frontend and backend
- Run `npm run lint` to check for issues
- Most issues can be auto-fixed with `npm run lint:fix`

## Contributing

1. Follow the existing code structure and naming conventions
2. Run linting and formatting before committing
3. Write meaningful commit messages
4. Keep components small and focused
5. Add translations for both Georgian and English

## API Endpoints

The backend API will be available at `http://localhost:5000/api`

Health check endpoint:
```
GET /api/health
```

## Database Schema

Database migrations and schema documentation will be added as features are implemented.

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

---

**Note**: This is the initial scaffolding. Features and business logic will be implemented in subsequent phases.
