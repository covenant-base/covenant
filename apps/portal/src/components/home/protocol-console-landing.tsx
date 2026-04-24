'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProtocolConsoleScene } from '@/components/home/protocol-console-scene';

type ProtocolConsoleLandingProps = {
  docsUrl: string;
  networkName: string;
  activeAgents: number;
  activeTasks: number;
  shortName: string;
  tagline: string;
  tokenSymbol: string;
};

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

type LogEntry = {
  time: string;
  message: string;
  tone?: 'accent' | 'violet';
};

type TopologyRow = {
  label: string;
  value: string;
  tone?: 'cyan' | 'violet';
};

type HeuristicBar = {
  height: number;
  tone?: 'cyan' | 'violet';
};

const navItems: NavItem[] = [
  { href: '/protocol', label: 'Protocol' },
  { href: '/developers', label: 'Developers' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/docs', label: 'Docs', external: true },
];

const topologyRows: TopologyRow[] = [
  { label: 'NODE_0A', value: 'ACTIVE', tone: 'cyan' },
  { label: 'NODE_0B', value: 'STANDBY' },
  { label: 'NODE_0C', value: 'PROVING', tone: 'cyan' },
  { label: 'NODE_0D', value: 'SETTLING', tone: 'violet' },
  { label: 'NODE_0E', value: 'GOVERNING', tone: 'cyan' },
];

const heuristicBars: HeuristicBar[] = [
  { height: 38 },
  { height: 72, tone: 'cyan' },
  { height: 30 },
  { height: 92, tone: 'violet' },
  { height: 54 },
  { height: 100, tone: 'cyan' },
];

const protocolHash = '7fe7c9d44b3f6a3ff79a21cb0a6718d45b1f2e4685f1df1ee2f3db7c6b4d2aa1';

const logMessages = [
  { message: 'Evaluating on-chain proof quorum.', tone: 'accent' as const },
  { message: 'Routing treasury settlement window.' },
  { message: 'Node ping: 12ms across Base runtime.' },
  { message: 'Refreshing governance attestations.', tone: 'violet' as const },
  { message: 'Consensus verified for active shard.', tone: 'accent' as const },
  { message: 'Adjusting execution lattice for new agents.' },
];

const initialLogs: LogEntry[] = [
  { time: '04:12:01', message: 'Allocating memory buffers...' },
  { time: '04:12:02', message: 'Decrypting payload 0x8F9A...', tone: 'violet' },
  { time: '04:12:03', message: 'Consensus reached for proof set.', tone: 'accent' },
  { time: '04:12:04', message: 'Awaiting agent instruction...' },
];

function formatTwoDigits(value: number) {
  return value.toString().padStart(2, '0');
}

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(remainingSeconds)}`;
}

function formatTimestamp(date: Date) {
  return `${formatTwoDigits(date.getHours())}:${formatTwoDigits(date.getMinutes())}:${formatTwoDigits(date.getSeconds())}`;
}

export function ProtocolConsoleLanding({
  docsUrl,
  networkName,
  activeAgents,
  activeTasks,
  shortName,
  tagline,
  tokenSymbol,
}: ProtocolConsoleLandingProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [coordinates, setCoordinates] = useState({
    x: '14.908',
    y: '-4.332',
    z: '88.001',
  });
  const [entropy, setEntropy] = useState('0.99998412e-4');
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  useEffect(() => {
    const coordinateTimer = window.setInterval(() => {
      setCoordinates({
        x: (14.908 + (Math.random() - 0.5) * 0.018).toFixed(3),
        y: (-4.332 + (Math.random() - 0.5) * 0.018).toFixed(3),
        z: (88.001 + (Math.random() - 0.5) * 0.018).toFixed(3),
      });

      setEntropy((0.99998412e-4 + (Math.random() - 0.5) * 0.0000000012e-4).toExponential(8));
    }, 180);

    const uptimeTimer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    const logTimer = window.setInterval(() => {
      const nextMessage = logMessages[Math.floor(Math.random() * logMessages.length)] ?? {
        message: 'Consensus verified for active shard.',
        tone: 'accent' as const,
      };

      setLogs((current) => [
        ...current.slice(-4),
        {
          time: formatTimestamp(new Date()),
          message: nextMessage.message,
          tone: nextMessage.tone,
        },
      ]);
    }, 2400);

    return () => {
      window.clearInterval(coordinateTimer);
      window.clearInterval(uptimeTimer);
      window.clearInterval(logTimer);
    };
  }, []);

  return (
    <main className="protocol-console" aria-labelledby="protocol-console-title">
      <ProtocolConsoleScene />

      <div className="protocol-console__scanlines" aria-hidden="true" />

      <div className="protocol-console__frame" aria-hidden="true">
        <span className="protocol-console__frame-line protocol-console__frame-line--top" />
        <span className="protocol-console__frame-line protocol-console__frame-line--bottom" />
        <span className="protocol-console__frame-line protocol-console__frame-line--left" />
        <span className="protocol-console__frame-line protocol-console__frame-line--right" />
        <span className="protocol-console__crosshair protocol-console__crosshair--tl" />
        <span className="protocol-console__crosshair protocol-console__crosshair--tr" />
        <span className="protocol-console__crosshair protocol-console__crosshair--bl" />
        <span className="protocol-console__crosshair protocol-console__crosshair--br" />
      </div>

      <div className="protocol-console__ui">
        <header className="protocol-console__brand">
          <Link href="/" className="protocol-console__brand-lockup" aria-label={`${shortName} home`}>
            <Image src="/logomark.png" alt="" width={44} height={44} className="protocol-console__brand-mark" priority />
            <Image
              src="/logo-text.png"
              alt={shortName}
              width={220}
              height={32}
              className="protocol-console__brand-wordmark"
              priority
              unoptimized
            />
          </Link>

          <p className="protocol-console__subtitle">Agentic consensus protocol</p>

          <div className="protocol-console__data-block">
            <span className="protocol-console__data-label">Network status</span>
            <span className="protocol-console__data-value protocol-console__data-value--cyan">
              <span className="protocol-console__status-dot" aria-hidden="true" />
              {`SYNCHRONIZED [T-${formatElapsed(elapsedSeconds)}]`}
            </span>
          </div>
        </header>

        <nav className="protocol-console__nav" aria-label="Homepage navigation">
          {navItems.map((item) =>
            item.external ? (
              <a href={docsUrl} key={item.label} className="protocol-console__nav-link">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} key={item.label} className="protocol-console__nav-link">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <aside className="protocol-console__top-right" aria-label="Live coordinate telemetry">
          <div className="protocol-console__data-block protocol-console__data-block--align-end">
            <span className="protocol-console__data-label">Orbital position (v.3)</span>
            <span className="protocol-console__data-value">
              {`X: ${coordinates.x} Y: ${coordinates.y} Z: ${coordinates.z}`}
            </span>
          </div>

          <div className="protocol-console__data-block protocol-console__data-block--align-end">
            <span className="protocol-console__data-label">Quantum entropy</span>
            <span className="protocol-console__data-value protocol-console__data-value--violet">{entropy}</span>
          </div>
        </aside>

        <section className="protocol-console__rail protocol-console__rail--left" aria-label="Swarm telemetry">
          <div className="protocol-console__panel">
            <div className="protocol-console__data-block">
              <span className="protocol-console__data-label">{'// Swarm topology'}</span>
              <table className="protocol-console__table">
                <tbody>
                  {topologyRows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className={row.tone ? `protocol-console__table-value protocol-console__table-value--${row.tone}` : ''}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="protocol-console__data-block">
              <span className="protocol-console__data-label">{'// Heuristic engine'}</span>
              <div className="protocol-console__bar-chart" aria-hidden="true">
                {heuristicBars.map((bar, index) => (
                  <span
                    key={`${bar.height}-${index}`}
                    className={bar.tone ? `protocol-console__bar protocol-console__bar--${bar.tone}` : 'protocol-console__bar'}
                    style={{ '--bar-height': `${bar.height}%` } as CSSProperties}
                  />
                ))}
              </div>
            </div>

            <div className="protocol-console__meta-grid">
              <div className="protocol-console__meta-item">
                <span className="protocol-console__data-label">Active agents</span>
                <span className="protocol-console__data-value protocol-console__data-value--cyan">{activeAgents.toLocaleString()}</span>
              </div>

              <div className="protocol-console__meta-item">
                <span className="protocol-console__data-label">Live tasks</span>
                <span className="protocol-console__data-value">{activeTasks.toLocaleString()}</span>
              </div>

              <div className="protocol-console__meta-item">
                <span className="protocol-console__data-label">Treasury rail</span>
                <span className="protocol-console__data-value">{tokenSymbol}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="protocol-console__rail protocol-console__rail--right" aria-label="Protocol status">
          <div className="protocol-console__panel protocol-console__panel--right">
            <div className="protocol-console__data-block protocol-console__data-block--align-end">
              <span className="protocol-console__data-label">System log buffer</span>
              <div className="protocol-console__log">
                {logs.map((entry, index) => (
                  <div className="protocol-console__log-line" key={`${entry.time}-${index}`}>
                    <span className="protocol-console__log-time">[{entry.time}]</span>
                    <span
                      className={
                        entry.tone
                          ? `protocol-console__log-message protocol-console__log-message--${entry.tone}`
                          : 'protocol-console__log-message'
                      }
                    >
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="protocol-console__data-block protocol-console__data-block--align-end">
              <span className="protocol-console__data-label">Protocol hash</span>
              <span className="protocol-console__hash">{protocolHash}</span>
            </div>

            <div className="protocol-console__meta-grid protocol-console__meta-grid--stacked">
              <div className="protocol-console__meta-item">
                <span className="protocol-console__data-label">Settlement mesh</span>
                <span className="protocol-console__data-value">{networkName}</span>
              </div>

              <div className="protocol-console__meta-item">
                <span className="protocol-console__data-label">Runtime</span>
                <span className="protocol-console__data-value protocol-console__data-value--violet">Proof locked</span>
              </div>
            </div>
          </div>
        </section>

        <section className="protocol-console__bottom" aria-label="Primary call to action">
          <p className="protocol-console__eyebrow">Verifiable agent coordination</p>
          <h1 id="protocol-console-title" className="protocol-console__headline">
            Base-native agent infrastructure
          </h1>
          <p className="protocol-console__copy">{tagline}</p>

          <Link href="/protocol" className="protocol-console__cta">
            <span className="protocol-console__cta-bracket" aria-hidden="true">
              [
            </span>
            <span>Initiate sequence</span>
            <span className="protocol-console__cta-bracket" aria-hidden="true">
              ]
            </span>
            <svg className="protocol-console__cta-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3L8.057 0L20 12L8.057 24L5 21L14 12L5 3Z" />
            </svg>
          </Link>
        </section>
      </div>
    </main>
  );
}
