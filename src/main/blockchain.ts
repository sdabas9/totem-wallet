import { getSession } from './session-manager';
import { API } from '@wharfkit/session';
import { BrowserWindow, ipcMain } from 'electron';

const TOTEMS_CONTRACT = 'totemstotems';
const MARKET_CONTRACT = 'modsmodsmods';
const EOS_TOKEN_CONTRACT = 'eosio.token';

const executedTxKeys = new Set<string>();

function txKey(action: string, params: Record<string, string>): string {
  return `${action}:${JSON.stringify(params)}`;
}

async function checkDuplicate(action: string, params: Record<string, string>): Promise<void> {
  const key = txKey(action, params);
  if (!executedTxKeys.has(key)) return;

  const win = BrowserWindow.getFocusedWindow();
  if (!win) throw new Error('Duplicate transaction cancelled');

  const confirmed = await new Promise<boolean>((resolve) => {
    const handler = (_event: any, result: boolean) => {
      ipcMain.removeListener('respond-duplicate-tx', handler);
      resolve(result);
    };
    ipcMain.on('respond-duplicate-tx', handler);
    win.webContents.send('confirm-duplicate-tx', { action, params });
  });

  if (!confirmed) {
    throw new Error('Duplicate transaction cancelled by user');
  }
}

function recordTx(action: string, params: Record<string, string>): void {
  executedTxKeys.add(txKey(action, params));
}

export function clearTxLog(): void {
  executedTxKeys.clear();
}

function requireSession() {
  const session = getSession();
  if (!session) throw new Error('No active session. Please log in first.');
  return session;
}

// ─── Write Actions ───

export async function transfer(to: string, quantity: string, memo: string) {
  const params = { to, quantity, memo };
  await checkDuplicate('transfer', params);
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: TOTEMS_CONTRACT,
        name: 'transfer',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          from: session.actor.toString(),
          to,
          quantity,
          memo,
        },
      },
    ],
  });
  recordTx('transfer', params);
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function transferEosToken(to: string, quantity: string, memo: string) {
  const params = { to, quantity, memo };
  await checkDuplicate('transferEos', params);
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: EOS_TOKEN_CONTRACT,
        name: 'transfer',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          from: session.actor.toString(),
          to,
          quantity,
          memo,
        },
      },
    ],
  });
  recordTx('transferEos', params);
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function mint(mod: string, quantity: string, payment: string, memo: string) {
  const params = { mod, quantity, payment, memo };
  await checkDuplicate('mint', params);
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: TOTEMS_CONTRACT,
        name: 'mint',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          mod,
          minter: session.actor.toString(),
          quantity,
          payment,
          memo,
        },
      },
    ],
  });
  recordTx('mint', params);
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function burn(quantity: string, memo: string) {
  const params = { quantity, memo };
  await checkDuplicate('burn', params);
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: TOTEMS_CONTRACT,
        name: 'burn',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          quantity,
          memo,
        },
      },
    ],
  });
  recordTx('burn', params);
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function openBalance(ticker: string) {
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: TOTEMS_CONTRACT,
        name: 'open',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          ticker,
          ram_payer: session.actor.toString(),
        },
      },
    ],
  });
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function closeBalance(ticker: string) {
  const session = requireSession();
  const result = await session.transact({
    actions: [
      {
        account: TOTEMS_CONTRACT,
        name: 'close',
        authorization: [{ actor: session.actor, permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          ticker,
        },
      },
    ],
  });
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

// ─── Read-Only Queries ───

export async function getBalances(account?: string) {
  const session = requireSession();
  const targetAccount = account || session.actor.toString();

  const response = await session.client.v1.chain.get_table_rows({
    code: TOTEMS_CONTRACT,
    scope: targetAccount,
    table: 'accounts',
    limit: 100,
    json: true,
  });

  return response.rows.map((row: any) => ({
    balance: String(row.balance),
  }));
}

export async function getEosBalances(account?: string) {
  const session = requireSession();
  const targetAccount = account || session.actor.toString();

  const response = await session.client.v1.chain.get_table_rows({
    code: EOS_TOKEN_CONTRACT,
    scope: targetAccount,
    table: 'accounts',
    limit: 100,
    json: true,
  });

  return response.rows.map((row: any) => ({
    balance: String(row.balance),
  }));
}

export async function listTotems(limit: number = 20, cursor?: string) {
  const session = requireSession();

  const params: API.v1.GetTableRowsParams = {
    code: TOTEMS_CONTRACT,
    scope: TOTEMS_CONTRACT,
    table: 'totems',
    limit,
    json: true,
  };

  if (cursor) {
    params.lower_bound = cursor;
  }

  const response = await session.client.v1.chain.get_table_rows(params);

  return {
    rows: response.rows.map((row: any) => ({
      creator: String(row.creator),
      supply: String(row.supply),
      max_supply: String(row.max_supply),
      details: row.details,
      mods: row.mods,
      created_at: String(row.created_at),
    })),
    more: response.more,
    next_key: response.next_key ? String(response.next_key) : undefined,
  };
}

export async function getTotemStats(ticker?: string) {
  const session = requireSession();

  const params: API.v1.GetTableRowsParams = {
    code: TOTEMS_CONTRACT,
    scope: TOTEMS_CONTRACT,
    table: 'totemstats',
    limit: 100,
    json: true,
  };

  const response = await session.client.v1.chain.get_table_rows(params);

  return response.rows.map((row: any) => ({
    ticker: String(row.ticker),
    mints: Number(row.mints),
    burns: Number(row.burns),
    transfers: Number(row.transfers),
    holders: Number(row.holders),
  }));
}

export async function listMods(limit: number = 20, cursor?: string) {
  const session = requireSession();

  const params: API.v1.GetTableRowsParams = {
    code: MARKET_CONTRACT,
    scope: MARKET_CONTRACT,
    table: 'mods',
    limit,
    json: true,
  };

  if (cursor) {
    params.lower_bound = cursor;
  }

  const response = await session.client.v1.chain.get_table_rows(params);

  return {
    rows: response.rows.map((row: any) => ({
      contract: String(row.contract),
      seller: String(row.seller),
      price: Number(row.price),
      details: row.details,
      hooks: row.hooks?.map(String) || [],
      score: Number(row.score),
    })),
    more: response.more,
    next_key: response.next_key ? String(response.next_key) : undefined,
  };
}

export async function getFee() {
  const session = requireSession();

  const response = await session.client.v1.chain.get_table_rows({
    code: TOTEMS_CONTRACT,
    scope: TOTEMS_CONTRACT,
    table: 'feeconfig',
    limit: 1,
    json: true,
  });

  return response.rows.length > 0
    ? { fee: Number(response.rows[0].amount) }
    : { fee: 0 };
}

export async function getAccountInfo(account: string) {
  const session = requireSession();
  const info = await session.client.v1.chain.get_account(account);
  return {
    account_name: String(info.account_name),
    ram_quota: Number(info.ram_quota),
    ram_usage: Number(info.ram_usage),
    cpu_limit: {
      used: Number(info.cpu_limit.used),
      available: Number(info.cpu_limit.available),
      max: Number(info.cpu_limit.max),
    },
    net_limit: {
      used: Number(info.net_limit.used),
      available: Number(info.net_limit.available),
      max: Number(info.net_limit.max),
    },
    created: String(info.created),
  };
}

export async function checkAccountExists(account: string): Promise<{ exists: boolean; account?: string }> {
  const session = requireSession();
  try {
    await session.client.v1.chain.get_account(account);
    return { exists: true, account };
  } catch {
    return { exists: false, account };
  }
}

export async function getTransaction(txId: string) {
  const session = requireSession();
  try {
    const url = String(session.chain.url).replace(/\/$/, '');
    const response = await fetch(`${url}/v1/history/get_transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: txId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      id: data.id,
      block_num: data.block_num,
      block_time: data.block_time,
      status: data.trx?.receipt?.status || 'unknown',
      actions: data.trx?.trx?.actions?.map((a: any) => ({
        account: a.account,
        name: a.name,
        data: a.data,
      })) || [],
    };
  } catch (err: any) {
    return { error: `Could not fetch transaction: ${err.message}` };
  }
}

export async function getTopHolders(ticker: string, limit: number = 20) {
  const session = requireSession();
  const url = String(session.chain.url).replace(/\/$/, '');

  // Get all scopes (accounts) that have rows in the totem accounts table
  const scopeResponse = await fetch(`${url}/v1/chain/get_table_by_scope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: TOTEMS_CONTRACT,
      table: 'accounts',
      limit: 500,
    }),
  });

  if (!scopeResponse.ok) throw new Error('Failed to fetch table scopes');
  const scopeData = await scopeResponse.json();
  const scopes: string[] = scopeData.rows.map((r: any) => r.scope);

  // Query each account's balance for the specific token
  const holders: Array<{ account: string; amount: number; balance: string }> = [];

  // Query in batches of 10 to avoid overwhelming the node
  for (let i = 0; i < scopes.length; i += 10) {
    const batch = scopes.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async (account) => {
        try {
          const resp = await session.client.v1.chain.get_table_rows({
            code: TOTEMS_CONTRACT,
            scope: account,
            table: 'accounts',
            limit: 100,
            json: true,
          });
          for (const row of resp.rows) {
            const bal = String(row.balance);
            if (bal.endsWith(` ${ticker}`)) {
              const amount = parseFloat(bal.split(' ')[0]);
              if (amount > 0) {
                return { account, amount, balance: bal };
              }
            }
          }
        } catch {
          // skip unreachable accounts
        }
        return null;
      })
    );
    holders.push(...results.filter((r): r is NonNullable<typeof r> => r !== null));
  }

  holders.sort((a, b) => b.amount - a.amount);
  return holders.slice(0, limit);
}
