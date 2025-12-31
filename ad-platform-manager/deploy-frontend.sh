#!/bin/bash
set -e

echo "🚀 フロントエンドデプロイスクリプト"
echo "================================"

SERVER="162.43.91.102"
DEPLOY_PATH="/root/ad-platform-manager"

echo "📦 1. フロントエンドのビルド..."
cd frontend
npm run build

echo "📤 2. ビルド済みファイルをサーバーへ転送..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  ./ root@${SERVER}:${DEPLOY_PATH}/frontend/

echo "📦 3. サーバー側で依存パッケージをインストール..."
ssh root@${SERVER} "cd ${DEPLOY_PATH}/frontend && npm install --production"

echo "🔄 4. PM2設定を更新..."
ssh root@${SERVER} "cat > ${DEPLOY_PATH}/ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'ad-platform-backend',
      cwd: '${DEPLOY_PATH}/backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5010
      },
      error_file: '${DEPLOY_PATH}/logs/backend-error.log',
      out_file: '${DEPLOY_PATH}/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'ad-platform-frontend',
      cwd: '${DEPLOY_PATH}/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3010',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      error_file: '${DEPLOY_PATH}/logs/frontend-error.log',
      out_file: '${DEPLOY_PATH}/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOFPM2
"

echo "🔄 5. PM2でフロントエンドを起動..."
ssh root@${SERVER} "cd ${DEPLOY_PATH} && pm2 start ecosystem.config.js --only ad-platform-frontend && pm2 save"

echo "🔧 6. Nginx設定を更新（プロキシ設定）..."
ssh root@${SERVER} "cat > /etc/nginx/conf.d/crm.h-mitsu.com.conf << 'EOFNGINX'
# CRM管理画面 - crm.h-mitsu.com
server {
    server_name crm.h-mitsu.com;

    # フロントエンド（Next.js）へのプロキシ
    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }

    # バックエンドAPIへのプロキシ
    location /api/ {
        proxy_pass http://localhost:5010/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    # ヘルスチェック
    location /health {
        proxy_pass http://localhost:5010/health;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/crm.h-mitsu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.h-mitsu.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if (\\\$host = crm.h-mitsu.com) {
        return 301 https://\\\$host\\\$request_uri;
    }

    listen 80;
    server_name crm.h-mitsu.com;
    return 404;
}
EOFNGINX

nginx -t && systemctl reload nginx"

echo "✅ デプロイ完了！"
echo "🌐 https://crm.h-mitsu.com でアクセス可能です"
