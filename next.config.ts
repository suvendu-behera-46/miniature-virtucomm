import path from "node:path";
import type { NextConfig } from "next";

// The parent folder has its own package-lock.json; pin the root to this app so
// Next doesn't treat the parent as the workspace when tracing the standalone build.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for cPanel / VPS hosting.
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  // The upload helpers read folders at runtime, which makes Next trace the whole
  // project; keep local-only files and old build output out of the bundle.
  outputFileTracingExcludes: {
    "*": ["deploy/**", "*.zip", "miniature/**", "storage/**", "private/**", "scripts/**", ".git/**", "*.md", "tsconfig.tsbuildinfo"],
  },
  turbopack: {
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
