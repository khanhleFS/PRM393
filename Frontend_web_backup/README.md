# React + TypeScript + Tailwind Dashboard

A modern, fully-featured React application with TypeScript, Tailwind CSS, React Router, and shadcn/ui components.

## Features

✨ **Modern Tech Stack**
- React 18+ with TypeScript
- Vite for lightning-fast development
- Tailwind CSS for styling
- React Router for navigation
- shadcn/ui component library
- Lucide React for icons

🎨 **Pre-configured Components**
- Dashboard layout with sidebar navigation
- Example pages (Home, Dashboard)
- Ready-to-use shadcn/ui components

🚀 **Developer Experience**
- Hot Module Replacement (HMR)
- Type-safe component development
- Path aliases (@/components, @/lib, etc.)
- Ready for production builds

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
├── pages/
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── Home.tsx         # Home page
│   └── Dashboard.tsx    # Dashboard page
├── lib/
│   └── utils.ts         # Utility functions
├── hooks/
│   └── use-mobile.ts    # Custom hooks
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global Tailwind styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run linter (if configured)

## Adding Components

Add more shadcn/ui components:
```bash
npm exec shadcn@4.6.0 add [component-name]
```

Popular components to try:
- `button` - Interactive button component
- `input` - Text input field
- `dropdown-menu` - Dropdown menu
- `dialog` - Modal dialog
- `tabs` - Tab navigation
- `form` - Form builder utilities

See [shadcn/ui docs](https://ui.shadcn.com/docs) for all available components.

## Navigation

The application includes React Router setup with two example pages:

- **Home** (`/`) - Welcome page with project info
- **Dashboard** (`/dashboard`) - Example dashboard with cards

Add more routes by updating `src/App.tsx` and creating new page components in `src/pages/`.

## Configuration Files

- **`components.json`** - shadcn/ui configuration
- **`tailwind.config.js`** - Tailwind CSS customization
- **`vite.config.ts`** - Vite build configuration with path aliases
- **`tsconfig.json`** - TypeScript configuration with path aliases
- **`tsconfig.app.json`** - App-specific TypeScript settings

## Path Aliases

Import components with clean paths:
```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Production Build

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

## Customization

### Add a New Page

1. Create a new file in `src/pages/`:
```tsx
// src/pages/MyPage.tsx
export default function MyPage() {
  return <div>My Page</div>
}
```

2. Add a route in `src/App.tsx`:
```tsx
<Route path="/my-page" element={<MyPage />} />
```

3. Add navigation link in `src/pages/Layout.tsx`

### Customize Tailwind

Edit `tailwind.config.js` to customize colors, spacing, and more:
```js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

## Troubleshooting

**Port Already in Use**
```bash
npm run dev -- --port 3000
```

**Components Not Found**
Make sure path aliases are configured in:
- `tsconfig.json`
- `vite.config.ts`

**Styling Issues**
Ensure Tailwind CSS is properly configured in `tailwind.config.js` and imported in `src/index.css`.

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Vite Documentation](https://vite.dev)

## License

MIT

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
