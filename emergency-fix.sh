#!/bin/bash
# 緊急修正スクリプト - Next.jsビルドエラー対応

set -e

echo "========================================="
echo "🚨 緊急修正: Next.jsビルドエラー対応"
echo "========================================="

cd /var/www/goodfifeproject/client

echo "🧹 完全クリーンアップ中..."
rm -rf .next
rm -rf node_modules
rm -rf .cache
rm -rf dist

echo "📦 依存関係を再インストール中..."
npm cache clean --force
npm install

echo "⚙️ 環境変数を設定中..."
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://210.131.222.152:5000/api
NEXT_PUBLIC_SOCKET_URL=http://210.131.222.152:5000
ENVEOF

echo "🔨 フロントエンドを完全再ビルド中..."
npm run build

echo "♻️ PM2プロセスを完全削除・再作成中..."
pm2 delete goodfife-frontend 2>/dev/null || true
pm2 start npm --name "goodfife-frontend" -- start -- -p 3000

echo "⏳ プロセス起動待機中..."
sleep 5

echo ""
echo "========================================="
echo "✅ 修正完了！"
echo "========================================="
echo ""
echo "🔍 PM2ステータス:"
pm2 status

echo ""
echo "📍 アクセスURL: http://210.131.222.152:3000"
echo "💡 ブラウザで Ctrl+Shift+R を押してください"
echo ""
echo "🐛 まだエラーが出る場合は以下を確認:"
echo "   pm2 logs goodfife-frontend --lines 50"
