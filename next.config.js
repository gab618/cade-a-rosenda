const withSerwist = require("@serwist/next").default({
  swSrc: "service-worker.ts",
  swDest: "public/sw.js",
  register: true,
});

module.exports = withSerwist({});
