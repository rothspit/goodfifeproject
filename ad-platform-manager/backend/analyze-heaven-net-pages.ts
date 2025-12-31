/**
 * シティヘブンネット 管理画面構造調査
 * ページのフォーム要素やリンクを解析
 */
import { HeavenNetService } from './src/services/platforms/HeavenNetService';
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
    console.log('===== シティヘブンネット 管理画面構造調査 =====\n');
    
    // ログイン
    const credentials = {
      username: '2500000713',
      password: 'ZKs60jlq'
    };
    
    await page.goto('https://spmanager.cityheaven.net/', { waitUntil: 'networkidle' });
    await page.fill('#userid', credentials.username);
    await page.fill('#passwd', credentials.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
      page.click('#loginBtn')
    ]);
    
    console.log('✅ ログイン成功\n');
    
    // ダッシュボードのリンクを調査
    console.log('📋 メニューリンクを調査中...\n');
    const links = await page.$$eval('a', anchors => 
      anchors.map(a => ({
        text: a.textContent?.trim() || '',
        href: a.href
      })).filter(link => link.text && !link.href.includes('javascript:'))
    );
    
    console.log('🔗 主要なメニューリンク:');
    const importantLinks = links.filter(l => 
      l.text.includes('女の子') || 
      l.text.includes('スケジュール') || 
      l.text.includes('日記') ||
      l.text.includes('出勤') ||
      l.text.includes('キャスト')
    );
    
    importantLinks.forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: './screenshots/cityheaven-menu-analysis.png', 
      fullPage: true 
    });
    console.log('\n📸 メニュー画面のスクリーンショット保存完了');
    
    // 女の子一覧ページに移動
    console.log('\n📝 女の子一覧ページを確認中...');
    const girlsLink = importantLinks.find(l => l.text.includes('女の子'));
    if (girlsLink) {
      await page.goto(girlsLink.href, { waitUntil: 'networkidle' });
      await page.screenshot({ 
        path: './screenshots/cityheaven-girls-list.png', 
        fullPage: true 
      });
      console.log('📸 女の子一覧ページのスクリーンショット保存完了');
      
      // ページ内のキャスト名を取得
      const castNames = await page.$$eval('td a', anchors => 
        anchors.map(a => a.textContent?.trim()).filter(Boolean).slice(0, 5)
      );
      console.log('\n👩 登録されているキャスト（最初の5名）:');
      castNames.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

main();
