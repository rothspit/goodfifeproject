"use strict";
/**
 * プロキシローテーター
 * 複数のプロキシサーバーを順番に使用
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyRotator = exports.ProxyRotator = void 0;
class ProxyRotator {
    constructor(proxies) {
        this.proxies = [];
        this.currentIndex = 0;
        if (proxies && proxies.length > 0) {
            this.proxies = proxies;
        }
        else {
            this.loadFromEnv();
        }
    }
    /**
     * 環境変数からプロキシリストを読み込み
     */
    loadFromEnv() {
        const proxyService = process.env.PROXY_SERVICE?.toLowerCase();
        // 有料プロキシサービス設定
        if (proxyService === 'brightdata') {
            this.loadBrightData();
        }
        else if (proxyService === 'oxylabs') {
            this.loadOxylabs();
        }
        else if (proxyService === 'smartproxy') {
            this.loadSmartproxy();
        }
        else if (process.env.MANUAL_PROXY_HOST) {
            this.loadManualProxy();
        }
        else {
            // 環境変数 PROXY_LIST からカンマ区切りのプロキシリストを読み込み
            const proxyList = process.env.PROXY_LIST || '';
            if (proxyList) {
                const proxyServers = proxyList.split(',').map(p => p.trim()).filter(Boolean);
                this.proxies = proxyServers.map(server => ({ server }));
                console.log(`✅ プロキシ ${this.proxies.length}個を読み込みました`);
            }
            else {
                console.log('⚠️  プロキシが設定されていません');
                // デフォルトで無料プロキシリストを使用（本番では推奨しない）
                this.proxies = this.getFreeProxies();
            }
        }
    }
    /**
     * BrightData プロキシ設定を読み込み
     * https://brightdata.com/
     */
    loadBrightData() {
        const username = process.env.BRIGHTDATA_USERNAME;
        const password = process.env.BRIGHTDATA_PASSWORD;
        const host = process.env.BRIGHTDATA_HOST || 'brd.superproxy.io';
        const port = process.env.BRIGHTDATA_PORT || '22225';
        const country = process.env.BRIGHTDATA_COUNTRY || 'jp';
        if (!username || !password) {
            console.error('❌ BrightData認証情報が設定されていません');
            return;
        }
        // BrightDataは複数のプロキシゾーンをサポート
        // セッション付きプロキシで安定した接続を実現
        const zones = ['residential', 'datacenter', 'mobile'];
        this.proxies = zones.map(zone => ({
            server: `http://${host}:${port}`,
            username: `${username}-zone-${zone}-country-${country}`,
            password: password,
            country: country.toUpperCase(),
        }));
        console.log(`✅ BrightData プロキシ ${this.proxies.length}ゾーンを読み込みました`);
    }
    /**
     * Oxylabs プロキシ設定を読み込み
     * https://oxylabs.io/
     */
    loadOxylabs() {
        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;
        const host = process.env.OXYLABS_HOST || 'pr.oxylabs.io';
        const port = process.env.OXYLABS_PORT || '7777';
        if (!username || !password) {
            console.error('❌ Oxylabs認証情報が設定されていません');
            return;
        }
        this.proxies = [{
                server: `http://${host}:${port}`,
                username: `customer-${username}-cc-jp`,
                password: password,
                country: 'JP',
            }];
        console.log(`✅ Oxylabs プロキシを読み込みました`);
    }
    /**
     * Smartproxy プロキシ設定を読み込み
     * https://smartproxy.com/
     */
    loadSmartproxy() {
        const username = process.env.SMARTPROXY_USERNAME;
        const password = process.env.SMARTPROXY_PASSWORD;
        const host = process.env.SMARTPROXY_HOST || 'gate.smartproxy.com';
        const port = process.env.SMARTPROXY_PORT || '7000';
        if (!username || !password) {
            console.error('❌ Smartproxy認証情報が設定されていません');
            return;
        }
        this.proxies = [{
                server: `http://${host}:${port}`,
                username: username,
                password: password,
                country: 'JP',
            }];
        console.log(`✅ Smartproxy プロキシを読み込みました`);
    }
    /**
     * 手動プロキシ設定を読み込み
     */
    loadManualProxy() {
        const host = process.env.MANUAL_PROXY_HOST;
        const port = process.env.MANUAL_PROXY_PORT || '8080';
        const username = process.env.MANUAL_PROXY_USERNAME;
        const password = process.env.MANUAL_PROXY_PASSWORD;
        if (!host) {
            return;
        }
        this.proxies = [{
                server: `http://${host}:${port}`,
                username: username,
                password: password,
            }];
        console.log(`✅ 手動プロキシを読み込みました: ${host}:${port}`);
    }
    /**
     * 無料プロキシリスト（テスト用のみ、本番では有料サービス推奨）
     * 注: これらは不安定で、本番環境では使用しないこと
     */
    getFreeProxies() {
        return [
            // 実際の無料プロキシは頻繁に変わるため、
            // 本番環境では BrightData, Oxylabs, Smartproxy 等の有料サービスを使用
            { server: 'http://proxy.example.com:8080', country: 'JP' },
        ];
    }
    /**
     * 次のプロキシを取得
     */
    getNext() {
        if (this.proxies.length === 0) {
            return null;
        }
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }
    /**
     * ランダムなプロキシを取得
     */
    getRandom() {
        if (this.proxies.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * this.proxies.length);
        return this.proxies[randomIndex];
    }
    /**
     * 現在のプロキシを取得
     */
    getCurrent() {
        if (this.proxies.length === 0) {
            return null;
        }
        return this.proxies[this.currentIndex];
    }
    /**
     * プロキシ数を取得
     */
    getCount() {
        return this.proxies.length;
    }
    /**
     * プロキシをフォーマット（Playwright用）
     */
    formatForPlaywright(proxy) {
        return {
            server: proxy.server,
            username: proxy.username,
            password: proxy.password
        };
    }
}
exports.ProxyRotator = ProxyRotator;
// シングルトンインスタンス
exports.proxyRotator = new ProxyRotator();
//# sourceMappingURL=proxyRotator.js.map