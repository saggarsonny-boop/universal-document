const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: [
    "node:crypto",
    "node:http",
    "node:https",
    "node:zlib",
    "node:worker_threads",
    "node:path",
    "node:fs",
    "node:os",
    "node:stream",
    "node:util",
    "node:url",
    "node:events",
    "node:buffer",
    "crypto",
    "http",
    "https",
    "zlib",
    "worker_threads",
    "path",
    "fs",
    "os",
    "stream",
    "util",
    "url",
    "events",
    "buffer"
  ],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
