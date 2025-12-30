# 🚀 Dialpad連携 クイックスタートガイド

**所要時間: 約10分**

---

## 📝 準備するもの

- ✅ Xserverへのアクセス（SSH: `ssh -i ~/WIFEHP.pem root@210.131.222.152`）
- ✅ Dialpad管理者アカウント
- ✅ 着信を受ける電話番号（050番号など）

---

## 🎯 3ステップで完了！

### ステップ1️⃣: サーバーにデプロイ（5分）

#### 1-1. サーバーにSSH接続
```bash
ssh -i ~/WIFEHP.pem root@210.131.222.152
```

#### 1-2. デプロイスクリプトを実行
```bash
cd /var/www/goodfifeproject
bash deploy-dialpad.sh
```

**⏱️ 待ち時間: 3〜5分（自動で完了します）**

#### 1-3. 完了メッセージを確認
```
🎉 Dialpad CTI機能のデプロイが完了しました！
```

✅ **ステップ1完了！**

---

### ステップ2️⃣: Dialpadで設定（3分）

#### 2-1. Dialpad管理画面を開く
🔗 https://dialpad.com/ にログイン

#### 2-2. Webhook設定画面に移動
```
Settings → Admin Settings → API & Integrations → Webhooks
```

#### 2-3. 「Create Webhook」をクリック

#### 2-4. 以下を入力
| 項目 | 入力内容 |
|------|----------|
| **Webhook URL** | `http://210.131.222.152:5000/api/dialpad/webhook` |
| **Events** | ✅ call.created<br>✅ call.ringing<br>✅ call.incoming<br>✅ call.answered<br>✅ call.ended |

#### 2-5. 「Generate Secret」をクリック
→ シークレットキーが表示される（例: `whsec_abc123...`）

#### 2-6. シークレットをコピー
**📋 このキーをコピーしておく（後で使います）**

#### 2-7. 「Save」をクリック

✅ **ステップ2完了！**

---

### ステップ3️⃣: サーバーにシークレットを設定（2分）

#### 3-1. サーバーにSSH接続（別ターミナル、または同じターミナル）
```bash
ssh -i ~/WIFEHP.pem root@210.131.222.152
```

#### 3-2. .envファイルを編集
```bash
cd /var/www/goodfifeproject/server
nano .env
```

#### 3-3. ファイルの最後に追加
```bash
# Dialpad Webhook Secret
DIALPAD_WEBHOOK_SECRET=whsec_abc123...
```
**↑ コピーしたシークレットをペースト**

#### 3-4. 保存して終了
- **Ctrl + O** → Enter（保存）
- **Ctrl + X**（終了）

#### 3-5. サーバーを再起動
```bash
pm2 restart goodfife-backend
```

#### 3-6. ログ確認
```bash
pm2 logs goodfife-backend --nostream
```

**確認ポイント:**
```
✅ Server running on port 5000
✅ Dialpad webhook secret configured  ← この行が表示されればOK
```

✅ **ステップ3完了！すべて完了です！🎉**

---

## 🧪 動作テスト（1分）

### テスト方法1: Dialpadの「Test Webhook」機能

1. Dialpad管理画面のWebhook一覧で作成したWebhookを選択
2. 「Test Webhook」ボタンをクリック
3. サーバーログに以下が表示されればOK:
   ```
   📞 Dialpad webhook received
   ✅ Webhook signature verified
   ```

### テスト方法2: 実際の着信テスト

1. **管理画面にログイン**
   ```
   http://210.131.222.152:3000/admin/login
   ```

2. **Dialpadで設定した電話番号に発信**
   - 携帯電話やIP電話から発信

3. **結果確認**
   - ⏱️ 着信と同時に（1秒以内）CTIポップアップが自動表示
   - 🖥️ 500x700pxの別ウィンドウが開く
   - 📱 発信者の顧客情報が表示される
   - 🏪 着信番号から店舗が自動識別される

---

## 🎉 完了！使い方

### 日常の使い方

1. **管理画面にログイン**するだけ
   ```
   http://210.131.222.152:3000/admin
   ```

2. **電話を待つ**
   - WebSocket接続が自動確立
   - 着信を監視開始

3. **電話が鳴ると...**
   - 🔔 自動的にCTIポップアップが表示！
   - 📊 顧客情報が即座に確認できる
   - 💬 過去のメモや履歴も表示

4. **アクション選択**
   - 「詳細を確認」→ 顧客詳細画面
   - 「新規受注を入力」→ 受注入力画面

**特別な操作は一切不要です！** 😊

---

## ❓ よくある質問

### Q: ポップアップが表示されない

**A: ブラウザのポップアップブロッカーを確認**
1. ブラウザ右上のアイコンをクリック
2. `http://210.131.222.152:3000` のポップアップを許可

### Q: 「顧客が見つかりません」と表示される

**A: 顧客の電話番号が未登録**
- 顧客検索画面から電話番号を登録してください

### Q: 複数の管理者で使える？

**A: はい！**
- 各管理者が管理画面にログインすれば使えます
- 着信時、すべての管理者にポップアップが表示されます

### Q: HTTPSは必要？

**A: HTTPでも動作しますが、HTTPSを推奨**
- セキュリティ向上
- ブラウザの警告回避

---

## 🆘 トラブルシューティング

### 🔴 問題: Webhookが受信されない

**解決策:**
```bash
# サーバーログを確認
pm2 logs goodfife-backend --lines 50

# サービスが起動しているか確認
pm2 status

# 再起動
pm2 restart goodfife-backend
```

### 🔴 問題: 署名検証エラー

```
❌ Dialpad webhook signature verification failed
```

**解決策:**
1. `.env` ファイルを確認
   ```bash
   cat /var/www/goodfifeproject/server/.env | grep DIALPAD
   ```
2. シークレットが正しく設定されているか確認
3. 再設定して再起動

### 🔴 問題: WebSocket接続が切れる

**解決策:**
- ページをリロード
- 再ログイン
- ブラウザのキャッシュをクリア

---

## 📚 詳細ドキュメント

より詳しい情報は以下を参照:

1. **DIALPAD_SETUP_MANUAL.md** - 完全セットアップマニュアル
2. **DIALPAD_INTEGRATION_DEPLOYMENT.md** - 技術仕様
3. **DIALPAD_CTI_SETUP_GUIDE.md** - Dialpad設定ガイド

---

## 📞 サポート

問題が解決しない場合:

1. **サーバーログを確認**
   ```bash
   pm2 logs goodfife-backend --lines 100 --nostream
   ```

2. **ブラウザのConsoleを確認**
   - F12 → Console タブ
   - エラーメッセージを確認

3. **Dialpadのログを確認**
   - Webhook一覧 → 詳細 → Delivery Log

---

## ✅ チェックリスト

- [ ] ステップ1: デプロイスクリプト実行
- [ ] ステップ2: Dialpadで Webhook作成
- [ ] ステップ3: サーバーにシークレット設定
- [ ] テスト: Dialpadの「Test Webhook」実行
- [ ] テスト: 実際の着信確認
- [ ] ポップアップ表示確認
- [ ] 顧客情報表示確認

**すべて完了したら本番運用開始！🚀**

---

**作成日**: 2025-12-15  
**所要時間**: 約10分  
**難易度**: ⭐⭐☆☆☆（初心者OK）
