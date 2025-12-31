/**
 * プロキシローテーター
 * 複数のプロキシサーバーを順番に使用
 */
export interface ProxyConfig {
    server: string;
    username?: string;
    password?: string;
    country?: string;
}
export declare class ProxyRotator {
    private proxies;
    private currentIndex;
    constructor(proxies?: ProxyConfig[]);
    /**
     * 環境変数からプロキシリストを読み込み
     */
    private loadFromEnv;
    /**
     * BrightData プロキシ設定を読み込み
     * https://brightdata.com/
     */
    private loadBrightData;
    /**
     * Oxylabs プロキシ設定を読み込み
     * https://oxylabs.io/
     */
    private loadOxylabs;
    /**
     * Smartproxy プロキシ設定を読み込み
     * https://smartproxy.com/
     */
    private loadSmartproxy;
    /**
     * 手動プロキシ設定を読み込み
     */
    private loadManualProxy;
    /**
     * 無料プロキシリスト（テスト用のみ、本番では有料サービス推奨）
     * 注: これらは不安定で、本番環境では使用しないこと
     */
    private getFreeProxies;
    /**
     * 次のプロキシを取得
     */
    getNext(): ProxyConfig | null;
    /**
     * ランダムなプロキシを取得
     */
    getRandom(): ProxyConfig | null;
    /**
     * 現在のプロキシを取得
     */
    getCurrent(): ProxyConfig | null;
    /**
     * プロキシ数を取得
     */
    getCount(): number;
    /**
     * プロキシをフォーマット（Playwright用）
     */
    formatForPlaywright(proxy: ProxyConfig): {
        server: string;
        username?: string;
        password?: string;
    };
}
export declare const proxyRotator: ProxyRotator;
//# sourceMappingURL=proxyRotator.d.ts.map