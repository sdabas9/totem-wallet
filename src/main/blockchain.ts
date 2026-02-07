import { getSession } from './session-manager';
import { API } from '@wharfkit/session';

const TOTEMS_CONTRACT = 'totemstotems';
const MARKET_CONTRACT = 'modsmodsmods';

function requireSession() {
  const session = getSession();
  if (!session) throw new Error('No active session. Please log in first.');
  return session;
}

// ─── Write Actions ───

export async function transfer(to: string, quantity: string, memo: string) {
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
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function mint(mod: string, quantity: string, payment: string, memo: string) {
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
  return { transactionId: String(result.resolved?.transaction.id || '') };
}

export async function burn(quantity: string, memo: string) {
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
