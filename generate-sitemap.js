// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',          // homepage
  '/about',     // ex : si tu as une page about
  '/contact',   // idem
  '/profile',   // idem
  '/product',   // idem
  '/register',   // idem
  '/sgnin',   // idem
  '/dashboard/products',  // exemple de route custom
  '/dashboard/add',  // exemple de route custom
  // ajoute ici toutes les routes que tu veux référencer
];

const stream = new SitemapStream({ hostname: 'https://www.sangse.shop' });

const sitemap = streamToPromise(Readable.from(pages.map(p => ({ url: p, changefreq: 'weekly', priority: 0.7 }))).pipe(stream)).then(data => {
  fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), data.toString());
  console.log('✅ sitemap.xml généré dans /public');
});
