/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Vercel on the default `.next` output directory.
  // Use a custom local dir to avoid OneDrive reparse-point issues on Windows.
  // Allow rotating the dir if one gets locked/corrupted by sync tooling.
  ...(process.env.VERCEL ? {} : { distDir: process.env.NEXT_DIST_DIR || '.next-dev' }),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default nextConfig;
