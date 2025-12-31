/**
 * シティヘブンネット 写メ日記フォーム詳細分析
 * 実際の投稿に必要なフィールドを特定
 */
import { chromium } from 'playwright';
import * as fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP'
  });
  const page = await context.newPage();
  
  try {
    console.log('===== 写メ日記フォーム詳細分析 =====\n');
    
    // ログイン
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'networkidle' });
    await page.fill('#userid', '2500000713');
    await page.fill('#passwd', 'ZKs60jlq');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#loginBtn')
    ]);
    
    console.log('✅ ログイン成功\n');
    
    // 写メ日記投稿ページに直接アクセス
    const diaryUrls = [
      'https://spmanager.cityheaven.net/H8KeitaiDiaryEdit.php?shopdir=cb_hitozuma_mitsu',
      'https://spmanager.cityheaven.net/H8KeitaiDiaryList.php?shopdir=cb_hitozuma_mitsu'
    ];
    
    for (const url of diaryUrls) {
      try {
        console.log(`\n📝 アクセス中: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        
        // ページタイトル確認
        const title = await page.title();
        console.log(`   ページタイトル: ${title}`);
        
        // 全てのinput要素を取得
        const inputs = await page.$$eval('input', elements => 
          elements.map((el: any) => ({
            type: el.type,
            name: el.name,
            id: el.id,
            value: el.value,
            placeholder: el.placeholder || '',
            required: el.required
          })).filter(e => e.name || e.id)
        );
        
        // 全てのtextarea要素を取得
        const textareas = await page.$$eval('textarea', elements =>
          elements.map((el: any) => ({
            name: el.name,
            id: el.id,
            placeholder: el.placeholder || '',
            required: el.required,
            rows: el.rows
          })).filter(e => e.name || e.id)
        );
        
        // 全てのselect要素を取得
        const selects = await page.$$eval('select', elements =>
          elements.map((el: any) => ({
            name: el.name,
            id: el.id,
            required: el.required
          })).filter(e => e.name || e.id)
        );
        
        if (inputs.length > 0 || textareas.length > 0) {
          console.log(`\n   ✅ フォーム要素発見！`);
          
          if (inputs.length > 0) {
            console.log(`\n   📋 Input要素 (${inputs.length}個):`);
            inputs.forEach((input, i) => {
              console.log(`      ${i + 1}. type="${input.type}" name="${input.name}" id="${input.id}" ${input.required ? '(必須)' : ''}`);
              if (input.placeholder) console.log(`         placeholder: "${input.placeholder}"`);
            });
          }
          
          if (textareas.length > 0) {
            console.log(`\n   📝 Textarea要素 (${textareas.length}個):`);
            textareas.forEach((ta, i) => {
              console.log(`      ${i + 1}. name="${ta.name}" id="${ta.id}" rows=${ta.rows} ${ta.required ? '(必須)' : ''}`);
              if (ta.placeholder) console.log(`         placeholder: "${ta.placeholder}"`);
            });
          }
          
          if (selects.length > 0) {
            console.log(`\n   🔽 Select要素 (${selects.length}個):`);
            selects.forEach((sel, i) => {
              console.log(`      ${i + 1}. name="${sel.name}" id="${sel.id}" ${sel.required ? '(必須)' : ''}`);
            });
          }
          
          // ボタン要素を確認
          const buttons = await page.$$eval('button, input[type="submit"]', elements =>
            elements.map((el: any) => ({
              text: el.textContent?.trim() || el.value || '',
              type: el.type,
              id: el.id,
              name: el.name
            }))
          );
          
          if (buttons.length > 0) {
            console.log(`\n   🔘 ボタン要素 (${buttons.length}個):`);
            buttons.forEach((btn, i) => {
              console.log(`      ${i + 1}. "${btn.text}" (type: ${btn.type})`);
            });
          }
          
          // スクリーンショット保存
          await page.screenshot({ 
            path: `./screenshots/diary-form-detailed-${Date.now()}.png`,
            fullPage: true 
          });
          console.log(`\n   📸 詳細スクリーンショット保存完了`);
        } else {
          console.log(`   ⚠️  このページにはフォーム要素が見つかりません`);
        }
        
      } catch (error) {
        console.log(`   ❌ エラー: ${error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error);
  } finally {
    await browser.close();
  }
}

main();
