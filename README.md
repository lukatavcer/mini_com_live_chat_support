# MiniCom - Live Chat Support

A real-time customer support chat prototype built with Next.js, React, Zustand, and Tailwind CSS.

## Project Overview

MiniCom demonstrates a two-sided live chat system:

- **Visitor App** (`/`) - A mock website with a floating chat widget in the bottom-right corner
- **Agent App** (`/agent`) - A support dashboard with an inbox and thread view

Messages sync in real time between tabs using the BroadcastChannel API. Open both pages in separate tabs to see the full experience.

## Architecture

```
src/
  app/
    page.tsx              # Visitor mock website
    agent/page.tsx        # Agent dashboard
    layout.tsx            # Root layout with metadata
    globals.css           # Global styles + animations
  lib/
    types.ts              # Data model (Thread, Message, Participant, etc.)
    store.ts              # Zustand store (all state + actions)
    transport.ts          # BroadcastChannel transport layer
    useTransportSync.ts   # Hook to sync transport events into store
    utils.ts              # Helpers (generateId, formatTime, debounce)
  components/
    visitor/
      ChatWidget.tsx      # Floating chat widget with open/close toggle
    agent/
      Inbox.tsx           # Conversation list with sort and unread counts
      ConversationItem.tsx# Single inbox row
      ThreadView.tsx      # Full conversation view with reply input
    shared/
      MessageBubble.tsx   # Reusable message bubble (used by both apps)
      TypingIndicator.tsx # Animated typing dots
      ErrorBoundary.tsx   # Error boundary with retry
      DarkModeToggle.tsx  # Dark/light mode toggle button
  __tests__/
    ui-interaction.test.tsx  # Chat widget open/close interaction
    state-transition.test.ts # Store state transitions (create, send, receive)
    edge-cases.test.ts       # Duplicate messages, missing threads, read receipts
```

## Data Flow

```
Visitor Tab                          Agent Tab
    |                                    |
    |-- sendMessage() ------------------>|
    |   (optimistic update)              |
    |   store.sendMessage()              |
    |       |                            |
    |   simulateSend()                   |
    |       |                            |
    |   BroadcastChannel.postMessage()   |
    |       |                            |
    |       +-----> useTransportSync --->|
    |               receiveMessage()     |
    |                                    |
    |<-- sendMessage() ------------------|
    |   (same flow, reversed)            |
```

## State Management: Zustand

**Why Zustand over Context:**

- **No provider nesting** - Zustand stores are external to the React tree, simplifying the component hierarchy
- **Selective re-renders** - Components subscribe to specific slices of state, avoiding unnecessary renders
- **Built-in persistence** - `persist` middleware handles localStorage serialization out of the box
- **Simpler testing** - Store can be tested independently of React components
- **Minimal boilerplate** - No reducers, action creators, or dispatch patterns needed

**Trade-offs:**
- Less familiar to developers who only know Context/Redux
- No built-in devtools (though zustand devtools middleware exists)
- Store is global — in a larger app, you might want to split into multiple stores

## Real-time Transport

Uses **BroadcastChannel API** to simulate real-time messaging between tabs:

- Zero-dependency, browser-native solution
- Works across same-origin tabs/windows
- No server required for the demo

Message delivery states: `sending` -> `sent` (with 10% simulated failure -> `failed` with retry)

## Key Features

- **Optimistic sending** - Messages appear immediately, status updates asynchronously
- **Out-of-order handling** - Messages sorted by sequence number, not arrival time
- **Duplicate prevention** - Messages with same ID are rejected
- **Retry on failure** - Failed messages can be retried with one click
- **Typing indicators** - Debounced (1s) to avoid flooding
- **Read receipts & unread counts** - Tracked per participant per thread
- **Persistence** - Threads survive page refresh via localStorage
- **Dark mode** - Toggle persisted across sessions
- **Notification badge** - Visual indicator when widget is closed
- **Error boundary** - Graceful error handling with retry button
- **Accessible** - ARIA labels, keyboard navigation, visible focus states
- **Responsive** - Tailwind-based responsive layout

## AI Usage

This project was built with the assistance of Claude (Anthropic's AI). AI was used for:

- **Architecture design** - Planning the component structure, data model, and transport layer
- **Full implementation** - Writing all components, store logic, transport, and tests
- **Code documentation** - Adding JSDoc comments and this README

All AI-generated code was reviewed for correctness, security, and adherence to the spec.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the visitor site, and [http://localhost:3000/agent](http://localhost:3000/agent) for the agent dashboard.

### Run Tests

```bash
npm test
```

## Improvements With More Time

- **WebSocket/SSE backend** - Replace BroadcastChannel with real server-side transport
- **Virtualized message list** - Use `react-window` for threads with 1000+ messages
- **File attachments** - Image/file upload support
- **Canned responses** - Quick-reply templates for agents
- **Multi-agent support** - Assign/transfer conversations between agents
- **Search** - Full-text search across conversations
- **Notification sounds** - Audio alerts for new messages
- **E2E tests** - Playwright tests for cross-tab messaging
- **Rate limiting** - Prevent spam/abuse on the visitor side
