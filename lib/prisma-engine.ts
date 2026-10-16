import { existsSync } from "node:fs";
import path from "node:path";

// On CloudLinux/cPanel hosting, Prisma's own platform check can't see the OS and
// guesses an engine that isn't shipped ("debian-openssl-1.0.x"). Point Prisma at
// the bundled engine that matches the OpenSSL library actually installed instead.
export function selectQueryEngine() {
  if (process.env.NODE_ENV !== "production" || process.env.PRISMA_QUERY_ENGINE_LIBRARY) return;

  const engineDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
  const libDirs = ["/usr/lib64", "/lib64", "/usr/lib/x86_64-linux-gnu", "/lib/x86_64-linux-gnu", "/usr/lib", "/lib"];
  const hasLib = (name: string) => libDirs.some((dir) => existsSync(path.join(dir, name)));
  const distro = existsSync("/etc/debian_version") ? "debian" : "rhel";

  const candidates = [
    hasLib("libssl.so.3") && `${distro}-openssl-3.0.x`,
    hasLib("libssl.so.1.1") && `${distro}-openssl-1.1.x`,
    hasLib("libssl.so.10") && "rhel-openssl-1.0.x",
    // Nothing detected: fall back to the engines cPanel servers most often need.
    `${distro}-openssl-3.0.x`,
    `${distro}-openssl-1.1.x`,
  ].filter((target): target is string => Boolean(target));

  for (const target of candidates) {
    const engine = path.join(engineDir, `libquery_engine-${target}.so.node`);
    if (existsSync(engine)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = engine;
      console.info(`Prisma query engine: ${target}`);
      return;
    }
  }
}
