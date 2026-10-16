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

# cPanel's Node.js apps don't keep a server log, so write errors to
# app-error.log next to server.js.
cat - deploy/server.js > deploy/server.tmp.js <<'LOG'
const fs = require('fs'); const errLog = fs.createWriteStream(__dirname + '/app-error.log', { flags: 'a' });
for (const level of ['error', 'warn']) { const orig = console[level]; console[level] = (...args) => { errLog.write(new Date().toISOString() + ' ' + level.toUpperCase() + ' ' + args.map((a) => (a && a.stack) || (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n'); orig(...args); }; }
process.on('uncaughtException', (e) => { errLog.write(new Date().toISOString() + ' CRASH ' + e.stack + '\n', () => process.exit(1)); });
LOG
mv deploy/server.tmp.js deploy/server.js

# Secrets and local data are configured on the server instead.
rm -rf deploy/.env* deploy/storage deploy/private

(cd deploy && zip -qr ../miniature-cpanel.zip .)
echo "Created miniature-cpanel.zip ($(du -h miniature-cpanel.zip | cut -f1))"
