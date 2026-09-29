const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_INTERNAL_URL 
          ? `${process.env.API_INTERNAL_URL}/:path*` 
          : 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
