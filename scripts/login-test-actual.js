/**
 * シティヘブンネット＆デリヘルタウン 実際のログインテスト
 */
const { chromium } = require('playwright');
const fs = require('fs');

// 認証情報
const HEAVEN_NET = {
  name: 'シティヘブンネット',
  url: 'https://spmanager.cityheaven.net/',
  credentials: {
    id: '2500000713',
    password: 'ZKs60jlq'
  }
};

const DELIHERU_TOWN = {
  name: 'デリヘルタウン',
  url: 'https://admin.dto.jp/a/auth/input',
  credentials: {
    email: 'info@h-mitsu.com',
    password: 'hitodumamitu'
  }
};

async function testLogin(siteConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 ${siteConfig.name} ログインテスト開始`);
  console.log(`${'='.repeat(60)}\n`);
  
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
    // Step 1: ログインページにアクセス
    console.log(`📍 Step 1: ログインページにアクセス`);
    console.log(`   URL: ${siteConfig.url}`);
    
    await page.goto(siteConfig.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const title = await page.title();
    console.log(`   ✅ ページロード成功`);
    console.log(`   📄 タイトル: ${title}\n`);
    
    // スクリーンショット（ログイン前）
    const siteName = siteConfig.name.replace(/\s+/g, '-');
    await page.screenshot({ 
      path: `/home/user/webapp/screenshots/${siteName}-login-page.png`,
      fullPage: true 
    });
    console.log(`   📸 スクリーンショット保存: ${siteName}-login-page.png\n`);
    
    // Step 2: ログインフォームの解析
    console.log(`📍 Step 2: ログインフォームの解析`);
    
    // すべての入力フィールドを検出
    const inputs = await page.evaluate(() => {
      const inputElements = Array.from(document.querySelectorAll('input'));
      return inputElements.map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        className: input.className,
        value: input.value
      }));
    });
    
    console.log(`   📝 検出された入力フィールド (${inputs.length}件):`);
    inputs.forEach((input, idx) => {
      console.log(`   [${idx + 1}] type="${input.type}" name="${input.name}" id="${input.id}" placeholder="${input.placeholder}"`);
    });
    console.log('');
    
    // ボタン検出
    const buttons = await page.evaluate(() => {
      const buttonElements = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      return buttonElements.map(btn => ({
        tag: btn.tagName,
        type: btn.type,
        text: btn.textContent.trim(),
        value: btn.value,
        className: btn.className
      }));
    });
    
    console.log(`   🔘 検出されたボタン (${buttons.length}件):`);
    buttons.forEach((btn, idx) => {
      console.log(`   [${idx + 1}] ${btn.tag} text="${btn.text}" value="${btn.value}"`);
    });
    console.log('');
    
    // Step 3: ログイン試行
    console.log(`📍 Step 3: ログイン試行`);
    
    // 入力フィールドを特定
    let usernameField, passwordField;
    
    // IDまたはEmailフィールドを検索
    for (const input of inputs) {
      // hiddenフィールドはスキップ
      if (input.type === 'hidden') continue;
      
      const lowerName = (input.name || '').toLowerCase();
      const lowerId = (input.id || '').toLowerCase();
      const lowerPlaceholder = (input.placeholder || '').toLowerCase();
      
      // ユーザー名/ID/Emailフィールド（text typeのみ）
      if (
        input.type === 'text' &&
        (lowerName.includes('account') || lowerName.includes('user') || lowerName.includes('mail') ||
        lowerId.includes('user') || lowerId.includes('user') || lowerId.includes('mail') ||
        lowerPlaceholder.includes('id') || lowerPlaceholder.includes('メール') || lowerPlaceholder.includes('アカウント')) &&
        !usernameField
      ) {
        usernameField = input;
      }
      
      // パスワードフィールド
      if (input.type === 'password' && !passwordField) {
        passwordField = input;
      }
    }
    
    if (!usernameField || !passwordField) {
      console.log(`   ❌ ログインフィールドが見つかりませんでした`);
      console.log(`   Username field: ${usernameField ? 'Found' : 'Not found'}`);
      console.log(`   Password field: ${passwordField ? 'Found' : 'Not found'}`);
      return { success: false, reason: 'フィールド未検出' };
    }
    
    console.log(`   ✅ ユーザー名フィールド検出: name="${usernameField.name}" id="${usernameField.id}"`);
    console.log(`   ✅ パスワードフィールド検出: name="${passwordField.name}" id="${passwordField.id}"`);
    
    // 認証情報を入力
    const username = siteConfig.credentials.id || siteConfig.credentials.email;
    const password = siteConfig.credentials.password;
    
    console.log(`   🔑 認証情報入力中...`);
    
    // ユーザー名を入力
    if (usernameField.id) {
      await page.fill(`#${usernameField.id}`, username);
    } else if (usernameField.name) {
      await page.fill(`[name="${usernameField.name}"]`, username);
    }
    
    // パスワードを入力
    if (passwordField.id) {
      await page.fill(`#${passwordField.id}`, password);
    } else if (passwordField.name) {
      await page.fill(`[name="${passwordField.name}"]`, password);
    }
    
    console.log(`   ✅ 認証情報入力完了\n`);
    
    // スクリーンショット（入力後）
    await page.screenshot({ 
      path: `/home/user/webapp/screenshots/${siteName}-login-filled.png`,
      fullPage: true 
    });
    
    // Step 4: ログインボタンをクリック
    console.log(`📍 Step 4: ログイン実行`);
    
    // ログインボタンを探す
    const loginButton = await page.locator('button:has-text("ログイン"), input[type="submit"]').first();
    
    if (await loginButton.count() > 0) {
      console.log(`   🖱️  ログインボタンをクリック...`);
      
      // ページ遷移を待つ
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
        loginButton.click()
      ]);
      
      // 少し待機
      await page.waitForTimeout(3000);
      
      const afterLoginUrl = page.url();
      const afterLoginTitle = await page.title();
      
      console.log(`   ✅ ログイン実行完了`);
      console.log(`   🌐 現在のURL: ${afterLoginUrl}`);
      console.log(`   📄 現在のタイトル: ${afterLoginTitle}\n`);
      
      // スクリーンショット（ログイン後）
      await page.screenshot({ 
        path: `/home/user/webapp/screenshots/${siteName}-after-login.png`,
        fullPage: true 
      });
      console.log(`   📸 スクリーンショット保存: ${siteName}-after-login.png\n`);
      
      // Step 5: ログイン成功判定
      console.log(`📍 Step 5: ログイン成功判定`);
      
      // URLが変わったか、またはエラーメッセージがないかをチェック
      const hasError = await page.locator('text=/エラー|失敗|認証|incorrect|invalid/i').count() > 0;
      const urlChanged = afterLoginUrl !== siteConfig.url;
      
      if (hasError) {
        console.log(`   ❌ ログイン失敗: エラーメッセージ検出`);
        const errorText = await page.locator('text=/エラー|失敗|認証|incorrect|invalid/i').first().textContent();
        console.log(`   📝 エラー内容: ${errorText}`);
        return { success: false, reason: 'エラーメッセージ検出', error: errorText };
      }
      
      if (urlChanged || afterLoginTitle.includes('管理') || afterLoginTitle.includes('ダッシュボード')) {
        console.log(`   ✅ ログイン成功！`);
        console.log(`   🎉 管理画面にアクセスしました\n`);
        
        // Step 6: 管理画面の機能を調査
        console.log(`📍 Step 6: 管理画面の機能調査`);
        
        // ナビゲーションメニューを取得
        const navLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a, nav a, .menu a, .sidebar a'));
          return links.map(link => ({
            text: link.textContent.trim(),
            href: link.href
          })).filter(link => link.text && link.text.length > 0);
        });
        
        console.log(`   📋 管理画面のメニュー (${navLinks.length}件):`);
        navLinks.slice(0, 20).forEach((link, idx) => {
          console.log(`   [${idx + 1}] ${link.text} -> ${link.href}`);
        });
        
        return { 
          success: true, 
          url: afterLoginUrl, 
          title: afterLoginTitle, 
          menuItems: navLinks 
        };
      } else {
        console.log(`   ⚠️  ログイン状態不明`);
        console.log(`   URL変更なし、エラーメッセージなし`);
        return { success: false, reason: 'ログイン状態不明' };
      }
    } else {
      console.log(`   ❌ ログインボタンが見つかりませんでした`);
      return { success: false, reason: 'ログインボタン未検出' };
    }
    
  } catch (error) {
    console.error(`❌ エラー発生: ${error.message}`);
    await page.screenshot({ 
      path: `/home/user/webapp/screenshots/${siteConfig.name.replace(/\s+/g, '-')}-error.png` 
    });
    return { success: false, reason: 'エラー', error: error.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🔧 広告媒体ログインテストシステム v1.0');
  console.log('━'.repeat(60));
  
  const results = {};
  
  // シティヘブンネットテスト
  results.heavenNet = await testLogin(HEAVEN_NET);
  
  // デリヘルタウンテスト
  results.deliheruTown = await testLogin(DELIHERU_TOWN);
  
  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 テスト結果サマリー');
  console.log('='.repeat(60));
  
  console.log(`\n🌐 ${HEAVEN_NET.name}:`);
  if (results.heavenNet.success) {
    console.log(`   ✅ ログイン成功`);
    console.log(`   📄 タイトル: ${results.heavenNet.title}`);
    console.log(`   🌐 URL: ${results.heavenNet.url}`);
  } else {
    console.log(`   ❌ ログイン失敗: ${results.heavenNet.reason}`);
  }
  
  console.log(`\n🌐 ${DELIHERU_TOWN.name}:`);
  if (results.deliheruTown.success) {
    console.log(`   ✅ ログイン成功`);
    console.log(`   📄 タイトル: ${results.deliheruTown.title}`);
    console.log(`   🌐 URL: ${results.deliheruTown.url}`);
  } else {
    console.log(`   ❌ ログイン失敗: ${results.deliheruTown.reason}`);
  }
  
  // 結果をJSONで保存
  fs.writeFileSync(
    '/home/user/webapp/screenshots/login-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ テスト完了！結果は screenshots/login-test-results.json に保存されました。\n');
}

// 実行
main().catch(console.error);
