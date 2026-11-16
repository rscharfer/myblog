const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

// `next dev` writes to .next-dev so `npm run build` (which writes .next) can't corrupt a running dev server.
module.exports = (phase) => ({
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
})
