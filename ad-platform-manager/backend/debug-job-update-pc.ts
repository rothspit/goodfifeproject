/**
 * アイドル学園 - ジョブ更新ボタン調査（PC版）
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 店舗2（アイドル学園）の認証情報
const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function debugJobUpdatePC() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - ジョブ更新ボタン調査（PC版）');
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

    // ダッシュボード全体のスクリーンショット（PC版）
    const dashboardScreenshot = path.join(screenshotDir, `job-update-pc-dashboard-${Date.now()}.png`);
    await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    console.log(`📸 PC版ダッシュボードのスクリーンショット: ${dashboardScreenshot}`);

    // ページ上部の全要素を取得
    console.log('\n🔍 ページ上部の全要素を探索中...');
    const topElements = await page.evaluate(() => {
      const elements: any[] = [];
      
      // 上部300pxの範囲内の要素を取得
      document.querySelectorAll('a, button').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < 300) { // 上部300px以内
          const text = el.textContent?.trim() || '';
          const value = el.getAttribute('value') || '';
          if (text || value) {
            elements.push({
              tag: el.tagName.toLowerCase(),
              text: text || value,
              href: el.getAttribute('href') || '',
              id: el.id || '',
              class: el.className || '',
              top: Math.round(rect.top),
              left: Math.round(rect.left)
            });
          }
        }
      });
      
      return elements;
    });

    const topElementsPath = path.join(screenshotDir, `job-update-pc-top-elements-${Date.now()}.json`);
    fs.writeFileSync(topElementsPath, JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      elements: topElements 
    }, null, 2));
    console.log(`📄 上部要素リスト保存: ${topElementsPath}`);
    console.log(`📊 上部要素数: ${topElements.length}`);

    // 最初の10個を表示
    console.log('\n📋 上部の主要要素（最初の20個）:');
    topElements.slice(0, 20).forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] "${el.text.substring(0, 50)}" (top: ${el.top}px)`);
    });

    // 「求人管理」タブをクリック
    console.log('\n🔍 「求人管理」タブをクリック中...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const text = link.textContent?.trim() || '';
        if (text === '求人管理' && link.className.includes('header-link')) {
          (link as any).click();
          return true;
        }
      }
      return false;
    });
    await page.waitForTimeout(3000);
    console.log('✅ 「求人管理」ページに移動');

    // 求人管理ページのスクリーンショット
    const recruitPageScreenshot = path.join(screenshotDir, `job-update-pc-recruit-page-${Date.now()}.png`);
    await page.screenshot({ path: recruitPageScreenshot, fullPage: true });
    console.log(`📸 求人管理ページのスクリーンショット: ${recruitPageScreenshot}`);

    // 求人管理ページの全要素を取得
    console.log('\n🔍 求人管理ページの全要素を探索中...');
    const recruitPageElements = await page.evaluate(() => {
      const elements: any[] = [];
      
      document.querySelectorAll('a, button').forEach((el) => {
        const text = el.textContent?.trim() || '';
        if (text) {
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

    const recruitPageElementsPath = path.join(screenshotDir, `job-update-pc-recruit-page-elements-${Date.now()}.json`);
    fs.writeFileSync(recruitPageElementsPath, JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      elements: recruitPageElements 
    }, null, 2));
    console.log(`📄 求人管理ページ要素リスト保存: ${recruitPageElementsPath}`);
    console.log(`📊 要素数: ${recruitPageElements.length}`);

    // 「更新」「ジョブ」関連の要素を探す
    const jobUpdateButtons = recruitPageElements.filter(el => {
      const text = el.text?.toLowerCase() || '';
      return text.includes('更新') || text.includes('update') || text.includes('ジョブ') || text.includes('job');
    });

    console.log(`\n📊 ジョブ/更新関連の要素数: ${jobUpdateButtons.length}`);
    jobUpdateButtons.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] "${el.text}"`);
      console.log(`     class: ${el.class}`);
      console.log(`     href: ${el.href}`);
    });

    // 「カウンターの更新」ボタンをクリックして実際に更新する
    console.log('\n🔄 ジョブ更新を実行中...');
    
    // ダイアログハンドリング設定
    page.once('dialog', async (dialog) => {
      console.log(`📢 ダイアログ検出: "${dialog.message()}"`);
      await dialog.accept();
      console.log('✅ ダイアログを承認しました');
    });

    // 「カウンターの更新」をクリック
    const clicked = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const text = link.textContent?.trim() || '';
        const className = link.className || '';
        if (text === 'カウンターの更新' && className.includes('menu-counter')) {
          (link as any).click();
          return true;
        }
      }
      return false;
    });
    
    if (clicked) {
      console.log('✅ 「カウンターの更新」をクリックしました');
      await page.waitForTimeout(3000);
      
      // 更新後のスクリーンショット
      const afterScreenshotPath = path.join(screenshotDir, `job-update-pc-after-${Date.now()}.png`);
      await page.screenshot({ path: afterScreenshotPath, fullPage: true });
      console.log('📸 更新後のスクリーンショット:', afterScreenshotPath);
      
      // ページをリロードして最新の残り回数を取得
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.evaluate(() => document.body.textContent || '');
      const remainingMatch = pageText.match(/残り(\d+\/\d+)回/);
      if (remainingMatch) {
        console.log(`📊 更新後の残り回数: ${remainingMatch[1]}`);
      }
    } else {
      console.log('❌ 「カウンターの更新」ボタンが見つかりませんでした');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
    console.log('\n✅ ブラウザを閉じました');
  }
}

debugJobUpdatePC().catch(console.error);
