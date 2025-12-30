/**
 * デリヘルタウンログインテスト
 */
const { chromium } = require('playwright');

async function testDeliheruTownLogin() {
  console.log('🚀 デリヘルタウンログインテスト開始...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo'
  });
  
  const page = await context.newPage();
  
  try {
    // トップページにアクセス
    console.log('📍 Step 1: トップページにアクセス');
    const possibleUrls = [
      'https://www.deliherutown.com/',
      'https://deliherutown.com/',
      'http://www.deliherutown.com/',
    ];
    
    let accessedUrl = null;
    for (const url of possibleUrls) {
      try {
        console.log(`   試行中: ${url}`);
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        if (response && response.status() === 200) {
          accessedUrl = url;
          console.log(`   ✅ アクセス成功! Status: ${response.status()}`);
          console.log(`   📄 タイトル: ${await page.title()}\n`);
          break;
        }
      } catch (e) {
        console.log(`   ❌ ${e.message.split('\n')[0]}`);
      }
    }
    
    if (!accessedUrl) {
      console.log('   ❌ トップページにアクセスできませんでした');
      return;
    }
    
    // スクリーンショット保存
    await page.screenshot({ path: '/home/user/webapp/screenshots/deliheru-top.png', fullPage: true });
    console.log('   📸 スクリーンショット保存: deliheru-top.png\n');
    
    // ログインページを探す
    console.log('📍 Step 2: ログインページを探索');
    
    // すべてのリンクを取得
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(a => ({
        text: a.textContent.trim(),
        href: a.href
      }));
    });
    
    console.log(`   📊 全リンク数: ${allLinks.length}`);
    
    // ログイン関連のリンクを探す
    const loginLinks = allLinks.filter(link => 
      link.text.includes('ログイン') ||
      link.text.includes('店舗') ||
      link.text.includes('管理') ||
      link.href.includes('login') ||
      link.href.includes('shop') ||
      link.href.includes('manage')
    );
    
    console.log('   🔍 ログイン関連リンク:');
    loginLinks.forEach(link => {
      console.log(`      ${link.text} -> ${link.href}`);
    });
    console.log('');
    
    // 店舗管理ログインページ候補
    const loginPageCandidates = [
      `${accessedUrl}shop/login/`,
      `${accessedUrl}login/`,
      `${accessedUrl}shop/`,
      `${accessedUrl}admin/login/`,
      `${accessedUrl}management/login/`,
      `${accessedUrl}store/login/`,
      ...loginLinks.map(l => l.href).filter(h => h && (h.includes('login') || h.includes('shop')))
    ];
    
    console.log('📍 Step 3: ログインページ候補を試行');
    let loginPageUrl = null;
    
    for (const url of [...new Set(loginPageCandidates)]) {
      try {
        console.log(`   試行中: ${url}`);
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        if (response && response.status() === 200) {
          const title = await page.title();
          console.log(`   ✅ アクセス成功! Status: ${response.status()}`);
          console.log(`   📄 タイトル: ${title}\n`);
          
          // ログインフォームがあるかチェック
          const hasForm = await page.locator('form').count() > 0;
          const hasEmailInput = await page.locator('input[type="email"], input[type="text"][name*="mail"], input[name*="mail"]').count() > 0;
          const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
          
          console.log(`   📝 フォーム: ${hasForm ? 'あり' : 'なし'}`);
          console.log(`   📧 Email入力欄: ${hasEmailInput ? 'あり' : 'なし'}`);
          console.log(`   🔒 パスワード入力欄: ${hasPasswordInput ? 'あり' : 'なし'}\n`);
          
          if (hasForm && (hasEmailInput || hasPasswordInput)) {
            loginPageUrl = url;
            
            // スクリーンショット
            const filename = url.replace(/[^a-zA-Z0-9]/g, '-') + '.png';
            await page.screenshot({ 
              path: `/home/user/webapp/screenshots/deliheru-login-${filename}`,
              fullPage: true 
            });
            console.log(`   📸 スクリーンショット保存: deliheru-login-${filename}\n`);
            
            // 入力欄の詳細情報
            const inputDetails = await page.evaluate(() => {
              const inputs = Array.from(document.querySelectorAll('input'));
              return inputs.map(input => ({
                type: input.type,
                name: input.name,
                id: input.id,
                placeholder: input.placeholder,
                className: input.className
              }));
            });
            
            console.log('   📋 入力欄詳細:');
            inputDetails.forEach(input => {
              console.log(`      ${JSON.stringify(input)}`);
            });
            console.log('');
            
            break;
          }
        }
      } catch (e) {
        console.log(`   ❌ ${e.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n📍 Step 4: ログイン情報');
    console.log('   🔑 提供されたログイン情報:');
    console.log('   Email: info@h-mitsu.com');
    console.log('   Pass: hitodumamitu');
    
    if (loginPageUrl) {
      console.log(`\n   ✅ ログインページ発見: ${loginPageUrl}`);
    } else {
      console.log('\n   ⚠️  ログインページが見つかりませんでした');
    }
    
    console.log('\n✅ 調査完了！');
    
  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    await page.screenshot({ path: '/home/user/webapp/screenshots/deliheru-error.png' });
  } finally {
    await browser.close();
  }
}

// 実行
testDeliheruTownLogin().catch(console.error);
