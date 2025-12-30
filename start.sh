#!/bin/bash

echo "🚀 人妻の蜜システムを起動します..."
echo ""

# 環境変数ファイルをコピー（存在しない場合）
if [ ! -f server/.env ]; then
    echo "📝 サーバーの環境変数ファイルを作成中..."
    cp server/.env.example server/.env
fi

if [ ! -f client/.env.local ]; then
    echo "📝 クライアントの環境変数ファイルを作成中..."
    cp client/.env.local.example client/.env.local
fi

echo ""
echo "✅ 環境変数の準備完了"
echo ""
echo "📦 パッケージをインストール中..."

# サーバーのパッケージインストール
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# クライアントのパッケージインストール
cd client
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo ""
echo "✅ パッケージのインストール完了"
echo ""
echo "🎬 サーバーを起動中..."
echo ""

# サーバーをバックグラウンドで起動
cd server
npm run dev &
SERVER_PID=$!
cd ..

echo "⏳ サーバーの起動を待機中（5秒）..."
sleep 5

echo ""
echo "🎬 クライアントを起動中..."
echo ""

# クライアントを起動
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✨ システムが起動しました！"
echo ""
echo "📍 アクセス先:"
echo "   - クライアント: http://localhost:3000"
echo "   - サーバーAPI: http://localhost:5000/api"
echo ""
echo "⚠️  終了するには Ctrl+C を押してください"
echo ""

# シグナルハンドラー（Ctrl+Cで両方のプロセスを終了）
trap "echo ''; echo '🛑 システムを停止中...'; kill $SERVER_PID $CLIENT_PID; exit" INT

# プロセスの終了を待機
wait
