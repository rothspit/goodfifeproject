#!/bin/bash

# 受注データインポートシステム デプロイスクリプト
# 使い方: bash deploy-order-import.sh

SERVER="root@210.131.222.152"
SSH_KEY="/home/user/uploaded_files/WIFEHP.pem"
SERVER_PATH="/var/www/goodfifeproject"

echo "🚀 受注データインポートシステムをデプロイします..."

# 1. バックエンドファイルをコピー
echo "📤 バックエンドファイルをコピー中..."
scp -i $SSH_KEY \
  server/src/controllers/orderImportController.ts \
  server/src/routes/orderImport.ts \
  $SERVER:$SERVER_PATH/server/src/ 2>&1 | grep -v "Connection closed" || true

scp -i $SSH_KEY \
  server/src/config/database.ts \
  $SERVER:$SERVER_PATH/server/src/config/ 2>&1 | grep -v "Connection closed" || true

# 2. フロントエンドファイルをコピー
echo "📤 フロントエンドファイルをコピー中..."
ssh -i $SSH_KEY $SERVER "mkdir -p $SERVER_PATH/client/app/admin/order-import" 2>&1 | grep -v "Connection closed" || true

scp -i $SSH_KEY \
  client/app/admin/order-import/page.tsx \
  $SERVER:$SERVER_PATH/client/app/admin/order-import/ 2>&1 | grep -v "Connection closed" || true

scp -i $SSH_KEY \
  client/app/admin/layout.tsx \
  $SERVER:$SERVER_PATH/client/app/admin/ 2>&1 | grep -v "Connection closed" || true

# 3. バックエンドをビルド＆再起動
echo "🔧 バックエンドをビルド中..."
ssh -i $SSH_KEY $SERVER "cd $SERVER_PATH/server && \
  NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 | tail -10 && \
  pm2 restart goodfife-backend && \
  echo '✅ バックエンド再起動完了'" 2>&1 | grep -v "Connection closed" || true

# 4. フロントエンドをビルド＆再起動
echo "🔧 フロントエンドをビルド中..."
ssh -i $SSH_KEY $SERVER "cd $SERVER_PATH/client && \
  npm run build 2>&1 | tail -10 && \
  pm2 restart goodfife-frontend && \
  echo '✅ フロントエンド再起動完了'" 2>&1 | grep -v "Connection closed" || true

# 5. ステータス確認
echo "📊 PM2 ステータス確認..."
ssh -i $SSH_KEY $SERVER "pm2 status" 2>&1 | grep -v "Connection closed" || true

echo ""
echo "✅ デプロイ完了！"
echo "🌐 管理画面: https://crm.h-mitsu.com/admin"
echo "📝 メニュー: 受注データインポート"
echo ""
echo "⚠️  注意: GOOGLE_API_KEY を .env に設定してください"
echo "   ssh -i $SSH_KEY $SERVER"
echo "   cd $SERVER_PATH/server"
echo "   nano .env"
echo "   # GOOGLE_API_KEY=your_api_key_here を追加"
echo "   pm2 restart goodfife-backend"
