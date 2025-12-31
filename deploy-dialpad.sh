#!/bin/bash

# ====================================
# Dialpad CTI機能 デプロイスクリプト
# ====================================

set -e  # エラーが発生したら停止

echo "🚀 Dialpad CTI機能のデプロイを開始します..."
echo ""

# カラーコード
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ステップ1: 最新コードを取得
echo -e "${BLUE}[1/6]${NC} 最新コードを取得中..."
cd /var/www/goodfifeproject
git pull origin genspark_ai_developer
echo -e "${GREEN}✓${NC} 最新コードの取得完了"
echo ""

# ステップ2: サーバー側のビルド
echo -e "${BLUE}[2/6]${NC} サーバー側のビルド中..."
cd /var/www/goodfifeproject/server
npm run build
echo -e "${GREEN}✓${NC} サーバービルド完了"
echo ""

# ステップ3: クライアント側のビルド
echo -e "${BLUE}[3/6]${NC} クライアント側のビルド中（時間がかかります）..."
cd /var/www/goodfifeproject/client
npm run build
echo -e "${GREEN}✓${NC} クライアントビルド完了"
echo ""

# ステップ4: 環境変数の確認
echo -e "${BLUE}[4/6]${NC} 環境変数を確認中..."
cd /var/www/goodfifeproject/server
if grep -q "DIALPAD_WEBHOOK_SECRET" .env; then
    echo -e "${GREEN}✓${NC} DIALPAD_WEBHOOK_SECRET が設定されています"
else
    echo -e "${YELLOW}⚠${NC}  DIALPAD_WEBHOOK_SECRET が未設定です"
    echo "   次のコマンドで設定してください:"
    echo "   echo 'DIALPAD_WEBHOOK_SECRET=your_secret_here' >> /var/www/goodfifeproject/server/.env"
fi
echo ""

# ステップ5: サービスの再起動
echo -e "${BLUE}[5/6]${NC} サービスを再起動中..."
pm2 restart goodfife-backend
sleep 2
pm2 restart goodfife-frontend
sleep 2
echo -e "${GREEN}✓${NC} サービス再起動完了"
echo ""

# ステップ6: 動作確認
echo -e "${BLUE}[6/6]${NC} 動作確認中..."
pm2 status
echo ""
echo -e "${GREEN}✓${NC} デプロイ完了！"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Dialpad CTI機能のデプロイが完了しました！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "次のステップ:"
echo "1. Dialpad管理画面でWebhook設定"
echo "   URL: http://210.131.222.152:5000/api/dialpad/webhook"
echo ""
echo "2. 環境変数にSecretを設定（未設定の場合）"
echo "   cd /var/www/goodfifeproject/server"
echo "   nano .env"
echo "   DIALPAD_WEBHOOK_SECRET=your_secret_here を追加"
echo ""
echo "3. 設定後、バックエンドを再起動"
echo "   pm2 restart goodfife-backend"
echo ""
echo "4. 動作確認"
echo "   管理画面: http://210.131.222.152:3000/admin"
echo ""
echo "詳細は DIALPAD_SETUP_MANUAL.md を参照してください"
echo ""

