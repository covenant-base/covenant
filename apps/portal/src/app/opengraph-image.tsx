import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { covenantBrand } from '@covenant/config/brand';
import { resolveBaseNetwork } from '@covenant/sdk';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Covenant protocol console landing';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getPublicImageDataUrl(filename: string) {
  const image = await readFile(join(process.cwd(), 'public', filename));
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeType = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mimeType};base64,${image.toString('base64')}`;
}

export default async function Image() {
  const network = resolveBaseNetwork();
  const [logoSrc, wordmarkSrc, heroSrc] = await Promise.all([
    getPublicImageDataUrl('logomark.png'),
    getPublicImageDataUrl('logo-text.png'),
    getPublicImageDataUrl('covenant-hero.jpg'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#010103',
          backgroundImage: `linear-gradient(90deg, rgba(1,1,3,0.86) 0%, rgba(1,1,3,0.54) 38%, rgba(1,1,3,0.72) 100%), url(${heroSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#e0e5ff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 4px)',
            opacity: 0.3,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 34,
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(74,85,133,0.28)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 34,
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(74,85,133,0.28)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 34,
            width: 1,
            background: 'rgba(74,85,133,0.28)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 34,
            width: 1,
            background: 'rgba(74,85,133,0.28)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 68,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: 360,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <img src={logoSrc} width="46" height="46" alt="" />
            <img src={wordmarkSrc} width="238" height="34" alt={covenantBrand.shortName} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#00d1ff',
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 1,
                background: '#00d1ff',
              }}
            />
            Agentic consensus protocol
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span
              style={{
                color: 'rgba(126,139,198,0.88)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              Network status
            </span>
            <span
              style={{
                color: '#b9fcff',
                fontSize: 18,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              Synchronized [{network.name}]
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 70,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            alignItems: 'flex-end',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span
              style={{
                color: 'rgba(126,139,198,0.88)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              Orbital position (v.3)
            </span>
            <span style={{ fontSize: 18 }}>X: 14.908 Y: -4.332 Z: 88.001</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span
              style={{
                color: 'rgba(126,139,198,0.88)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              Quantum entropy
            </span>
            <span style={{ fontSize: 18, color: '#8ea0ff' }}>0.99998412e-4</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 260,
            height: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(-50%, -56%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 18,
              borderRadius: 26,
              border: '1px solid rgba(140, 226, 255, 0.22)',
              background:
                'linear-gradient(180deg, rgba(8,11,27,0.56), rgba(4,6,16,0.32)), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 42%)',
              boxShadow: '0 0 90px rgba(0,209,255,0.12)',
            }}
          />
          <img
            src={logoSrc}
            width="182"
            height="182"
            alt={covenantBrand.shortName}
            style={{
              position: 'relative',
              opacity: 0.88,
              filter: 'drop-shadow(0 0 28px rgba(0,209,255,0.16))',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 68,
            bottom: 72,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            width: 720,
          }}
        >
          <span
            style={{
              color: '#00d1ff',
              fontSize: 16,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            Verifiable agent coordination
          </span>
          <span
            style={{
              fontSize: 42,
              lineHeight: 1.1,
              maxWidth: 680,
            }}
          >
            {covenantBrand.tagline}
          </span>
          <span
            style={{
              fontSize: 22,
              lineHeight: 1.4,
              color: 'rgba(224,229,255,0.78)',
              maxWidth: 700,
            }}
          >
            {covenantBrand.networkTagline}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
