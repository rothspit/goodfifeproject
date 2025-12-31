/**
 * 残り12回のカウンターをすべて今すぐ使い切るスクリプト
 * 「更新ボタン」を連続でクリックする
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

interface UpdateLog {
  attemptNumber: number;
  timestamp: string;
  remainingBefore: string;
  remainingAfter: string;
  success: boolean;
  error?: string;
}

async function useAllRemainingCounts() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 残り12回のカウンターを今すぐすべて使い切ります！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  const logs: UpdateLog[] = [];
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const logsDir = path.join(__dirname, 'logs');

  try {
    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    await page.fill('#userid', STORE_ID);
    await page.fill('#passwd', PASSWORD);
    await page.click('#loginBtn');
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン成功\n');

    // 初回の残りカウント確認
    console.log('📊 初期状態を確認中...\n');
    
    let attemptCount = 0;
    const maxAttempts = 20; // 安全のため最大20回

    while (attemptCount < maxAttempts) {
      attemptCount++;
      
      console.log(`━━━ 更新 ${attemptCount}回目 ━━━`);
      
      const timestamp = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      try {
        // ダッシュボードへ戻る
        await page.goto('https://spmanager.cityheaven.net/H1Main.php?shopdir=cb_idolgakuen_f', {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(1500);

        // 残りカウント取得（before）
        const bodyTextBefore = await page.locator('body').textContent() || '';
        const matchBefore = bodyTextBefore.match(/残り(\d+)\/(\d+)回/);
        const remainingBefore = matchBefore ? `${matchBefore[1]}/${matchBefore[2]}` : '不明';
        console.log(`  📊 実行前: ${remainingBefore}`);

        // 残りが0なら終了
        if (remainingBefore.startsWith('0/')) {
          console.log('\n🎉 すべてのカウンターを使い切りました！');
          break;
        }

        // 「更新ボタン」をクリック
        console.log('  🔄 更新ボタンをクリック中...');
        
        // ダイアログハンドラー設定
        page.once('dialog', async dialog => {
          console.log(`  ⚠️  ダイアログ: ${dialog.message()}`);
          await dialog.accept();
        });

        // 更新ボタンを探してクリック（複数の方法を試す）
        let clicked = false;
        
        // 方法1: テキストで探す
        const updateLink = await page.locator('a:has-text("更新ボタン")').first();
        if (await updateLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await updateLink.click();
          clicked = true;
        }

        if (!clicked) {
          // 方法2: class指定
          const updateButton = await page.locator('.menu-update-btn, .update-btn, a[href*="update"]').first();
          if (await updateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await updateButton.click();
            clicked = true;
          }
        }

        if (!clicked) {
          console.log('  ❌ 更新ボタンが見つかりません');
          logs.push({
            attemptNumber: attemptCount,
            timestamp,
            remainingBefore,
            remainingAfter: '不明',
            success: false,
            error: '更新ボタンが見つかりません',
          });
          break;
        }

        await page.waitForTimeout(3000);
        
        // ページをリロードして最新の状態を取得
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // 残りカウント取得（after）
        const bodyTextAfter = await page.locator('body').textContent() || '';
        const matchAfter = bodyTextAfter.match(/残り(\d+)\/(\d+)回/);
        const remainingAfter = matchAfter ? `${matchAfter[1]}/${matchAfter[2]}` : '不明';
        console.log(`  📊 実行後: ${remainingAfter}`);

        // スクリーンショット
        const screenshotPath = path.join(screenshotsDir, `bulk-update-${attemptCount}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  📸 保存: bulk-update-${attemptCount}-*.png`);

        logs.push({
          attemptNumber: attemptCount,
          timestamp,
          remainingBefore,
          remainingAfter,
          success: true,
        });

        console.log('  ✅ 更新完了\n');

        // 残りが0になったら終了
        if (remainingAfter.startsWith('0/')) {
          console.log('🎉 すべてのカウンターを使い切りました！');
          break;
        }

        // 次の更新まで少し待機
        await page.waitForTimeout(2000);

      } catch (error: any) {
        console.error(`  ❌ エラー: ${error.message}\n`);
        logs.push({
          attemptNumber: attemptCount,
          timestamp,
          remainingBefore: '不明',
          remainingAfter: '不明',
          success: false,
          error: error.message,
        });
      }
    }

    // ログ保存
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(logsDir, `bulk-updates-${today}.json`);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ すべての処理が完了しました');
    console.log(`  📊 実行回数: ${logs.length}回`);
    console.log(`  📊 成功: ${logs.filter(l => l.success).length}回`);
    console.log(`  📝 ログ: ${logPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

useAllRemainingCounts().catch(console.error);
