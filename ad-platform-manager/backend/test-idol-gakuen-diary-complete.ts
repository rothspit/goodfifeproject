#!/usr/bin/env ts-node
/**
 * アイドル学園 - 写メ日記投稿完全実装テスト
 * 
 * このスクリプトは以下を実行します：
 * 1. ログイン
 * 2. 写メ日記投稿フォームへ移動
 * 3. フォーム要素を特定
 * 4. テスト投稿を実行（オプション）
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface DiaryPostData {
  castId?: string;
  castName: string;
  title: string;
  content: string;
  images?: string[];
}

async function testIdolGakuenDiaryPost(dryRun: boolean = true) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - 写メ日記投稿完全テスト');
  if (dryRun) {
    console.log('  ⚠️  DRY RUNモード（実際には投稿しません）');
  } else {
    console.log('  🔴 本番モード（実際に投稿します！）');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const credentials = {
    username: '2510055906',
    password: 'OgI70vnH'
  };

  const testDiary: DiaryPostData = {
    castName: 'あいり',
    title: '今日も元気に出勤中です💕',
    content: `
こんにちは！あいりです✨

今日もアイドル学園で元気に出勤しています！
お天気も良くて気持ちいいですね🌞

みなさんのご来店お待ちしております😊

#アイドル学園 #出勤情報 #会いに来てね
    `.trim(),
    images: []
  };

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
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

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
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

    const loginUrl = page.url();
    if (loginUrl.includes('H1Main.php')) {
      console.log('✅ ログイン成功\n');
    } else {
      throw new Error('ログイン失敗');
    }

    // ダッシュボードのスクリーンショット
    await page.screenshot({ 
      path: 'screenshots/idol-dashboard.png',
      fullPage: true 
    });
    console.log('📸 ダッシュボードのスクリーンショット保存\n');

    // 写メ日記ページへ移動
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 写メ日記ページへ移動:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 一般的なパターンをすべて試す
    const diaryUrls = [
      // パターン1: 直接URL
      'https://spmanager.cityheaven.net/H8KeitaiDiaryList.php',
      
      // パターン2: shop情報付き
      'https://spmanager.cityheaven.net/H8KeitaiDiaryList.php?shopdir=idol-gakuen',
      
      // パターン3: 新規投稿
      'https://spmanager.cityheaven.net/H8KeitaiDiary.php',
      'https://spmanager.cityheaven.net/H8KeitaiDiary.php?mode=new'
    ];

    let diaryPageFound = false;
    let foundUrl = '';

    for (const url of diaryUrls) {
      try {
        console.log(`🔍 試行: ${url}`);
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        console.log(`   現在のURL: ${currentUrl}`);
        console.log(`   ページタイトル: ${pageTitle}`);
        
        // エラーページでないか確認
        if (!currentUrl.includes('error') && !pageTitle.includes('エラー')) {
          diaryPageFound = true;
          foundUrl = url;
          console.log(`   ✅ アクセス成功！\n`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ アクセス失敗\n`);
      }
    }

    if (!diaryPageFound) {
      console.log('⚠️  写メ日記ページへの直接アクセスが難しいようです');
      console.log('   メニューからリンクを探します...\n');
      
      // ダッシュボードに戻る
      await page.goto('https://spmanager.cityheaven.net/H1Main.php', {
        waitUntil: 'networkidle'
      });
      
      // ページ内の全リンクを取得
      const allLinks = await page.$$eval('a', elements =>
        elements.map(el => ({
          text: el.textContent?.trim() || '',
          href: el.getAttribute('href') || ''
        })).filter(link => link.text)
      );
      
      // 日記関連のリンクを探す
      const diaryLinks = allLinks.filter(link =>
        link.text.includes('日記') ||
        link.text.includes('写メ') ||
        link.text.includes('ダイアリー') ||
        link.href.includes('diary') ||
        link.href.includes('Diary')
      );
      
      console.log(`📋 日記関連リンク: ${diaryLinks.length}件見つかりました\n`);
      
      if (diaryLinks.length > 0) {
        diaryLinks.forEach((link, index) => {
          console.log(`${index + 1}. ${link.text}`);
          console.log(`   ${link.href}\n`);
        });
        
        // 最初の日記リンクをクリック
        const firstLink = diaryLinks[0];
        console.log(`🔗 「${firstLink.text}」をクリック...\n`);
        
        try {
          await page.click(`a:has-text("${firstLink.text}")`);
          await page.waitForLoadState('networkidle');
          foundUrl = page.url();
          diaryPageFound = true;
          console.log(`✅ 写メ日記ページへ移動成功: ${foundUrl}\n`);
        } catch (error) {
          console.log('❌ リンククリック失敗\n');
        }
      }
    }

    if (!diaryPageFound) {
      console.log('❌ 写メ日記ページが見つかりませんでした');
      console.log('   管理画面の構造を手動で確認する必要があります\n');
      return;
    }

    // 写メ日記ページのスクリーンショット
    await page.screenshot({ 
      path: 'screenshots/idol-diary-page.png',
      fullPage: true 
    });
    console.log('📸 写メ日記ページのスクリーンショット保存\n');

    // フォーム要素を探す
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 フォーム要素の調査:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const formInputs = await page.$$eval('input, textarea, select', elements =>
      elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.getAttribute('id') || '',
        placeholder: el.getAttribute('placeholder') || '',
        value: el.getAttribute('value') || ''
      })).filter(input => input.name || input.id)
    );

    console.log(`📝 入力フィールド: ${formInputs.length}個見つかりました\n`);
    
    if (formInputs.length > 0) {
      formInputs.forEach((input, index) => {
        console.log(`${index + 1}. ${input.tag.toUpperCase()}`);
        if (input.type) console.log(`   type: ${input.type}`);
        if (input.name) console.log(`   name: ${input.name}`);
        if (input.id) console.log(`   id: ${input.id}`);
        if (input.placeholder) console.log(`   placeholder: ${input.placeholder}`);
        console.log('');
      });

      // フォーム情報をJSON保存
      const formStructure = {
        url: foundUrl,
        timestamp: new Date().toISOString(),
        inputs: formInputs
      };

      fs.writeFileSync(
        'screenshots/idol-diary-form-structure.json',
        JSON.stringify(formStructure, null, 2)
      );
      console.log('💾 フォーム構造をJSONファイルに保存');
      console.log('   ファイル: screenshots/idol-diary-form-structure.json\n');
    }

    // DRYRUNモードでない場合は実際に投稿
    if (!dryRun) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔴 実際の投稿を実行します:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('⚠️  この機能は実装が必要です');
      console.log('   フォーム構造のJSONファイルを確認して、');
      console.log('   適切なセレクタを使用してください\n');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ DRY RUNモード - 実際の投稿はスキップ');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🎉 テスト完了！\n');
    console.log('📋 次のステップ:');
    console.log('1. screenshots/idol-diary-form-structure.json を確認');
    console.log('2. フォーム要素のセレクタを特定');
    console.log('3. 実際の投稿コードを実装');
    console.log('4. 本番モードでテスト実行\n');

  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: 'screenshots/idol-diary-error.png',
        fullPage: true 
      });
      console.log('📸 エラー時のスクリーンショット保存\n');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// コマンドライン引数でモード切り替え
const dryRun = !process.argv.includes('--real');

testIdolGakuenDiaryPost(dryRun).catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
