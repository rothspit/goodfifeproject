/**
 * デリヘルタウン ログインテスト (CloudFront回避策付き)
 */
import { chromium } from 'playwright';

async function main() {
  console.log('===== デリヘルタウン ログインテスト =====\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    extraHTTPHeaders: {
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });
  
  const page = await context.newPage();
  
  // WebDriverプロパティを隠蔽
  await page.addInitScript(`
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
    
    // Chrome/Chromium detection回避
    window.navigator.chrome = {
      runtime: {}
    };
    
    // Permissions API mock
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: 'granted' }) :
        originalQuery(parameters)
    );
  `);
  
  try {
    console.log('🔐 デリヘルタウンにアクセス中...');
    console.log('   URL: https://admin.dto.jp/a/auth/input\n');
    
    // ゆっくりページをロード (CloudFront回避)
    await page.goto('https://admin.dto.jp/a/auth/input', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 少し待機してCloudFrontチェックを通過
    await page.waitForTimeout(3000);
    
    // スクリーンショット撮影
    await page.screenshot({ 
      path: './screenshots/deliherutown-initial.png', 
      fullPage: true 
    });
    console.log('📸 初期ページのスクリーンショット保存');
    
    // CloudFlareブロックチェック
    const pageText = await page.textContent('body');
    if (pageText?.includes('Attention Required') || pageText?.includes('CloudFront')) {
      console.log('⚠️  CloudFrontによるブロックが検出されました');
      console.log('    ページテキスト:', pageText.substring(0, 200));
    } else {
      console.log('✅ CloudFrontブロック回避成功！\n');
      
      // フォームフィールドを確認
      const hasEmailField = await page.locator('input[type="email"], input[name*="mail"], input[id*="mail"]').count();
      const hasPasswordField = await page.locator('input[type="password"]').count();
      
      console.log(`📋 フォーム要素:`);
      console.log(`   メールフィールド: ${hasEmailField}個`);
      console.log(`   パスワードフィールド: ${hasPasswordField}個\n`);
      
      if (hasEmailField > 0 && hasPasswordField > 0) {
        console.log('🔑 ログインフォームが見つかりました');
        console.log('   メール: info@h-mitsu.com');
        console.log('   パスワード: hitodumamitu\n');
        
        // ログイン試行
        const emailField = page.locator('input[type="email"], input[name*="mail"], input[id*="mail"]').first();
        const passwordField = page.locator('input[type="password"]').first();
        
        await emailField.fill('info@h-mitsu.com');
        await passwordField.fill('hitodumamitu');
        
        console.log('📝 ログイン情報入力完了');
        
        await page.screenshot({ 
          path: './screenshots/deliherutown-filled-form.png', 
          fullPage: true 
        });
        console.log('📸 入力後のスクリーンショット保存');
        
        // ログインボタンを探す
        const loginButton = await page.locator('button:has-text("ログイン"), input[type="submit"]').first();
        const loginButtonCount = await loginButton.count();
        
        if (loginButtonCount > 0) {
          console.log('✅ ログインボタン発見\n');
          
          await Promise.all([
            page.waitForNavigation({ timeout: 30000 }).catch(() => {}),
            loginButton.click()
          ]);
          
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: './screenshots/deliherutown-after-login.png', 
            fullPage: true 
          });
          console.log('📸 ログイン後のスクリーンショット保存');
          
          const currentUrl = page.url();
          console.log(`\n🌐 現在のURL: ${currentUrl}`);
          
          if (!currentUrl.includes('/auth/input')) {
            console.log('✅ ログイン成功！ページ遷移を確認');
          } else {
            console.log('⚠️  ログインに失敗した可能性があります');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
    
    await page.screenshot({ 
      path: './screenshots/deliherutown-error.png', 
      fullPage: true 
    });
    console.log('📸 エラー時のスクリーンショット保存');
  } finally {
    await browser.close();
  }
}

main();
