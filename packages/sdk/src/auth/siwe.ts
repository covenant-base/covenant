export interface SiweMessage {
  domain: string;
  address: `0x${string}`;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
  resources?: string[];
}

export function formatSiweMessage(message: SiweMessage): string {
  const resources = (message.resources ?? []).map((resource) => `- ${resource}`).join('\n');

  return [
    `${message.domain} wants you to sign in with your Ethereum account:`,
    message.address,
    '',
    message.statement,
    '',
    `URI: ${message.uri}`,
    `Version: ${message.version}`,
    `Chain ID: ${message.chainId}`,
    `Nonce: ${message.nonce}`,
    `Issued At: ${message.issuedAt}`,
    `Expiration Time: ${message.expirationTime}`,
    resources ? `Resources:\n${resources}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
