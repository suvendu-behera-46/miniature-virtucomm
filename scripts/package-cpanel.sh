#!/usr/bin/env bash
# Builds the app and packages it as miniature-cpanel.zip for cPanel's
# "Setup Node.js App" (startup file: server.js). Run from the project root.
set -euo pipefail

# Remove the previous package first so the build doesn't trace it into the new one.
rm -rf deploy miniature-cpanel.zip

npx prisma generate
npx next build

mkdir -p deploy
cp -R .next/standalone/. deploy/
mkdir -p deploy/.next
cp -R .next/static deploy/.next/static
cp -R public deploy/public

# Ship the Prisma query engines for every target in schema.prisma, not just this machine's.
mkdir -p deploy/node_modules/.prisma/client
cp node_modules/.prisma/client/libquery_engine-* node_modules/.prisma/client/schema.prisma deploy/node_modules/.prisma/client/

# Secrets and local data are configured on the server instead.
rm -rf deploy/.env* deploy/storage deploy/private

(cd deploy && zip -qr ../miniature-cpanel.zip .)
echo "Created miniature-cpanel.zip ($(du -h miniature-cpanel.zip | cut -f1))"
