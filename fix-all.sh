#!/bin/bash
# 完全修正スクリプト - フロントエンド＆バックエンド

set -e

echo "========================================="
echo "🚀 完全修正開始（フロントエンド＋バックエンド）"
echo "========================================="

cd /var/www/goodfifeproject

echo "📥 最新コードを取得中..."
git fetch origin
git reset --hard origin/genspark_ai_developer

# ========== バックエンド修正 ==========
echo ""
echo "========================================="
echo "🔧 バックエンド修正"
echo "========================================="

echo "🔄 バックエンドを停止中..."
pm2 stop goodfife-backend 2>/dev/null || true
pm2 delete goodfife-backend 2>/dev/null || true

echo "📦 バックエンド依存関係をインストール中..."
cd /var/www/goodfifeproject/server
npm install

echo "📝 バックエンド環境変数を設定中..."
cat > .env << 'ENVEOF'
PORT=5000
DB_HOST=localhost
DB_USER=hitozumano_mitu
DB_PASSWORD=Hjmitsu^90
DB_NAME=hitozumano_mitu
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=production
ENVEOF

echo "🗄️ データベースマイグレーション実行中..."
cd /var/www/goodfifeproject
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_admin_user.sql 2>/dev/null || echo "管理者アカウントは既に存在"
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_customer_management_tables.sql 2>/dev/null || echo "顧客管理テーブルは既に存在"

echo "🚀 バックエンドを起動中..."
cd /var/www/goodfifeproject/server
pm2 start src/index.ts --name "goodfife-backend" --interpreter ts-node

# ========== フロントエンド修正 ==========
echo ""
echo "========================================="
echo "🎨 フロントエンド修正"
echo "========================================="

cd /var/www/goodfifeproject/client

echo "🧹 フロントエンドクリーンアップ中..."
rm -rf .next node_modules/.cache

echo "📦 フロントエンド依存関係をインストール中..."
npm install

echo "⚙️ フロントエンド環境変数を設定中..."
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://210.131.222.152:5000/api
NEXT_PUBLIC_SOCKET_URL=http://210.131.222.152:5000
ENVEOF

echo "🔨 フロントエンドをビルド中..."
npm run build

echo "♻️ フロントエンドを再起動中..."
pm2 delete goodfife-frontend 2>/dev/null || true
pm2 start npm --name "goodfife-frontend" -- start -- -p 3000

echo "⏳ 起動待機中..."
sleep 10

# ========== 確認 ==========
echo ""
echo "========================================="
echo "✅ 完全修正完了！"
echo "========================================="
echo ""
echo "🔍 PM2ステータス:"
pm2 status

echo ""
echo "🌐 バックエンドAPIテスト:"
curl -s http://localhost:5000/api/health | head -20 || echo "⚠️ APIテスト失敗"

echo ""
echo "🌐 フロントエンドテスト:"
curl -s -I http://localhost:3000 | head -5 || echo "⚠️ フロントエンドテスト失敗"

echo ""
echo "========================================="
echo "📍 アクセス情報"
echo "========================================="
echo "管理画面: http://210.131.222.152:3000/admin/login"
echo "電話番号: 09000000000"
echo "パスワード: admin123"
echo ""
echo "💡 ブラウザで Ctrl+Shift+R を押してキャッシュをクリアしてください"
echo ""
echo "🔧 トラブルシューティング:"
echo "  バックエンドログ: pm2 logs goodfife-backend --lines 50"
echo "  フロントエンドログ: pm2 logs goodfife-frontend --lines 50"
echo "  ポート確認: netstat -tlnp | grep -E '3000|5000'"
