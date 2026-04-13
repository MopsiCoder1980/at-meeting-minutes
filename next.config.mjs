import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
     serverExternalPackages: ['@react-pdf/renderer'],
     experimental: {
          serverActions: {
               bodySizeLimit: '20mb',
          },
     },
}

export default withNextIntl(nextConfig)
