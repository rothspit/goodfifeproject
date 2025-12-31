/**
 * アイドル学園 - ヘブン更新ボタンクリックのデバッグテスト
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function debugTest() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔍 ヘブン更新ボタンクリック - デバッグテスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#userid', STORE_ID);
    await page.fill('#passwd', PASSWORD);
    await page.click('#loginBtn');
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン成功\n');

    // ダッシュボードのURL確認
    const dashboardUrl = page.url();
    console.log(`📍 現在のURL: ${dashboardUrl}\n`);

    // 更新ボタンの情報を取得
    console.log('🔍 更新ボタンを探索中...');
    const buttonInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const updateButtons = [];
      
      for (const link of links) {
        if (link.textContent && link.textContent.includes('更新ボタン')) {
          updateButtons.push({
            text: link.textContent.trim(),
            href: (link as HTMLAnchorElement).href,
            class: link.className,
            visible: (link as HTMLElement).offsetParent !== null,
            display: window.getComputedStyle(link).display,
            visibility: window.getComputedStyle(link).visibility,
          });
        }
      }
      return updateButtons;
    });

    console.log('📊 更新ボタン情報:');
    console.log(JSON.stringify(buttonInfo, null, 2));
    console.log('');

    // 残り回数を取得
    const remainingBefore = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const text = el.textContent || '';
        if (text.includes('残り') && text.includes('回')) {
          return text.trim();
        }
      }
      return '';
    });
    console.log(`📊 実行前の残り回数: ${remainingBefore}\n`);

    // スクリーンショット（クリック前）
    await page.screenshot({ path: path.join(__dirname, 'screenshots', 'debug-before-click.png'), fullPage: true });
    console.log('📸 スクリーンショット保存: debug-before-click.png\n');

    // ボタンをクリック
    console.log('🔄 ヘブン更新ボタンをクリック中...');
    
    // 方法1: ネイティブクリック
    try {
      const button = await page.locator('text=更新ボタン').first();
      await button.click({ timeout: 10000 });
      console.log('✅ 方法1（ネイティブクリック）成功');
    } catch (error) {
      console.log('❌ 方法1（ネイティブクリック）失敗:', (error as Error).message);
      
      // 方法2: JavaScriptクリック
      try {
        await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          for (const link of links) {
            if (link.textContent && link.textContent.includes('更新ボタン')) {
              (link as any).click();
              return;
            }
          }
          throw new Error('更新ボタンが見つかりません');
        });
        console.log('✅ 方法2（JavaScriptクリック）成功');
      } catch (error2) {
        console.log('❌ 方法2（JavaScriptクリック）失敗:', (error2 as Error).message);
      }
    }

    await page.waitForTimeout(3000);

    // ダイアログ確認
    console.log('\n🔍 ダイアログ確認中...');
    const dialogFound = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('最終更新日時を更新します');
    });

    if (dialogFound) {
      console.log('✅ ダイアログ発見');
      await page.screenshot({ path: path.join(__dirname, 'screenshots', 'debug-dialog.png'), fullPage: true });
      console.log('📸 スクリーンショット保存: debug-dialog.png');
      
      try {
        await page.click('text=OK', { timeout: 5000 });
        console.log('✅ OKボタンをクリック');
        await page.waitForTimeout(3000);
      } catch (error) {
        console.log('❌ OKボタンのクリック失敗:', (error as Error).message);
      }
    } else {
      console.log('⚠️ ダイアログが見つかりません');
    }

    // ページリロード
    console.log('\n🔄 ページリロード中...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('✅ ページリロード完了\n');

    // 残り回数を再取得
    const remainingAfter = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const text = el.textContent || '';
        if (text.includes('残り') && text.includes('回')) {
          return text.trim();
        }
      }
      return '';
    });
    console.log(`📊 実行後の残り回数: ${remainingAfter}\n`);

    // 最終更新日時を取得
    const lastUpdate = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const match = text.match(/最終更新日時.*?(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})/);
      return match ? match[1] : '不明';
    });
    console.log(`📅 最終更新日時: ${lastUpdate}\n`);

    // スクリーンショット（クリック後）
    await page.screenshot({ path: path.join(__dirname, 'screenshots', 'debug-after-click.png'), fullPage: true });
    console.log('📸 スクリーンショット保存: debug-after-click.png\n');

    // 比較結果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📊 結果サマリー');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`実行前の残り回数: ${remainingBefore}`);
    console.log(`実行後の残り回数: ${remainingAfter}`);
    console.log(`最終更新日時: ${lastUpdate}`);
    console.log(`変化: ${remainingBefore !== remainingAfter ? '✅ 減少' : '❌ 変化なし'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

debugTest().catch(console.error);
