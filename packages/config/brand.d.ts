export interface CovenantBrandMetadata {
  name: string;
  shortName: string;
  slug: string;
  npmScope: string;
  tagline: string;
  networkTagline: string;
  siteUrl: string;
  portalUrl: string;
  docsUrl: string;
  analyticsUrl: string;
  repoUrl: string;
  securityEmail: string;
  socialHandle: string;
  cookies: {
    session: string;
    nonce: string;
  };
  token: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const covenantBrand: Readonly<CovenantBrandMetadata>;
export function resolveSiteUrl(input?: string): string;
export function resolveBrandMetadata(overrides?: Partial<CovenantBrandMetadata>): CovenantBrandMetadata;
