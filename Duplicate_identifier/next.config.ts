import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-side app: build a static site into the out/ folder.
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
