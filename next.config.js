const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
/** @type {import('next').NextConfig} */
module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // developement db should be used
    // this is just for the course
    return {
      env: { MONGODB: 'mongodb://localhost/events' }
    }
  }
  return {
    env: { MONGODB: 'mongodb://localhost/events' },
    reactStrictMode: true,
  }
}
