/**
 * ヘブンネット（シティヘブンネット）ログインテスト
 */
const { chromium } = require('playwright');

async function testHeavenNetLogin() {
  console.log('🚀 ヘブンネットログインテスト開始...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // まずトップページにアクセス
    console.log('📍 Step 1: トップページにアクセス');
    await page.goto('https://www.cityheaven.net/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log(`   ✅ タイトル: ${await page.title()}`);
    
    // スクリーンショット保存
    await page.screenshot({ path: '/home/user/webapp/screenshots/heaven-top.png', fullPage: true });
    console.log('   📸 スクリーンショット保存: heaven-top.png\n');
    
    // ログインページを探す
    console.log('📍 Step 2: ログインページを探索');
    
    // 一般的なログインリンクパターンをチェック
    const loginSelectors = [
      'a:has-text("ログイン")',
      'a:has-text("店舗ログイン")',
      'a:has-text("店舗様")',
      'a[href*="login"]',
      'a[href*="shop"]',
      'a[href*="member"]'
    ];
    
    let loginUrl = null;
    for (const selector of loginSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          loginUrl = await element.getAttribute('href');
          console.log(`   ✅ ログインリンク発見: ${selector}`);
          console.log(`   🔗 URL: ${loginUrl}\n`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // ページのHTMLから手がかりを探す
    console.log('📍 Step 3: ページ構造解析');
    const html = await page.content();
    
    // "店舗" "ログイン" "管理" などのキーワードを含むリンクを探す
    const links = await page.locator('a').allTextContents();
    const relevantLinks = links.filter(text => 
      text.includes('店舗') || 
      text.includes('ログイン') || 
      text.includes('管理') ||
      text.includes('会員')
    );
    
    console.log('   関連リンク:');
    relevantLinks.slice(0, 10).forEach(link => console.log(`   - ${link}`));
    console.log('');
    
    // 直接店舗管理URLにアクセスを試みる（推測）
    const possibleUrls = [
      'https://www.cityheaven.net/shop/login/',
      'https://www.cityheaven.net/login/',
      'https://shop.cityheaven.net/login/',
      'https://admin.cityheaven.net/login/',
      'https://www.cityheaven.net/management/',
      'https://www.cityheaven.net/owner/login/'
    ];
    
    console.log('📍 Step 4: 店舗管理ページ候補を試行');
    for (const url of possibleUrls) {
      try {
        console.log(`   試行中: ${url}`);
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        if (response && response.status() === 200) {
          console.log(`   ✅ アクセス成功! Status: ${response.status()}`);
          console.log(`   📄 タイトル: ${await page.title()}\n`);
          
          // スクリーンショット
          await page.screenshot({ 
            path: `/home/user/webapp/screenshots/heaven-login-${url.split('/').pop() || 'page'}.png`,
            fullPage: true 
          });
          
          // ログインフォームの要素を探す
          const forms = await page.locator('form').count();
          console.log(`   📝 フォーム数: ${forms}`);
          
          // ID/パスワード入力欄を探す
          const inputs = await page.locator('input').allInnerTexts();
          const inputTypes = await page.locator('input').evaluateAll(elements =>
            elements.map(el => ({ type: el.type, name: el.name, id: el.id, placeholder: el.placeholder }))
          );
          console.log('   入力欄:', JSON.stringify(inputTypes, null, 2));
          
          break;
        }
      } catch (e) {
        console.log(`   ❌ アクセス失敗: ${e.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n📍 Step 5: ログイン情報');
    console.log('   🔑 提供されたログイン情報:');
    console.log('   ID: 2500000713');
    console.log('   Pass: ZKs60jlq');
    console.log('\n✅ 調査完了！');
    
  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    await page.screenshot({ path: '/home/user/webapp/screenshots/heaven-error.png' });
  } finally {
    await browser.close();
  }
}

// 実行
testHeavenNetLogin().catch(console.error);
