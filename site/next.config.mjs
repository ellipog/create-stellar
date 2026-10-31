/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // A directory of files and nothing else: no server, no runtime. Everything
  // the page shows is known at build time (data/stellar.json), and the only
  // live value, the Discord online count, is fetched by the browser.
  output: 'export',

  // Emit out/<route>/index.html so any static host serves it without rewrites.
  trailingSlash: true,

  // Required with output: 'export'; there is no server to run the optimiser.
  images: { unoptimized: true },

  devIndicators: false,

  // This folder is the project, whatever lockfiles sit further up the disk.
  turbopack: { root: import.meta.dirname },
};

export default config;
