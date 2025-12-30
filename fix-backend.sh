#!/bin/bash
# バックエンド修正スクリプト

set -e

echo "========================================="
echo "🔧 バックエンド修正開始"
echo "========================================="

cd /var/www/goodfifeproject

echo "📥 最新コードを取得中..."
git fetch origin
git reset --hard origin/genspark_ai_developer

echo "🔄 バックエンドを停止中..."
pm2 stop goodfife-backend 2>/dev/null || true
pm2 delete goodfife-backend 2>/dev/null || true

echo "📦 依存関係をインストール中..."
cd server
npm install

echo "🗄️ データベース接続を確認中..."
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu -e "SELECT 1;" || echo "⚠️ データベース接続エラー"

echo "📝 環境変数を確認中..."
if [ ! -f .env ]; then
    echo "⚠️ .envファイルが存在しません。作成します..."
    cat > .env << 'ENVEOF'
PORT=5000
DB_HOST=localhost
DB_USER=hitozumano_mitu
DB_PASSWORD=Hjmitsu^90
DB_NAME=hitozumano_mitu
JWT_SECRET=your-secret-key-change-this
NODE_ENV=production
ENVEOF
fi

echo "🚀 バックエンドを起動中..."
cd /var/www/goodfifeproject/server
pm2 start src/index.ts --name "goodfife-backend" --interpreter ts-node

echo "⏳ 起動待機中..."
sleep 5

echo ""
echo "========================================="
echo "✅ バックエンド修正完了"
echo "========================================="
echo ""
echo "🔍 PM2ステータス:"
pm2 status

echo ""
echo "🔍 バックエンドログ（最新20行）:"
pm2 logs goodfife-backend --lines 20 --nostream

echo ""
echo "🌐 バックエンドAPIテスト:"
curl -s http://localhost:5000/api/health || echo "⚠️ ヘルスチェック失敗"

echo ""
echo "💡 次の手順:"
echo "1. 上記のログにエラーがないか確認"
echo "2. ポート5000がリッスンしているか確認: netstat -tlnp | grep 5000"
echo "3. ブラウザで管理画面にアクセス: http://210.131.222.152:3000/admin/login"
