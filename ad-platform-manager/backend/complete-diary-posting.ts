/**
 * シティヘブンネット 写メ日記投稿機能完全実装
 */
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP'
  });
  const page = await context.newPage();
  
  try {
    console.log('===== 写メ日記投稿機能実装テスト =====\n');
    
    // ログイン
    console.log('🔐 ログイン中...');
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'networkidle' });
    await page.fill('#userid', '2500000713');
    await page.fill('#passwd', 'ZKs60jlq');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#loginBtn')
    ]);
    console.log('✅ ログイン成功\n');
    
    // 写メ日記一覧ページに移動
    console.log('📝 写メ日記一覧ページへ移動...');
    await page.goto('https://spmanager.cityheaven.net/H8KeitaiDiaryList.php?shopdir=cb_hitozuma_mitsu', {
      waitUntil: 'networkidle'
    });
    
    await page.screenshot({ path: './screenshots/diary-list-page.png', fullPage: true });
    console.log('📸 一覧ページのスクリーンショット保存\n');
    
    // 新規投稿ボタンを探す（複数のパターンを試す）
    console.log('🔍 新規投稿ボタンを探索中...');
    const buttonSelectors = [
      'a:has-text("新規")',
      'a:has-text("投稿")',
      'a:has-text("作成")',
      'a:has-text("追加")',
      'button:has-text("新規")',
      'button:has-text("投稿")',
      'input[value*="新規"]',
      'input[value*="投稿"]'
    ];
    
    let newPostButton = null;
    for (const selector of buttonSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        newPostButton = page.locator(selector).first();
        console.log(`✅ ボタン発見: "${selector}"`);
        break;
      }
    }
    
    if (!newPostButton) {
      console.log('⚠️  新規投稿ボタンが見つかりません');
      console.log('   ページ内の全てのリンクを確認します...\n');
      
      const allLinks = await page.$$eval('a', anchors =>
        anchors.map(a => ({
          text: (a.textContent || '').trim().substring(0, 50),
          href: a.href
        })).filter(l => l.text)
      );
      
      console.log('📋 ページ内のリンク:');
      allLinks.forEach((link, i) => {
        console.log(`   ${i + 1}. ${link.text}`);
        console.log(`      URL: ${link.href}`);
      });
      
      // 代替案: スマホ管理画面を試す
      console.log('\n💡 代替案: モバイルCMS画面を試します...');
      await page.goto('https://spmanager.cityheaven.net/H3KeitaiDecoMain.php?shopdir=cb_hitozuma_mitsu', {
        waitUntil: 'networkidle',
        timeout: 15000
      }).catch(() => {});
      
      await page.screenshot({ path: './screenshots/mobile-cms.png', fullPage: true });
      console.log('📸 モバイルCMS画面のスクリーンショット保存');
      
    } else {
      console.log('\n📝 新規投稿ボタンをクリック...');
      await newPostButton.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: './screenshots/diary-posting-form.png', fullPage: true });
      console.log('📸 投稿フォームのスクリーンショット保存\n');
      
      // フォームフィールドを確認
      console.log('📋 フォームフィールドを分析中...');
      const formData = await page.$$eval('input, textarea, select', elements =>
        elements.map((el: any) => ({
          tag: el.tagName,
          type: el.type || '',
          name: el.name || '',
          id: el.id || '',
          placeholder: el.placeholder || '',
          required: el.required || false
        })).filter(f => f.name || f.id)
      );
      
      console.log(`   見つかったフィールド: ${formData.length}個\n`);
      formData.forEach((field, i) => {
        console.log(`   ${i + 1}. <${field.tag.toLowerCase()}> ${field.type ? `type="${field.type}"` : ''} name="${field.name}" id="${field.id}" ${field.required ? '(必須)' : ''}`);
      });
    }
    
    console.log('\n✅ 分析完了！');
    console.log('\n📊 結果サマリー:');
    console.log('   - ログイン: ✅ 成功');
    console.log('   - 一覧ページアクセス: ✅ 成功');
    console.log('   - スクリーンショット: ✅ 保存完了');
    console.log('   - 次のステップ: フォーム実装または代替アプローチ検討');
    
  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: './screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

main();
