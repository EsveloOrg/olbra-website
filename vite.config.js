import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // English pages
        main: resolve(__dirname, 'index.html'),
        stablecoins: resolve(__dirname, 'stablecoins.html'),
        token: resolve(__dirname, 'token.html'),
        services: resolve(__dirname, 'services.html'),
        payments: resolve(__dirname, 'payments.html'),
        faq: resolve(__dirname, 'faq.html'),
        blog: resolve(__dirname, 'blog.html'),
        'blog-introducing-plny': resolve(__dirname, 'blog/introducing-plny.html'),
        'blog-plny-reserve-model': resolve(__dirname, 'blog/plny-reserve-model.html'),
        'blog-olbra-tokenomics': resolve(__dirname, 'blog/olbra-tokenomics.html'),
        'blog-mica-compliance': resolve(__dirname, 'blog/mica-compliance.html'),
        'blog-defi-yield-strategies': resolve(__dirname, 'blog/defi-yield-strategies.html'),
        'blog-tokenizing-bonds': resolve(__dirname, 'blog/tokenizing-bonds.html'),
        'blog-security': resolve(__dirname, 'blog/security.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy.html'),
        docs: resolve(__dirname, 'docs.html'),
        'terms-of-service': resolve(__dirname, 'terms-of-service.html'),
        'cookie-policy': resolve(__dirname, 'cookie-policy.html'),
        compliance: resolve(__dirname, 'compliance.html'),
        'brand-assets': resolve(__dirname, 'brand-assets.html'),

        // Polish pages
        'pl-main': resolve(__dirname, 'pl/index.html'),
        'pl-stablecoins': resolve(__dirname, 'pl/stablecoins.html'),
        'pl-token': resolve(__dirname, 'pl/token.html'),
        'pl-services': resolve(__dirname, 'pl/services.html'),
        'pl-payments': resolve(__dirname, 'pl/payments.html'),
        'pl-faq': resolve(__dirname, 'pl/faq.html'),
        'pl-blog': resolve(__dirname, 'pl/blog.html'),
        'pl-blog-introducing-plny': resolve(__dirname, 'pl/blog/introducing-plny.html'),
        'pl-blog-plny-reserve-model': resolve(__dirname, 'pl/blog/plny-reserve-model.html'),
        'pl-blog-olbra-tokenomics': resolve(__dirname, 'pl/blog/olbra-tokenomics.html'),
        'pl-blog-mica-compliance': resolve(__dirname, 'pl/blog/mica-compliance.html'),
        'pl-blog-defi-yield-strategies': resolve(__dirname, 'pl/blog/defi-yield-strategies.html'),
        'pl-blog-tokenizing-bonds': resolve(__dirname, 'pl/blog/tokenizing-bonds.html'),
        'pl-blog-security': resolve(__dirname, 'pl/blog/security.html'),
        'pl-privacy-policy': resolve(__dirname, 'pl/privacy-policy.html'),
        'pl-docs': resolve(__dirname, 'pl/docs.html'),
        'pl-terms-of-service': resolve(__dirname, 'pl/terms-of-service.html'),
        'pl-cookie-policy': resolve(__dirname, 'pl/cookie-policy.html'),
        'pl-compliance': resolve(__dirname, 'pl/compliance.html'),
        'pl-brand-assets': resolve(__dirname, 'pl/brand-assets.html'),
      }
    }
  }
})
