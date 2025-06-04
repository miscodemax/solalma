/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.sangse.shop', // change avec ton vrai domaine
  generateRobotsTxt: true,
  outDir: 'public',
  // Ce champ est crucial avec App Router :
  autoLastmod: true,
};
