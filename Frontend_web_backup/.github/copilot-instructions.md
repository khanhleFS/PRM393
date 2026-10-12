# Copilot Instructions

This is a React + TypeScript project with Tailwind CSS, React Router, and shadcn/ui components.

## Project Structure

- `src/` - Source code
  - `components/ui/` - shadcn/ui components
  - `pages/` - Page components with routing
  - `lib/` - Utility functions
  - `hooks/` - Custom React hooks
  - `App.tsx` - Main application component with routing
  - `main.tsx` - Application entry point
  - `index.css` - Global styles (Tailwind)

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

## Adding Components

To add new shadcn/ui components:
```bash
npx shadcn@4.6.0 add [component-name]
```

## Technology Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Vite** - Build tool

## Key Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration with path aliases

## Available Routes

- `/` - Home page
- `/dashboard` - Dashboard page with example cards
