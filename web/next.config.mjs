import path from 'path';

const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../'),
  transpilePackages: ['@codeascend/auth', '@codeascend/analytics'],
  async rewrites() {
    return {
      fallback: [
        // why: fallback runs after filesystem routes (including dynamic [...nextauth]), ensuring NextAuth catches /api/auth first, leaving unmatched /api/* for proxy
        {
          source: '/api/:path*',
          destination: process.env.API_INTERNAL_URL 
            ? `${process.env.API_INTERNAL_URL}/:path*` 
            : 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
};

export default nextConfig;
