#!/bin/bash
# 人妻の蜜 - 本番環境デプロイスクリプト
# 使用方法: ssh root@210.131.222.152 'bash -s' < deploy.sh

set -e

echo "========================================="
echo "🚀 人妻の蜜 デプロイ開始"
echo "========================================="

cd /var/www/goodfifeproject

echo "📥 最新コードを取得中..."
git fetch origin
git reset --hard origin/genspark_ai_developer

echo "⚙️  フロントエンド環境変数を設定中..."
cd client
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://210.131.222.152:5000/api
NEXT_PUBLIC_SOCKET_URL=http://210.131.222.152:5000
ENVEOF

echo "🧹 ビルドキャッシュをクリア中..."
rm -rf .next
rm -rf node_modules/.cache

echo "📦 依存関係をインストール中..."
npm install

echo "🔨 フロントエンドをビルド中..."
npm run build

echo "♻️  PM2プロセスを再起動中..."
pm2 delete goodfife-frontend 2>/dev/null || true
pm2 start npm --name "goodfife-frontend" -- start

cd ../server
echo "🔄 バックエンドを再起動中..."
npm install
pm2 restart goodfife-backend

cd /var/www/goodfifeproject
echo "🗄️  データベースマイグレーション実行中..."
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_admin_user.sql 2>/dev/null || echo "管理者アカウントは既に存在します"
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_customer_management_tables.sql 2>/dev/null || echo "顧客管理テーブルは既に存在します"

echo ""
echo "========================================="
echo "✅ デプロイ完了！"
echo "========================================="
echo ""
echo "📍 管理画面URL: http://210.131.222.152:3000/admin/login"
echo "🔐 電話番号: 09000000000"
echo "🔑 パスワード: admin123"
echo ""
echo "🔍 PM2ステータス:"
pm2 status

echo ""
echo "💡 ブラウザで Ctrl+Shift+R を押してキャッシュをクリアしてください"
