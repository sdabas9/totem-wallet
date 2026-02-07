# Totem Wallet

Desktop wallet for the [Totems](https://github.com/sdabas9/totems) token standard on Antelope blockchains.

Built with Electron, React, and TypeScript. Includes an AI chat assistant powered by Claude that can execute blockchain actions via natural language.

## Features

- **Login** with private key, account name, and chain selection (Jungle4 Testnet / EOS Mainnet)
- **Transfer** totem tokens to other accounts
- **Mint** tokens using mods from the marketplace
- **Burn** tokens
- **Balance management** — open and close balance rows
- **AI Chat** — natural language interface to transfer, mint, and burn tokens via Claude

## Security

- Private keys never leave the Electron main process
- Keys are encrypted at rest using macOS Keychain via `safeStorage`
- The renderer communicates through IPC only — it never sees raw keys
- Claude API key is also encrypted and stored locally

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build macOS .dmg installer
npm run make
```

## Architecture

```
src/
  main/           # Electron main process (Node.js)
    index.ts        # App entry, window creation
    session-manager.ts  # Wharfkit session creation
    blockchain.ts   # All blockchain read/write actions
    ai-assistant.ts # Claude SDK + tool definitions
    store.ts        # Encrypted key storage
    ipc-handlers.ts # IPC channel routing
  preload/        # Context bridge (renderer ↔ main)
    preload.ts
  renderer/       # React UI
    App.tsx         # Router + layout
    components/     # Pages and shared components
    hooks/          # useWallet context
```

## Tech Stack

- **Electron** + Electron Forge + Vite
- **React 18** + React Router
- **Tailwind CSS**
- **@wharfkit/session** — Antelope blockchain interaction
- **@anthropic-ai/sdk** — Claude AI integration
- **electron-store** + `safeStorage` — encrypted local storage
