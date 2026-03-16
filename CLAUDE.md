# mini_com_live_chat_support

A live chat support widget built with Next.js 16 (App Router). Two routes: `/` serves the visitor chat widget, `/agent` serves the agent dashboard. Cross-tab communication uses BroadcastChannel API with localStorage fallback.

## Commands

- `npm run dev` - Start dev server (Turbopack)
- `npm run build` - Production build
- `npm run lint` - ESLint (flat config, typescript-eslint + prettier)
- `npm run lint:fix` - ESLint with auto-fix
- `npm run format` - Prettier format all files
- `npm run format:check` - Check Prettier formatting
- `npm test` - Run Jest tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- path/to/file` - Run a single test file

## Stack

- Next.js 16 with App Router (no Pages Router)
- React 19, TypeScript (strict mode)
- Tailwind CSS 4 via @tailwindcss/postcss
- Zustand 5 for state management with localStorage persistence
- Jest + Testing Library for tests

## Architecture

Single shared Zustand store serves both visitor and agent apps. Cross-tab sync uses BroadcastChannel API with localStorage events as fallback. Path alias: `@/*` maps to `./src/*`.

## Structure

- `src/app/` - Next.js routes (visitor at `/`, agent at `/agent`)
- `src/components/agent/` - ConversationItem, Inbox, ThreadView
- `src/components/visitor/` - ChatWidget
- `src/components/shared/` - DarkModeToggle, ErrorBoundary, MessageBubble, TypingIndicator
- `src/lib/` - store, transport, types, hooks, utils

## Naming

- PascalCase for component files
- camelCase for utility/lib files
- Function components only (no class components)

## Styling

Tailwind CSS 4 -- no `tailwind.config.js`. Configuration is done in `src/app/globals.css` using CSS-native `@theme` and `@custom-variant` directives. Dark mode uses `@custom-variant` (see globals.css).

## Testing

- Use Jest with `@testing-library/react` for component tests
- Test config: `jest.config.js` with `ts-jest` transform and `jsdom` environment
- Setup file: `jest.setup.ts` (imports Testing Library matchers)
- TypeScript config for tests: `tsconfig.jest.json`
- Prefer `userEvent` over `fireEvent` for user interactions

## State Management

One shared Zustand store (`src/lib/store.ts`) manages all chat state for both visitor and agent views. State is persisted via `zustand/persist` to localStorage. Transport sync (`src/lib/useTransportSync.ts`) keeps tabs in sync via BroadcastChannel. Do not create separate stores for visitor and agent -- they share the same store.
