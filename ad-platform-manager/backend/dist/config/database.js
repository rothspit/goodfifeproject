"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// MySQL接続プール作成
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ad_platform_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
});
// 接続テスト
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ MySQL データベース接続成功');
        console.log(`   ホスト: ${process.env.DB_HOST}`);
        console.log(`   データベース: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ データベース接続エラー:', error);
        return false;
    }
}
exports.default = exports.pool;
//# sourceMappingURL=database.js.map