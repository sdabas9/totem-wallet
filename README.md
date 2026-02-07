# Totem Wallet

Desktop wallet for the [Totems](https://github.com/sdabas9/totems) token standard on Antelope blockchains.

Built with Electron, React, and TypeScript. Includes an AI chat assistant that can execute blockchain actions via natural language.

## Features

- **Touch ID protection** — biometric authentication gates wallet access on launch; no auto-unlock
- **Lock / Unlock** — lock the wallet without logging out; unlock with Touch ID
- **Login** with private key, account name, and chain selection (Jungle4 Testnet / EOS Mainnet)
- **Transfer** totem tokens and EOS/system tokens to other accounts
- **Mint** tokens using mods from the marketplace
- **Burn** tokens
- **Balance management** — open and close balance rows
- **AI Chat** — natural language interface to transfer, mint, burn, and query the blockchain
- **Multi-provider AI** — supports Claude, OpenAI, Ollama (local), and Chutes
- **Duplicate transaction detection** — warns before re-executing identical write actions in a session

## Security

- Private keys never leave the Electron main process
- Keys are encrypted at rest using macOS Keychain via `safeStorage`
- macOS Touch ID required to decrypt and restore saved sessions
- The renderer communicates through IPC only — it never sees raw keys
- AI API keys are also encrypted and stored locally
- Duplicate transaction guard prevents accidental double-sends

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
    session-manager.ts  # Wharfkit session creation + lock/unlock
    blockchain.ts   # All blockchain read/write actions + duplicate detection
    ai-assistant.ts # Multi-provider AI + tool definitions
    store.ts        # Encrypted key storage + saved session check
    ipc-handlers.ts # IPC channel routing + Touch ID
  preload/        # Context bridge (renderer <-> main)
    preload.ts
  renderer/       # React UI
    App.tsx         # Router + layout + duplicate tx dialog
    components/     # Pages and shared components
    hooks/          # useWallet context + Touch ID flow
```

## Tech Stack

- **Electron** + Electron Forge + Vite
- **React 18** + React Router
- **Tailwind CSS**
- **@wharfkit/session** — Antelope blockchain interaction
- **@anthropic-ai/sdk** — Claude AI integration
- **openai** — OpenAI-compatible provider support (OpenAI, Chutes, Ollama)
- **electron-store** + `safeStorage` — encrypted local storage
- **systemPreferences.promptTouchID** — macOS biometric auth
