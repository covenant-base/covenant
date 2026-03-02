const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? (await import('@next/bundle-analyzer')).default({ enabled: true })
    : (/** @type {import('next').NextConfig} */ c) => c;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@covenant/sdk', '@covenant/sdk-ui'],
  experimental: {
    devtoolSegmentExplorer: false,
    optimizePackageImports: ['recharts'],
  },
};

export default withBundleAnalyzer(nextConfig);
