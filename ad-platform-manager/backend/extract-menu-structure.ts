/**
 * シティヘブンネット メニュー構造を抽出
 */
import { chromium } from 'playwright';
import * as fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP'
  });
  const page = await context.newPage();
  
  try {
    // ログイン
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'networkidle' });
    await page.fill('#userid', '2500000713');
    await page.fill('#passwd', 'ZKs60jlq');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#loginBtn')
    ]);
    
    console.log('✅ ログイン成功\n');
    
    // ダッシュボードのHTMLを取得
    const html = await page.content();
    
    // HTMLをファイルに保存
    fs.writeFileSync('./screenshots/dashboard.html', html, 'utf8');
    console.log('📄 ダッシュボードHTMLを保存しました');
    
    // メニューアイテムをJavaScriptで抽出
    const menuItems = await page.$$eval('a', (anchors) => {
      return anchors
        .map(anchor => ({
          text: (anchor.textContent || '').trim().substring(0, 50),
          href: anchor.href
        }))
        .filter(item => item.href.includes('.php') && item.text);
    });
    
    console.log('\n📋 抽出されたメニューアイテム:\n');
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.text}`);
      console.log(`   URL: ${item.href}\n`);
    });
    
    // メニューをJSONに保存
    fs.writeFileSync('./screenshots/menu-structure.json', JSON.stringify(menuItems, null, 2), 'utf8');
    console.log('💾 メニュー構造をJSONに保存しました');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

main();
