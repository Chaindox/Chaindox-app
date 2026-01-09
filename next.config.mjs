/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Suppress warnings for optional native modules and dynamic requires
    config.ignoreWarnings = [
      /Module not found: Can't resolve 'rdf-canonize-native'/,
      /Module not found: Can't resolve 'canvas'/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Configure fallback for optional native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'rdf-canonize-native': false,
      'canvas': false,
    };

    return config;
  },
}

export default nextConfig
