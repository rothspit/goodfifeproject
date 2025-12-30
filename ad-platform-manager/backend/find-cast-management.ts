/**
 * シティヘブンネット キャスト管理ページを探索
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
    // ログイン
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'networkidle' });
    await page.fill('#userid', '2500000713');
    await page.fill('#passwd', 'ZKs60jlq');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#loginBtn')
    ]);
    
    console.log('✅ ログイン成功\n');
    
    // 一般的なキャスト管理ページのパスを試す
    const possiblePaths = [
      'H3GirlList.php',
      'H3GirlEdit.php',
      'castList.php',
      'girlList.php',
      'ladiesList.php',
      'TherapistList.php'
    ];
    
    console.log('🔍 キャスト管理ページを探索中...\n');
    
    for (const path of possiblePaths) {
      const url = `https://spmanager.cityheaven.net/${path}`;
      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        if (response && response.ok()) {
          console.log(`✅ 見つかりました: ${url}`);
          await page.screenshot({ 
            path: `./screenshots/cityheaven-${path.replace('.php', '')}.png`,
            fullPage: true 
          });
          console.log(`📸 スクリーンショット保存: ${path}`);
          
          // ページの主要な要素を確認
          const pageText = await page.textContent('body');
          if (pageText?.includes('女') || pageText?.includes('キャスト') || pageText?.includes('セラピスト')) {
            console.log('💡 このページにキャスト情報が含まれています\n');
            
            // テーブルやリストを探す
            const tables = await page.$$('table');
            console.log(`📊 テーブル数: ${tables.length}`);
            
            if (tables.length > 0) {
              const firstTable = tables[0];
              const rows = await firstTable.$$('tr');
              console.log(`📝 行数: ${rows.length}`);
              
              // 最初の数行のテキストを表示
              for (let i = 0; i < Math.min(5, rows.length); i++) {
                const rowText = await rows[i].textContent();
                console.log(`  行${i + 1}: ${rowText?.trim().substring(0, 100)}`);
              }
            }
          }
          console.log('---\n');
        }
      } catch (error) {
        // ページが見つからない場合はスキップ
      }
    }
    
    // ダッシュボードページの全HTMLを調査
    await page.goto('https://spmanager.cityheaven.net/H1Main.php', { 
      waitUntil: 'networkidle' 
    });
    
    console.log('\n📋 ダッシュボードの全リンクを抽出...');
    const allLinks = await page.$$eval('a', anchors => 
      anchors.map(a => ({
        text: (a.textContent || '').trim(),
        href: a.href
      })).filter(l => l.href.includes('.php'))
    );
    
    console.log('\n🔗 全ての.phpリンク:');
    allLinks.forEach(link => {
      console.log(`  - ${link.text || '(テキストなし)'}: ${link.href}`);
    });
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

main();
