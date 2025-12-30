const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const createAdmin = async () => {
  try {
    // まず、roleカラムを追加（存在しない場合）
    db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('roleカラム追加エラー:', err.message);
      } else {
        console.log('✅ roleカラムを確認/追加しました');
      }

      // パスワードをハッシュ化
      const password = 'admin123456'; // このパスワードを使ってログイン
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('パスワードハッシュ化エラー:', err);
          db.close();
          return;
        }

        const phone_number = '090-0000-0000';
        const name = '管理者';
        const email = 'admin@hitotsuma.com';
        const role = 'admin';

        // 既存の管理者を確認
        db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, row) => {
          if (err) {
            console.error('エラー:', err);
            db.close();
            return;
          }

          if (row) {
            // 既存ユーザーを管理者に昇格
            db.run('UPDATE users SET role = ? WHERE phone_number = ?', [role, phone_number], (err) => {
              if (err) {
                console.error('更新エラー:', err);
              } else {
                console.log('✅ 既存ユーザーを管理者に昇格しました！');
                console.log('=====================================');
                console.log('📞 電話番号: ' + phone_number);
                console.log('🔑 パスワード: admin123456');
                console.log('=====================================');
              }
              db.close();
            });
            return;
          }

          // 管理者を新規作成
          db.run(
            `INSERT INTO users (phone_number, password, name, email, role, created_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [phone_number, hashedPassword, name, email, role],
            function(err) {
              if (err) {
                console.error('管理者作成エラー:', err);
              } else {
                console.log('✅ 管理者アカウントを作成しました！');
                console.log('=====================================');
                console.log('📞 電話番号: ' + phone_number);
                console.log('🔑 パスワード: admin123456');
                console.log('👤 名前: ' + name);
                console.log('📧 メール: ' + email);
                console.log('=====================================');
                console.log('\n✨ この情報で管理画面にログインしてください！');
              }
              db.close();
            }
          );
        });
      });
    });
  } catch (error) {
    console.error('エラー:', error);
    db.close();
  }
};

createAdmin();
