'use client';

import { useSession, useSiweSignIn, useSignOut } from '@covenant/sdk-ui';

export function AuthCard() {
  const session = useSession();
  const signIn = useSiweSignIn();
  const signOut = useSignOut();

  return (
    <div className="panel">
      <div style={{ color: 'var(--mute)' }}>Session</div>
      {session.data ? (
        <>
          <strong style={{ display: 'block', marginTop: 8 }}>{session.data.address}</strong>
          <p style={{ color: 'var(--mute)', marginTop: 8 }}>Expires {session.data.expiresAt}</p>
          <button className="btn-glitch" onClick={() => signOut.mutate()} type="button">
            <span className="btn-glitch__label" data-text="Sign Out">Sign Out</span>
          </button>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--mute)', marginTop: 8 }}>
            Connect an EVM wallet and sign a SIWE message to start a Covenant session.
          </p>
          <button className="btn-glitch" onClick={() => signIn.mutate()} type="button">
            <span className="btn-glitch__label" data-text="Sign In">Sign In With Wallet</span>
          </button>
          {signIn.error ? <p style={{ color: 'var(--danger)' }}>{signIn.error.message}</p> : null}
        </>
      )}
    </div>
  );
}
