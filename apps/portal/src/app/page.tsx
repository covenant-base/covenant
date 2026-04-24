import { covenantBrand } from '@covenant/config/brand';
import { MOCK_AGENTS, MOCK_TASKS, resolveBaseNetwork } from '@covenant/sdk';
import { ProtocolConsoleLanding } from '@/components/home/protocol-console-landing';

export default function HomePage() {
  const network = resolveBaseNetwork();

  return (
    <ProtocolConsoleLanding
      docsUrl={covenantBrand.docsUrl}
      networkName={network.name}
      activeAgents={MOCK_AGENTS.length}
      activeTasks={MOCK_TASKS.length}
      shortName={covenantBrand.shortName}
      tagline={covenantBrand.tagline}
      tokenSymbol={covenantBrand.token.symbol}
    />
  );
}
