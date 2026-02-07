import Anthropic from '@anthropic-ai/sdk';
import { getSessionInfo } from './session-manager';
import * as blockchain from './blockchain';
import { loadClaudeApiKey, saveClaudeApiKey } from './store';
import { BrowserWindow } from 'electron';

let client: Anthropic | null = null;
let chatHistory: Array<{ role: string; content: string; toolCalls?: any[] }> = [];
let messages: Anthropic.MessageParam[] = [];

const tools: Anthropic.Tool[] = [
  {
    name: 'transfer_tokens',
    description: 'Transfer totem tokens to another account',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient account name (1-12 chars, a-z, 1-5, .)' },
        quantity: { type: 'string', description: 'Amount with precision and symbol, e.g. "10.0000 TEST"' },
        memo: { type: 'string', description: 'Optional memo for the transfer' },
      },
      required: ['to', 'quantity'],
    },
  },
  {
    name: 'mint_tokens',
    description: 'Mint totem tokens using a minter mod',
    input_schema: {
      type: 'object' as const,
      properties: {
        mod: { type: 'string', description: 'Minter mod contract account name' },
        quantity: { type: 'string', description: 'Amount to mint, e.g. "100.0000 TEST"' },
        payment: { type: 'string', description: 'Payment amount, e.g. "1.0000 EOS"' },
        memo: { type: 'string', description: 'Optional memo' },
      },
      required: ['mod', 'quantity', 'payment'],
    },
  },
  {
    name: 'burn_tokens',
    description: 'Burn totem tokens',
    input_schema: {
      type: 'object' as const,
      properties: {
        quantity: { type: 'string', description: 'Amount to burn, e.g. "10.0000 TEST"' },
        memo: { type: 'string', description: 'Optional memo' },
      },
      required: ['quantity'],
    },
  },
];

function getSystemPrompt(): string {
  const info = getSessionInfo();
  return `You are a helpful assistant for the Totems wallet on the ${info?.chainLabel || 'Antelope'} blockchain.
The user's account is "${info?.accountName || 'unknown'}".
The totems contract is "totemstotems" and the marketplace contract is "modsmodsmods".

You can help users:
- Transfer tokens to other accounts
- Mint new tokens using mods from the marketplace
- Burn tokens they own

You only have access to transfer, mint, and burn actions. All other actions are not available.

Token quantities must include precision and symbol (e.g., "10.0000 TEST").
Account names are 1-12 characters: a-z, 1-5, and periods.

Execute actions directly when the user requests them - do not ask for confirmation.`;
}

async function executeTool(
  toolName: string,
  input: Record<string, any>,
): Promise<string> {
  try {
    switch (toolName) {
      case 'transfer_tokens':
        return JSON.stringify(await blockchain.transfer(input.to, input.quantity, input.memo || ''));
      case 'mint_tokens':
        return JSON.stringify(await blockchain.mint(input.mod, input.quantity, input.payment, input.memo || ''));
      case 'burn_tokens':
        return JSON.stringify(await blockchain.burn(input.quantity, input.memo || ''));
      default:
        return JSON.stringify({ error: `Action not allowed: ${toolName}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message || String(err) });
  }
}

export function setApiKey(apiKey: string): void {
  saveClaudeApiKey(apiKey);
  client = new Anthropic({ apiKey });
}

export function initClient(): boolean {
  const apiKey = loadClaudeApiKey();
  if (apiKey) {
    client = new Anthropic({ apiKey });
    return true;
  }
  return false;
}

export function clearChat(): void {
  chatHistory = [];
  messages = [];
}

export function getChatHistory() {
  return chatHistory;
}

export async function sendMessage(userMessage: string, _win: BrowserWindow): Promise<string> {
  if (!client) {
    throw new Error('Claude API key not configured. Go to Settings to set it up.');
  }

  chatHistory.push({ role: 'user', content: userMessage });
  messages.push({ role: 'user', content: userMessage });

  let response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: getSystemPrompt(),
    tools,
    messages,
  });

  while (response.stop_reason === 'tool_use') {
    const assistantContent = response.content;
    messages.push({ role: 'assistant', content: assistantContent });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of assistantContent) {
      if (block.type === 'tool_use') {
        const result = await executeTool(block.name, block.input as Record<string, any>);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });

        chatHistory.push({
          role: 'assistant',
          content: '',
          toolCalls: [{
            name: block.name,
            input: block.input,
            result: JSON.parse(result),
          }],
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: getSystemPrompt(),
      tools,
      messages,
    });
  }

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  messages.push({ role: 'assistant', content: response.content });
  chatHistory.push({ role: 'assistant', content: textContent });

  return textContent;
}
