import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8788),
  HOST: z.string().default('0.0.0.0'),
  BROKER_SIGNING_KEY_HEX: z.string().optional(),
  BROKER_KEY_ROTATION_GRACE_SECS: z.coerce.number().int().positive().default(48 * 3600),
  IONET_API_URL: z.string().url().default('https://api.io.net/v1'),
  IONET_API_KEY: z.string().optional(),
  AKASH_RPC_URL: z.string().url().default('https://rpc.akash.network'),
  AKASH_WALLET: z.string().optional(),
  MIN_BOND_USD_MICRO: z.coerce.number().int().positive().default(10_000_000),
  MAX_BOND_DURATION_SECS: z.coerce.number().int().positive().default(14 * 24 * 3600),
});

export type Config = {
  port: number;
  host: string;
  signingKeyHex: string | undefined;
  rotationGraceSecs: number;
  ionetApiUrl: string;
  ionetApiKey: string | undefined;
  akashRpcUrl: string;
  akashWallet: string | undefined;
  minBondMicro: number;
  maxBondDurationSecs: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.parse(env);
  return {
    port: parsed.PORT,
    host: parsed.HOST,
    signingKeyHex: parsed.BROKER_SIGNING_KEY_HEX,
    rotationGraceSecs: parsed.BROKER_KEY_ROTATION_GRACE_SECS,
    ionetApiUrl: parsed.IONET_API_URL,
    ionetApiKey: parsed.IONET_API_KEY,
    akashRpcUrl: parsed.AKASH_RPC_URL,
    akashWallet: parsed.AKASH_WALLET,
    minBondMicro: parsed.MIN_BOND_USD_MICRO,
    maxBondDurationSecs: parsed.MAX_BOND_DURATION_SECS,
  };
}
