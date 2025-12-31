/**
 * アイドル学園 - 店舗情報更新ボタン調査
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 店舗2（アイドル学園）の認証情報
const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function debugShopInfoUpdate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - 店舗情報更新ボタン調査');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

    // ダッシュボードのスクリーンショット
    const dashboardScreenshot = path.join(screenshotDir, `shop-info-dashboard-${Date.now()}.png`);
    await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    console.log(`📸 ダッシュボードのスクリーンショット: ${dashboardScreenshot}`);

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
    console.log('✅ MENUを開きました');

    // メニュー内の「お店情報」リンクを探す
    console.log('\n🔍 「お店情報」リンクを探索中...');
    const shopInfoElements = await page.evaluate(() => {
      const elements: any[] = [];
      document.querySelectorAll('a').forEach((el) => {
        const text = el.textContent?.trim() || '';
        if (text.includes('お店情報') || text.includes('店舗情報')) {
          elements.push({
            tag: el.tagName.toLowerCase(),
            text: text,
            href: el.getAttribute('href') || '',
            id: el.id || '',
            class: el.className || ''
          });
        }
      });
      return elements;
    });

    console.log(`📊 「お店情報」関連の要素数: ${shopInfoElements.length}`);
    shopInfoElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] "${el.text}"`);
      console.log(`     class: ${el.class}`);
      console.log(`     href: ${el.href}`);
    });

    // 「お店情報」ページに移動
    if (shopInfoElements.length > 0) {
      console.log('\n🔍 「お店情報」ページに移動中...');
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const text = link.textContent?.trim() || '';
          const className = link.className || '';
          if (text.includes('お店情報') && className.includes('menu-shopshokai')) {
            (link as any).click();
            return true;
          }
        }
        return false;
      });
      await page.waitForTimeout(3000);
      console.log('✅ 「お店情報」ページに移動しました');

      // お店情報ページのスクリーンショット
      const shopInfoScreenshot = path.join(screenshotDir, `shop-info-page-${Date.now()}.png`);
      await page.screenshot({ path: shopInfoScreenshot, fullPage: true });
      console.log(`📸 お店情報ページのスクリーンショット: ${shopInfoScreenshot}`);

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

      const elementsPath = path.join(screenshotDir, `shop-info-elements-${Date.now()}.json`);
      fs.writeFileSync(elementsPath, JSON.stringify({ 
        timestamp: new Date().toISOString(), 
        elements: allElements 
      }, null, 2));
      console.log(`📄 要素リスト保存: ${elementsPath}`);
      console.log(`📊 総要素数: ${allElements.length}`);

      // 更新関連の要素を探す
      const updateElements = allElements.filter(el => {
        const text = (el.text || '').toLowerCase();
        return text.includes('更新') || text.includes('update') || text.includes('保存') || text.includes('送信');
      });

      console.log(`\n📊 更新/保存関連の要素数: ${updateElements.length}`);
      updateElements.forEach((el, i) => {
        console.log(`  ${i + 1}. [${el.tag}] "${el.text}"`);
        console.log(`     class: ${el.class}`);
        console.log(`     type: ${el.type}`);
        console.log(`     href: ${el.href}`);
      });
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
    console.log('\n✅ ブラウザを閉じました');
  }
}

debugShopInfoUpdate().catch(console.error);
