/**
 * 現在の残りカウンターを確認するスクリプト
 */

import { chromium } from 'playwright';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function checkRemainingCount() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 現在の残りカウンターを確認します');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    await page.fill('#userid', STORE_ID);
    await page.fill('#passwd', PASSWORD);
    await page.click('#loginBtn');
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン成功\n');

    // MENUボタンをクリック
    console.log('📱 MENUを開いています...');
    await page.locator('a:has-text("MENU一覧")').click();
    await page.waitForTimeout(2000);

    // スクリーンショット
    await page.screenshot({
      path: `screenshots/remaining-count-check-${Date.now()}.png`,
      fullPage: true
    });

    // カウンター情報を取得
    const counterElement = await page.locator('.menu-counter').first();
    const counterText = await counterElement.textContent();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  📊 カウンター表示: ${counterText}`);
    
    if (counterText) {
      const match = counterText.match(/残り(\d+)\/(\d+)回/);
      if (match) {
        const remaining = parseInt(match[1]);
        const total = parseInt(match[2]);
        console.log(`  📊 残り回数: ${remaining}/${total}`);
        console.log(`  📊 使用済み: ${total - remaining}/${total}`);
        
        if (remaining === 0) {
          console.log('\n  🎉 すべてのカウンターを使い切りました！');
        } else {
          console.log(`\n  ⚠️  まだ ${remaining}回 残っています`);
        }
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

checkRemainingCount().catch(console.error);
