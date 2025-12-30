/**
 * カウンターの更新ページを開いて残りカウンターを確認
 */

import { chromium } from 'playwright';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function checkCounterPage() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 カウンターページで残り回数を確認します');
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

    // カウンターの更新をクリック
    console.log('🔄 カウンターの更新ページを開いています...');
    await page.locator('text=カウンターの更新').click();
    await page.waitForTimeout(2000);

    // スクリーンショット
    const screenshotPath = path.join(__dirname, 'screenshots', `counter-page-${Date.now()}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 スクリーンショット: ${screenshotPath}\n`);

    // ページのテキストを全て取得
    const bodyText = await page.locator('body').textContent();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📄 ページ内容:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (bodyText) {
      // 残り回数を探す
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
      lines.forEach(line => {
        if (line.includes('残り') || line.includes('回') || line.includes('更新') || line.includes('カウンター')) {
          console.log(`  ${line}`);
        }
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

checkCounterPage().catch(console.error);
