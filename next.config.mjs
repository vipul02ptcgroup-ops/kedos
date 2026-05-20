/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid OneDrive reparse-point issues on the default `.next` directory.
  distDir: '.next-build',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default nextConfig;
