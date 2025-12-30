/**
 * アイドル学園 - イベント情報更新ボタン調査
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function debugEventUpdate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - イベント情報更新ボタン調査');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  const page = await context.newPage();
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('\n🔐 ログイン中...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#userid', STORE_ID);
    await page.fill('#passwd', PASSWORD);
    await page.click('#loginBtn');
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン成功');

    // MENUを開く
    console.log('\n📂 MENUを開く...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const text = link.textContent || '';
        if (text.includes('MENU一覧') || link.id === 'open-menu') {
          (link as any).click();
          return true;
        }
      }
      return false;
    });
    await page.waitForTimeout(2000);

    // 「イベント」ページに移動
    console.log('\n🔍 「イベント」ページに移動中...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const text = link.textContent?.trim() || '';
        const className = link.className || '';
        if (text.includes('イベント') && className.includes('menu-event')) {
          (link as any).click();
          return true;
        }
      }
      return false;
    });
    await page.waitForTimeout(3000);
    console.log('✅ 「イベント」ページに移動しました');

    // スクリーンショット
    const screenshot = path.join(screenshotDir, `event-page-${Date.now()}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    console.log(`📸 スクリーンショット: ${screenshot}`);

    // ページ内の全要素を取得
    const allElements = await page.evaluate(() => {
      const elements: any[] = [];
      document.querySelectorAll('a, button, input[type="submit"]').forEach((el) => {
        const text = el.textContent?.trim() || '';
        const value = el.getAttribute('value') || '';
        if (text || value) {
          elements.push({
            tag: el.tagName.toLowerCase(),
            text: text || value,
            href: el.getAttribute('href') || '',
            id: el.id || '',
            class: el.className || '',
            type: el.getAttribute('type') || ''
          });
        }
      });
      return elements;
    });

    const elementsPath = path.join(screenshotDir, `event-elements-${Date.now()}.json`);
    fs.writeFileSync(elementsPath, JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      elements: allElements 
    }, null, 2));
    console.log(`📄 要素リスト保存: ${elementsPath}`);
    console.log(`📊 総要素数: ${allElements.length}`);

    // 更新/新規作成関連の要素を探す
    const updateElements = allElements.filter(el => {
      const text = (el.text || '').toLowerCase();
      return text.includes('更新') || text.includes('新規') || text.includes('登録') || text.includes('作成');
    });

    console.log(`\n📊 更新/新規作成関連の要素数: ${updateElements.length}`);
    updateElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] "${el.text}"`);
      console.log(`     class: ${el.class}`);
      console.log(`     href: ${el.href}`);
    });

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
    console.log('\n✅ ブラウザを閉じました');
  }
}

debugEventUpdate().catch(console.error);
