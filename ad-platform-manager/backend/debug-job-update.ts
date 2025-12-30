/**
 * アイドル学園 - ジョブ更新ボタン調査
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 店舗2（アイドル学園）の認証情報
const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

async function debugJobUpdate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - ジョブ更新ボタン調査');
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
    isMobile: false, // PC版として表示
  });

  const page = await context.newPage();

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
      
      // 上部100pxの範囲内の要素を取得
      document.querySelectorAll('a, button').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < 200) { // 上部200px以内
          const text = el.textContent?.trim() || '';
          const value = el.getAttribute('value') || '';
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
      });
      
      return elements;
    });

    console.log(`📊 上部要素数: ${topElements.length}`);
    topElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] ${el.text} (top: ${el.top}px, left: ${el.left}px)`);
    });

    // 「ジョブ」「求人」「更新」関連の要素を探す
    const jobUpdateElements = topElements.filter(el => {
      const text = el.text?.toLowerCase() || '';
      return text.includes('ジョブ') || text.includes('job') || text.includes('求人') || 
             text.includes('更新') || text.includes('update');
    });

    console.log(`\n📊 ジョブ/更新関連の要素数: ${jobUpdateElements.length}`);
    jobUpdateElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] ${el.text}`);
      console.log(`     位置: (top: ${el.top}px, left: ${el.left}px)`);
      console.log(`     class: ${el.class}`);
      console.log(`     href: ${el.href}`);
    });

    // ページ上部の全要素を取得
    console.log('\n🔍 ページ上部の全要素を探索中...');
    const topElements = await page.evaluate(() => {
      const elements: any[] = [];
      
      // 上部100pxの範囲内の要素を取得
      document.querySelectorAll('a, button').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < 200) { // 上部200px以内
          const text = el.textContent?.trim() || '';
          const value = el.getAttribute('value') || '';
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
      });
      
      return elements;
    });

    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const topElementsPath = path.join(screenshotDir, `job-update-pc-top-elements-${Date.now()}.json`);
    fs.writeFileSync(topElementsPath, JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      elements: topElements 
    }, null, 2));
    console.log(`📄 上部要素リスト保存: ${topElementsPath}`);

    console.log(`📊 上部要素数: ${topElements.length}`);
    topElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] ${el.text} (top: ${el.top}px, left: ${el.left}px)`);
    });

    // 「ジョブ」「求人」「更新」関連の要素を探す
    const jobUpdateElements = topElements.filter(el => {
      const text = el.text?.toLowerCase() || '';
      return text.includes('ジョブ') || text.includes('job') || text.includes('求人') || 
             text.includes('更新') || text.includes('update');
    });

    console.log(`\n📊 ジョブ/更新関連の要素数: ${jobUpdateElements.length}`);
    jobUpdateElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.tag}] ${el.text}`);
      console.log(`     位置: (top: ${el.top}px, left: ${el.left}px)`);
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

debugJobUpdate().catch(console.error);
