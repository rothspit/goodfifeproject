#!/usr/bin/env ts-node
/**
 * アイドル学園（店舗2）- 管理画面詳細調査
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function exploreAdminPanel() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - 管理画面詳細調査');
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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.fill('input[name="id"]', credentials.username);
    await page.fill('input[name="pass"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"]');
    
    await page.waitForTimeout(3000);
    console.log('✅ ログイン完了\n');

    // スクリーンショット保存
    await page.screenshot({ 
      path: 'screenshots/idol-gakuen-dashboard.png', 
      fullPage: true 
    });
    console.log('📸 スクリーンショット保存: idol-gakuen-dashboard.png\n');

    // 現在のURL取得
    const currentUrl = page.url();
    console.log(`📍 現在のURL: ${currentUrl}\n`);

    // ページタイトル取得
    const title = await page.title();
    console.log(`📄 ページタイトル: ${title}\n`);

    // メニュー構造を取得
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 メニュー構造調査:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 全てのリンクを取得
    const links = await page.$$eval('a', (elements) => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        href: el.getAttribute('href') || '',
        class: el.className
      })).filter(link => link.text && link.text.length > 0)
    );

    console.log(`🔗 リンク総数: ${links.length}件\n`);

    // キャスト関連リンク
    const castLinks = links.filter(link => 
      link.text.includes('キャスト') || 
      link.text.includes('女の子') ||
      link.text.includes('在籍') ||
      link.href.includes('cast')
    );

    if (castLinks.length > 0) {
      console.log('👥 キャスト関連リンク:');
      castLinks.forEach(link => {
        console.log(`   • ${link.text}`);
        console.log(`     URL: ${link.href}\n`);
      });
    }

    // 写メ日記関連リンク
    const diaryLinks = links.filter(link => 
      link.text.includes('日記') || 
      link.text.includes('写メ') ||
      link.text.includes('ダイアリー') ||
      link.href.includes('diary') ||
      link.href.includes('blog')
    );

    if (diaryLinks.length > 0) {
      console.log('📸 写メ日記関連リンク:');
      diaryLinks.forEach(link => {
        console.log(`   • ${link.text}`);
        console.log(`     URL: ${link.href}\n`);
      });
    }

    // メインメニューを抽出（nav要素内）
    const navMenus = await page.$$eval('nav a, .menu a, .navigation a', (elements) => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        href: el.getAttribute('href') || ''
      })).filter(link => link.text)
    );

    if (navMenus.length > 0) {
      console.log('🧭 ナビゲーションメニュー:');
      navMenus.forEach(menu => {
        console.log(`   • ${menu.text}: ${menu.href}`);
      });
      console.log('');
    }

    // 写メ日記投稿ページへ移動を試みる
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 写メ日記投稿ページを探索:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 一般的な日記投稿ページのパターン
    const possibleDiaryUrls = [
      'https://spmanager.cityheaven.net/diary/new',
      'https://spmanager.cityheaven.net/diary/create',
      'https://spmanager.cityheaven.net/diary/add',
      'https://spmanager.cityheaven.net/blog/new',
      'https://spmanager.cityheaven.net/photo_diary/new'
    ];

    for (const diaryUrl of possibleDiaryUrls) {
      try {
        console.log(`🔍 試行: ${diaryUrl}`);
        const response = await page.goto(diaryUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        
        if (response && response.ok()) {
          console.log(`✅ アクセス成功: ${diaryUrl}\n`);
          
          // スクリーンショット
          await page.screenshot({ 
            path: 'screenshots/idol-gakuen-diary-form.png',
            fullPage: true 
          });
          console.log('📸 投稿フォームのスクリーンショット保存\n');

          // フォーム構造を解析
          const formInputs = await page.$$eval('input, textarea, select', (elements) =>
            elements.map(el => ({
              type: el.getAttribute('type') || el.tagName.toLowerCase(),
              name: el.getAttribute('name') || '',
              id: el.getAttribute('id') || '',
              placeholder: el.getAttribute('placeholder') || '',
              required: el.hasAttribute('required')
            })).filter(input => input.name || input.id)
          );

          console.log('📝 フォーム項目:');
          formInputs.forEach(input => {
            console.log(`   • ${input.type.toUpperCase()}: ${input.name || input.id}`);
            if (input.placeholder) {
              console.log(`     プレースホルダー: ${input.placeholder}`);
            }
            if (input.required) {
              console.log('     必須項目 ✅');
            }
            console.log('');
          });

          break;
        }
      } catch (error) {
        console.log(`❌ アクセス失敗: ${diaryUrl}\n`);
      }
    }

    // もしリンクから日記関連があれば、それをクリック
    if (diaryLinks.length > 0) {
      try {
        const firstDiaryLink = diaryLinks[0];
        console.log(`\n🔗 日記リンクをクリック: ${firstDiaryLink.text}`);
        
        await page.click(`a:has-text("${firstDiaryLink.text}")`);
        await page.waitForTimeout(3000);
        
        const diaryPageUrl = page.url();
        console.log(`📍 日記ページURL: ${diaryPageUrl}\n`);
        
        await page.screenshot({ 
          path: 'screenshots/idol-gakuen-diary-page.png',
          fullPage: true 
        });
        console.log('📸 日記ページのスクリーンショット保存\n');
        
      } catch (error) {
        console.log('⚠️  日記リンクのクリックに失敗\n');
      }
    }

    // 全メニュー構造をJSON保存
    const menuStructure = {
      currentUrl,
      title,
      allLinks: links.slice(0, 50), // 最初の50件のみ
      castLinks,
      diaryLinks,
      navMenus,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      'screenshots/idol-gakuen-menu-structure.json',
      JSON.stringify(menuStructure, null, 2)
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ メニュー構造をJSONファイルに保存');
    console.log('   ファイル: screenshots/idol-gakuen-menu-structure.json');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 管理画面調査完了！\n');
    console.log('次のステップ:');
    console.log('1. スクリーンショットを確認');
    console.log('2. JSONファイルでメニュー構造を確認');
    console.log('3. 写メ日記投稿フォームのセレクタを特定');
    console.log('4. postDiary()メソッドを実装\n');

  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: 'screenshots/idol-gakuen-error.png' 
      });
      console.log('📸 エラー時のスクリーンショット保存\n');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

exploreAdminPanel().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
