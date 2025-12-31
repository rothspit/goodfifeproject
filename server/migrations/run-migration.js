/**
 * SaaS マイグレーション実行スクリプト
 * 
 * 使用方法:
 *   node run-migration.js
 * 
 * 環境変数:
 *   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'goodfife_db',
  multipleStatements: true // 複数のSQL文を実行可能にする
};

async function runMigration() {
  console.log('\n🚀 SaaS マルチテナント マイグレーション開始...\n');
  console.log('📊 接続情報:');
  console.log(`   ホスト: ${config.host}`);
  console.log(`   データベース: ${config.database}`);
  console.log(`   ユーザー: ${config.user}\n`);

  let connection;

  try {
    // データベース接続
    console.log('🔌 データベースに接続中...');
    connection = await mysql.createConnection(config);
    console.log('✅ 接続成功\n');

    // マイグレーションSQLを読み込み
    const sqlFile = path.join(__dirname, 'apply_saas_full_migration.sql');
    console.log('📄 マイグレーションファイル読み込み中...');
    console.log(`   ファイル: ${sqlFile}`);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`マイグレーションファイルが見つかりません: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ ファイル読み込み完了\n');

    // バックアップの推奨
    console.log('⚠️  重要: 実行前にデータベースのバックアップを推奨します');
    console.log('   mysqldump -u root -p goodfife_db > backup_$(date +%Y%m%d_%H%M%S).sql\n');

    // 実行確認
    console.log('🔧 マイグレーション実行中...');
    console.log('   (既存データに影響はありません)\n');

    // SQL実行
    const [results] = await connection.query(sql);
    
    console.log('✅ マイグレーション実行完了\n');

    // 結��の表示
    if (Array.isArray(results)) {
      for (const result of results) {
        if (result && result.length > 0) {
          console.table(result);
        }
      }
    }

    // テーブル確認
    console.log('\n📋 作成されたテーブルを確認中...\n');
    const [tables] = await connection.query(`
      SELECT 
        TABLE_NAME AS 'テーブル名',
        TABLE_ROWS AS '行数',
        ROUND(DATA_LENGTH / 1024, 2) AS 'サイズ(KB)',
        TABLE_COMMENT AS 'コメント'
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN (
          'companies', 
          'subscriptions', 
          'stores', 
          'store_users', 
          'usage_stats', 
          'audit_logs',
          'store_groups',
          'store_group_history'
        )
      ORDER BY TABLE_NAME
    `, [config.database]);

    if (tables.length > 0) {
      console.log('✅ SaaSテーブル:');
      console.table(tables);
    } else {
      console.log('⚠️  テーブルが見つかりませんでした');
    }

    // カラム確認
    console.log('\n📋 追加されたカラムを確認中...\n');
    const [columns] = await connection.query(`
      SELECT 
        TABLE_NAME AS 'テーブル名',
        COLUMN_NAME AS 'カラム名',
        COLUMN_TYPE AS '型',
        COLUMN_COMMENT AS 'コメント'
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('users', 'casts', 'orders', 'stores')
        AND COLUMN_NAME IN ('company_id', 'store_id', 'group_id', 'user_type')
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [config.database]);

    if (columns.length > 0) {
      console.log('✅ 追加されたカラム:');
      console.table(columns);
    }

    console.log('\n🎉 マイグレーション完了！\n');
    console.log('次のステップ:');
    console.log('1. サーバーを再起動: cd /home/user/webapp/server && npm restart');
    console.log('2. API動作確認: curl http://localhost:5001/api/health');
    console.log('3. グループ作成: POST /api/store-groups\n');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 データベース接続エラー:');
      console.error('   - ユーザー名とパスワードを確認してください');
      console.error('   - .env ファイルの DB_USER, DB_PASSWORD を確認してください');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 データベースが存在しません:');
      console.error(`   - データベース "${config.database}" を作成してください`);
      console.error(`   - mysql -u root -p -e "CREATE DATABASE ${config.database}"`);
    } else {
      console.error('\n💡 詳細:');
      console.error(error);
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 データベース接続を切断しました\n');
    }
  }
}

// 実行
runMigration()
  .then(() => {
    console.log('✅ スクリプト正常終了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプト異常終了:', error);
    process.exit(1);
  });
