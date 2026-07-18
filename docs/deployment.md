# Ubuntu 24.04 VPS Deployment

Do not connect to the VPS unless credentials are provided.

## Install Packages

```bash
sudo apt update
sudo apt install -y git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## Deploy App

```bash
sudo mkdir -p /var/www/buddybin
sudo chown -R $USER:$USER /var/www/buddybin
git clone https://github.com/YOUR_ORG/YOUR_REPO.git /var/www/buddybin/current
cd /var/www/buddybin/current
npm install
cp .env.example .env.production
npm run hash:admin-pin -- 1722
nano .env.production
npm run lint
npm run typecheck
npm run test
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

## Nginx and SSL

```bash
sudo cp deploy/nginx/buddybin.conf /etc/nginx/sites-available/buddybin
sudo nano /etc/nginx/sites-available/buddybin
sudo ln -s /etc/nginx/sites-available/buddybin /etc/nginx/sites-enabled/buddybin
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.example -d www.your-domain.example
```

The production Next.js app runs on `localhost:3000`; Nginx reverse proxies HTTPS traffic to it.

## Updates and Logs

```bash
cd /var/www/buddybin/current
git pull
npm install
npm run build
pm2 restart buddybin
pm2 logs buddybin
sudo journalctl -u nginx --since "1 hour ago"
```

## Required External Credentials

- Supabase URL, anon key and service-role key
- Stripe secret key, webhook secret and Price IDs
- Resend API key and verified sender
- Strong `ADMIN_SESSION_SECRET`
- `ADMIN_PIN_HASH` generated from the launch PIN
