
# Frontend - AttendanceHub

## Overview

AttendanceHub's frontend is built using React and Vite, providing a fast and modern user experience. It connects to the Encore backend via auto-generated TypeScript clients for seamless API integration.

## Technologies Used

- **React**: UI library for building interactive interfaces
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe development
- **Encore Client**: Auto-generated API client for backend communication

## Encore Integration

Encore generates TypeScript clients for backend APIs. The `encore-client.ts` file in the frontend imports these clients, allowing you to call backend endpoints directly from React components.

### Example Usage

```ts
import { attendance, employees } from './encore-client';

// Fetch attendance records
attendance.list_attendance().then(data => {
  // handle data
});
```

## How to Run

1. Install dependencies:

  ```sh
  npm install
  ```

2. Start the development server:

  ```sh
  npm run dev
  ```

## Project Structure

- `src/` - Main source code
- `public/` - Static assets
- `encore-client.ts` - Auto-generated Encore API client

## Customization

- Theme and date formatting options are configured in `src/config.ts`.
- UI components are in `src/components/`.

---
For more details on Encore, see the backend README.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
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
