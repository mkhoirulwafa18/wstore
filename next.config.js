/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "res.cloudinary.com"
        ]
    },
    headers: async () => {
        return [
          {
            source: '/api/:path*',
            headers: [
                {
                    key: 'Access-Control-Allow-Origin',
                    value: '*',
                },
            ],
          },
        ]
      },
    // rewrites: {
    //     source: '/api/:path*',
    //     destination: 'http://api.example.com/:path*',
    // },
}

module.exports = nextConfig
