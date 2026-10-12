# Going live: Neon database + cPanel hosting + GoDaddy domain

This guide takes the site from your computer to `https://muktiminiature.com`.
Replace `CPANEL_USER` with your cPanel username throughout.

How the pieces fit:

- **Neon** hosts the PostgreSQL database (products, orders, customers, settings).
- **cPanel** runs the website (a Node.js app) and stores uploaded images on its disk.
- **GoDaddy** only points your domain at the cPanel server.

Do the steps in order. Steps 1–3 happen on your computer; steps 4–9 in cPanel and GoDaddy.

---

## 1. Create the Neon database

1. Sign up at <https://neon.tech> and create a **project**.
   - Region: pick the one closest to your cPanel server (for India, **AWS Asia Pacific – Singapore**; if your hosting is in the US, pick a US region).
2. On the project dashboard click **Connect**. You need **two** connection strings:
   - **Pooled** (toggle *Connection pooling* **on**; the host contains `-pooler`) → this becomes `DATABASE_URL`.
   - **Direct** (toggle *Connection pooling* **off**) → this becomes `DIRECT_URL`.
3. Add these options to the end of each string (after `?sslmode=require`):
   - pooled: `&pgbouncer=true&connect_timeout=15`
   - direct: `&connect_timeout=15`

They look like:

```
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
```

Keep them private; they contain the database password.

## 2. Move your data into Neon (on your computer)

Make sure the local database is running (`cd ~/.local/miniature-pg && nohup node start.js > postgres.log 2>&1 &`), then in the project folder:

```bash
export PATH="$HOME/.local/node/bin:$PATH"

# 2a. Create the tables in Neon (use the DIRECT string for both)
DATABASE_URL="<direct string>" DIRECT_URL="<direct string>" npx prisma db push

# 2b. Copy everything (products, categories, settings, admin login, orders, …)
SOURCE_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/miniature?schema=public" \
TARGET_DATABASE_URL="<direct string>" \
npm run db:copy
```

The copy only runs into an **empty** database, so it can never overwrite live data.
(Starting fresh instead? Skip 2b and run `DATABASE_URL="<direct string>" DIRECT_URL="<direct string>" npm run seed`.)

Optional: to make your local development use Neon too, put the two strings into `.env` as `DATABASE_URL` and `DIRECT_URL`, then restart `npm run dev`.

## 3. Build the upload package (on your computer)

```bash
npm run package:cpanel
```

This creates **`miniature-cpanel.zip`** (~70 MB): the built site with everything it needs, including the database engine for Linux servers. It contains no passwords or uploaded files; those are set up on the server.

## 4. Check the cPanel requirements

In cPanel, open **Software → Setup Node.js App**.

- It must exist, and offer **Node.js 20.9 or newer** (choose 22 if offered).
- If it's missing, your plan can't run this site; ask your host to enable Node.js or use a small VPS instead.

## 5. Point the GoDaddy domain at cPanel

Skip this if the domain is already connected to this hosting account.

1. In cPanel, note the server **IP address** (right sidebar → *General Information* → *Shared IP Address*).
2. In GoDaddy → **My Products → your domain → DNS**:
   - Edit the **A** record with name `@` → value = the cPanel IP.
   - Make sure there is a **CNAME** record `www` → `@` (or `muktiminiature.com`).
   - Keep DNS at GoDaddy rather than switching the domain's **nameservers** to your host: the Resend email records (`resend._domainkey`, `send`, `_dmarc`) live in GoDaddy DNS, and switching nameservers would drop them and stop outgoing email.
3. In cPanel, make sure the domain is listed under **Domains** (as the main domain or an added domain).
4. DNS changes can take from a few minutes up to 24–48 hours.
5. Once the domain resolves, open **Security → SSL/TLS Status** and run **AutoSSL** so the site works on `https://`.

## 6. Upload the site

In cPanel **File Manager**, inside your home folder (`/home/CPANEL_USER`, **not** inside `public_html`):

1. Create these folders:
   - `miniature-app`: the website code
   - `miniature-data/media`: product and media images uploaded in the admin
   - `miniature-data/reference-uploads`: customer image submissions (private)
2. Open `miniature-app`, click **Upload**, and upload `miniature-cpanel.zip`.
3. Right-click the zip → **Extract** (into `miniature-app`). You should now see `server.js` directly inside `miniature-app`.
4. Delete the zip.

Keeping `miniature-data` outside `miniature-app` means future updates never delete uploaded images.

## 7. Create the Node.js app

**Setup Node.js App → Create Application**:

| Field | Value |
|---|---|
| Node.js version | 22.x (or the highest ≥ 20.9) |
| Application mode | Production |
| Application root | `miniature-app` |
| Application URL | `muktiminiature.com` |
| Application startup file | `server.js` |

Then add these **Environment variables** (button *Add Variable*), one by one:

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon **pooled** string (step 1) |
| `DIRECT_URL` | Neon **direct** string (step 1) |
| `NEXTAUTH_URL` | `https://muktiminiature.com` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXTAUTH_SECRET` | a new long random value: run `openssl rand -base64 32` on your computer |
| `AUTH_GOOGLE_ID` | from your Google OAuth client |
| `AUTH_GOOGLE_SECRET` | from your Google OAuth client |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | your Resend **API key** (`re_…`) |
| `MAIL_FROM` | `Mukti Miniature <noreply@muktiminiature.com>` |
| `REFERENCE_UPLOAD_EMAIL_TO` | `muktiminiature@gmail.com` |
| `MEDIA_STORAGE_DIR` | `/home/CPANEL_USER/miniature-data/media` |
| `REFERENCE_UPLOADS_DIR` | `/home/CPANEL_USER/miniature-data/reference-uploads` |

Optional: `INQUIRY_EMAIL_TO` (separate address for contact-form inquiries).

Click **Create** (or **Save**), then **Restart**.

**Do not** click *Run NPM Install*: everything the site needs is already inside the package.

## 8. Allow Google sign-in on the live domain

Google Cloud Console → **APIs & Services → Credentials** → your OAuth client:

- **Authorized JavaScript origins:** add `https://muktiminiature.com` (and `https://www.muktiminiature.com` if you use www).
- **Authorized redirect URIs:** add `https://muktiminiature.com/api/auth/callback/google`.
- If the OAuth consent screen is in **Testing**, either add test users or click **Publish app** so any customer can sign in.

## 9. Test the live site

- [ ] `https://muktiminiature.com` loads with products, categories, gallery
- [ ] `https://muktiminiature.com/admin/login` → sign in → dashboard shows your data
- [ ] **Change the admin password** (Admin → Settings → Change your password); the starting one is `admin123`
- [ ] Admin → Settings: check business details and the WhatsApp number
- [ ] Upload an image in Admin → Media library and see it on the page
- [ ] Home page → *Share by email*: verification code email arrives, submission email arrives with images
- [ ] Product page → *Connect on WhatsApp* opens the chat
- [ ] My account → Continue with Google works

---

## Updating the site later

1. Make changes on your computer and test with `npm run dev`.
2. If you changed `prisma/schema.prisma`, update Neon first:
   `DATABASE_URL="<direct>" DIRECT_URL="<direct>" npx prisma db push`
3. `npm run package:cpanel`
4. In File Manager, upload the new zip into `miniature-app` and **Extract**, choosing to overwrite.
5. Setup Node.js App → **Restart**.

Uploaded images and Neon data are untouched by updates.

## Backups

- **Database:** Neon keeps restore history (length depends on your plan). For an extra copy, you can run `npm run db:copy` from Neon into an empty local database.
- **Uploads:** periodically download `miniature-data` (File Manager → Compress → Download), or include it in cPanel's backup.

## Troubleshooting

| Problem | What to check |
|---|---|
| Site shows an error / 503 | `miniature-app/stderr.log` (or the log shown in Setup Node.js App). Check the Node version is ≥ 20.9 and all environment variables are set. Restart after any change. |
| "Query engine library … could not be found" | The log names the server's platform; add it to `binaryTargets` in `prisma/schema.prisma`, rebuild, and re-upload. |
| Can't connect to database | Check `DATABASE_URL`/`DIRECT_URL` were copied exactly, including `sslmode=require`. The first request after the database has been idle can take a few seconds while Neon wakes up. |
| Login goes back to the login page or to localhost | `NEXTAUTH_URL` must be exactly `https://muktiminiature.com`, and `AUTH_TRUST_HOST=true` must be set. |
| Google says `redirect_uri_mismatch` | Step 8: the redirect URI must match exactly, including `https`. |
| Verification / submission emails don't arrive | Check `SMTP_PASS` is a Gmail App Password. Some shared hosts (including GoDaddy) block outgoing connections to external mail servers; if so, create an email account in cPanel and use its SMTP settings (cPanel → *Email Accounts* → *Connect Devices*), or ask your host to allow SMTP. |
| Uploaded images don't show | `MEDIA_STORAGE_DIR` must point to an existing folder the app can write to. |
| App stops under load or won't start | Shared hosting limits memory and processes. If this keeps happening, move to a small VPS; the same package and Neon database work there unchanged. |
