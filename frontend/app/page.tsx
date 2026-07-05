import { serverFetch } from '@/lib/api/client';

interface NodeInfo {
  version: string;
  pubkey: string;
  chainHash: string;
  nodeName?: string | null;
}

interface ChannelHealthChannel {
  channelId: string;
  peerPubkey: string;
  state: string;
  outbound: string;
  inbound: string;
  capacity: string;
  inboundRatio: number;
}

interface ChannelHealth {
  source: 'live' | 'snapshot';
  stale: boolean;
  channels: ChannelHealthChannel[];
}

// Always fetch fresh from the node (source of truth) on each request.
export const dynamic = 'force-dynamic';

const card: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
};
const label: React.CSSProperties = {
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'var(--color-muted)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', wordBreak: 'break-all' };

export default async function Home() {
  const [info, health] = await Promise.all([
    serverFetch<NodeInfo>('node/info'),
    serverFetch<ChannelHealth>('channels/health'),
  ]);

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Fiber Liquidity Layer</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>
        Node operability dashboard — base
      </p>

      <section style={card}>
        <h2 style={label}>Node</h2>
        {info ? (
          <dl
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 16px',
            }}
          >
            <dt style={{ color: 'var(--color-muted)' }}>Version</dt>
            <dd>{info.version}</dd>
            <dt style={{ color: 'var(--color-muted)' }}>Pubkey</dt>
            <dd style={mono}>{info.pubkey}</dd>
            <dt style={{ color: 'var(--color-muted)' }}>Chain</dt>
            <dd style={mono}>{info.chainHash}</dd>
          </dl>
        ) : (
          <p style={{ marginTop: 12, color: 'var(--color-danger)' }}>
            Node unreachable — the backend or the FNN node is down.
          </p>
        )}
      </section>

      <section style={card}>
        <h2 style={label}>
          Channels{health ? ` · ${health.source}${health.stale ? ' (stale)' : ''}` : ''}
        </h2>
        {health && health.channels.length > 0 ? (
          <ul style={{ marginTop: 12, listStyle: 'none', display: 'grid', gap: 12, padding: 0 }}>
            {health.channels.map((c) => (
              <li key={c.channelId}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--color-muted)',
                  }}
                >
                  <span style={mono}>{c.peerPubkey.slice(0, 12)}…</span>
                  <span>{c.state}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    height: 10,
                    borderRadius: 6,
                    overflow: 'hidden',
                    marginTop: 4,
                    background: 'var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      width: `${(1 - c.inboundRatio) * 100}%`,
                      background: 'var(--color-outbound)',
                    }}
                    title={`outbound ${c.outbound}`}
                  />
                  <div
                    style={{ width: `${c.inboundRatio * 100}%`, background: 'var(--color-inbound)' }}
                    title={`inbound ${c.inbound}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 12, color: 'var(--color-muted)' }}>
            {health
              ? 'No channels yet. Fund the wallet + open a channel — see infra/README.md §3.'
              : 'Channel data unavailable.'}
          </p>
        )}
      </section>

      <p style={{ marginTop: 24, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
        Blue = outbound (local) · green = inbound (remote). Live per-channel bars land in Step 3.
      </p>
    </main>
  );
}
