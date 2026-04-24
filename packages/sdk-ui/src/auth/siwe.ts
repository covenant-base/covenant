'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EVM_ADDRESS_REGEX, formatSiweMessage, type SiweMessage } from '@covenant/sdk';
import { getJson } from '../http/json.js';

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
    };
  }
}

type Hex = `0x${string}`;

function isHex(value: string): value is Hex {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

function isEvmAddress(value: string): value is Hex {
  return EVM_ADDRESS_REGEX.test(value);
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error('Wallet did not return an account list');
  }
  return value;
}

async function ensureWalletAddress(): Promise<Hex> {
  if (!window.ethereum) {
    throw new Error('No injected wallet detected');
  }
  const accounts = parseStringArray(await window.ethereum.request({
    method: 'eth_requestAccounts',
  }));
  const first = accounts[0];
  if (!first || !isEvmAddress(first)) {
    throw new Error('Wallet did not return an EVM account');
  }
  return first;
}

async function signPersonalMessage(address: Hex, message: string): Promise<Hex> {
  if (!window.ethereum) {
    throw new Error('No injected wallet detected');
  }
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  });
  if (typeof signature !== 'string' || !isHex(signature)) {
    throw new Error('Wallet returned an invalid signature');
  }
  return signature;
}

async function requestNonce(address: Hex): Promise<{ message: SiweMessage }> {
  const payload = await getJson<{ message?: SiweMessage }>(
    '/api/auth/nonce',
    {
      method: 'POST',
      body: JSON.stringify({ address }),
    },
  );
  if (!payload.message) throw new Error('Failed to issue SIWE nonce');
  return { message: payload.message };
}

async function verifySignature(message: SiweMessage, signature: `0x${string}`) {
  await getJson('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ message, signature }),
  });
}

export function useSiweSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const address = await ensureWalletAddress();
      const { message } = await requestNonce(address);
      const signature = await signPersonalMessage(address, formatSiweMessage(message));
      await verifySignature(message, signature);
      return address;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['covenant', 'session'] });
    },
  });
}
