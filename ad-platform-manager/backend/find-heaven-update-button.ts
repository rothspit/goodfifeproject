#!/usr/bin/env ts-node
/**
 * アイドル学園 - ヘブン更新ボタン探索
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

async function findHeavenUpdateButton() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔍 ヘブン更新ボタン探索');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const credentials = {
    username: '2510055906',
    password: 'OgI70vnH'
  };

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // ブラウザ起動
    console.log('🚀 ブラウザ起動中...\n');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    page = await context.newPage();

    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto('https://spmanager.cityheaven.net/', { 
      waitUntil: 'networkidle' 
    });

    await page.fill('#userid', credentials.username);
    await page.fill('#passwd', credentials.password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#loginBtn')
    ]);

    console.log('✅ ログイン成功\n');

    // ダッシュボードのスクリーンショット
    await page.screenshot({ 
      path: 'screenshots/heaven-button-search-dashboard.png',
      fullPage: true 
    });

    // 「ヘブン更新」を含むすべての要素を検索
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 「ヘブン更新」ボタンを探索中...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // すべてのボタンとリンクを取得
    const buttons = await page.$$eval('button, input[type="button"], input[type="submit"], a', elements =>
      elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        text: el.textContent?.trim() || '',
        value: el.getAttribute('value') || '',
        href: el.getAttribute('href') || '',
        id: el.getAttribute('id') || '',
        class: el.className,
        name: el.getAttribute('name') || ''
      }))
    );

    // 「ヘブン」「更新」を含む要素をフィルタ
    const heavenButtons = buttons.filter(btn => 
      btn.text.includes('ヘブン') || 
      btn.text.includes('更新') ||
      btn.value.includes('ヘブン') ||
      btn.value.includes('更新')
    );

    console.log(`📋 「ヘブン」「更新」関連ボタン: ${heavenButtons.length}個見つかりました\n`);

    if (heavenButtons.length > 0) {
      heavenButtons.forEach((btn, index) => {
        console.log(`${index + 1}. ${btn.tag.toUpperCase()}`);
        if (btn.text) console.log(`   テキスト: ${btn.text}`);
        if (btn.value) console.log(`   値: ${btn.value}`);
        if (btn.id) console.log(`   ID: ${btn.id}`);
        if (btn.name) console.log(`   Name: ${btn.name}`);
        if (btn.class) console.log(`   Class: ${btn.class}`);
        if (btn.href) console.log(`   リンク: ${btn.href}`);
        console.log('');
      });
    }

    // 「ヘブン更新」という正確なテキストを持つボタンを探す
    const exactMatch = heavenButtons.find(btn => 
      btn.text === 'ヘブン更新' || 
      btn.value === 'ヘブン更新'
    );

    if (exactMatch) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 「ヘブン更新」ボタン発見！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`タグ: ${exactMatch.tag}`);
      if (exactMatch.id) console.log(`ID: #${exactMatch.id}`);
      if (exactMatch.name) console.log(`Name: ${exactMatch.name}`);
      if (exactMatch.class) console.log(`Class: .${exactMatch.class}`);
      console.log('');

      // ボタンの周辺要素も確認（残り回数表示があるかも）
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 残り回数表示を探索中...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 「回」「残り」などを含むテキストを検索
      const allText = await page.$$eval('*', elements =>
        elements.map(el => el.textContent?.trim() || '')
          .filter(text => text.length > 0 && text.length < 100)
      );

      const countTexts = allText.filter(text =>
        (text.includes('回') || text.includes('残り') || text.includes('残')) &&
        /\d+/.test(text) // 数字を含む
      );

      if (countTexts.length > 0) {
        console.log('📊 残り回数候補:\n');
        const uniqueTexts = [...new Set(countTexts)].slice(0, 10);
        uniqueTexts.forEach((text, index) => {
          console.log(`${index + 1}. ${text}`);
        });
        console.log('');
      }
    } else {
      console.log('⚠️  正確な「ヘブン更新」ボタンが見つかりませんでした');
      console.log('   手動で確認が必要です\n');
    }

    // すべてのボタン情報をJSON保存
    const buttonData = {
      timestamp: new Date().toISOString(),
      allButtons: buttons.slice(0, 50), // 最初の50個
      heavenButtons,
      exactMatch: exactMatch || null
    };

    fs.writeFileSync(
      'screenshots/heaven-update-buttons.json',
      JSON.stringify(buttonData, null, 2)
    );
    console.log('💾 ボタン情報をJSONファイルに保存');
    console.log('   ファイル: screenshots/heaven-update-buttons.json\n');

    // テストクリック（DRY RUN）
    if (exactMatch) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🧪 テストクリック（DRY RUN）');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      try {
        // セレクタを構築
        let selector = '';
        if (exactMatch.id) {
          selector = `#${exactMatch.id}`;
        } else if (exactMatch.name) {
          selector = `${exactMatch.tag}[name="${exactMatch.name}"]`;
        } else {
          selector = `${exactMatch.tag}:has-text("ヘブン更新")`;
        }

        console.log(`セレクタ: ${selector}`);
        
        const buttonExists = await page.locator(selector).count();
        console.log(`ボタンの存在確認: ${buttonExists > 0 ? '✅ 存在する' : '❌ 見つからない'}\n`);
        
        if (buttonExists > 0) {
          console.log('⚠️  実際のクリックはスキップします（テストモード）');
          console.log('   本番実行時に自動クリックが可能です\n');
        }
      } catch (error: any) {
        console.log(`⚠️  テストクリックエラー: ${error.message}\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 探索完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 次のステップ:');
    console.log('1. screenshots/heaven-update-buttons.json を確認');
    console.log('2. ボタンのセレクタを特定');
    console.log('3. 自動クリック機能を実装');
    console.log('4. タイマー設定を実装\n');

  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: 'screenshots/heaven-button-error.png' 
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

findHeavenUpdateButton().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
