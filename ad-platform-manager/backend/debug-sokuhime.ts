import { chromium } from 'playwright';

async function debugSokuHime() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - 即姫ページ調査');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 812 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo'
  });

  const page = await context.newPage();

  try {
    console.log('\n🔐 ログイン中...');
    await page.goto('https://spmanager.cityheaven.net/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.fill('#userid', '2510055906');
    await page.fill('#passwd', 'OgI70vnH');
    await page.click('#loginBtn');
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン成功');

    // 即姫ページに移動
    console.log('\n🔍 即姫ページに移動中...');
    await page.goto('https://spmanager.cityheaven.net/H9StandbyGirlRegist.php?shopdir=cb_idolgakuen_f', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);
    console.log('✅ 即姫ページに到達');

    // スクリーンショット保存
    const screenshotPath = `screenshots/sokuhime-debug-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

    // ページのHTMLを取得
    const html = await page.content();
    const htmlPath = `screenshots/sokuhime-debug-${Date.now()}.html`;
    require('fs').writeFileSync(htmlPath, html);
    console.log(`📄 HTML保存: ${htmlPath}`);

    // ページ内のすべてのリンクとボタンを取得
    console.log('\n🔍 ページ内のすべての要素を探索中...');
    const allElements = await page.evaluate(() => {
      const elements: any[] = [];
      
      // すべてのa要素
      document.querySelectorAll('a').forEach((el) => {
        elements.push({
          type: 'link',
          tag: 'a',
          text: el.textContent?.trim() || '',
          href: el.getAttribute('href') || '',
          id: el.id || '',
          class: el.className || ''
        });
      });

      // すべてのbutton要素
      document.querySelectorAll('button').forEach((el) => {
        elements.push({
          type: 'button',
          tag: 'button',
          text: el.textContent?.trim() || '',
          id: el.id || '',
          class: el.className || ''
        });
      });

      // すべてのinput要素
      document.querySelectorAll('input').forEach((el) => {
        elements.push({
          type: 'input',
          tag: 'input',
          inputType: el.getAttribute('type') || '',
          value: el.getAttribute('value') || '',
          id: el.id || '',
          class: el.className || '',
          name: el.getAttribute('name') || ''
        });
      });

      return elements;
    });

    const elementsPath = `screenshots/sokuhime-elements-${Date.now()}.json`;
    require('fs').writeFileSync(elementsPath, JSON.stringify({ timestamp: new Date().toISOString(), elements: allElements }, null, 2));
    console.log(`📄 要素リスト保存: ${elementsPath}`);
    console.log(`📊 取得した要素数: ${allElements.length}`);

    // 「出勤中」や「即姫」に関連する要素を探す
    console.log('\n🔍 出勤中/即姫関連の要素を探索中...');
    const relevantElements = allElements.filter(el => {
      const text = el.text?.toLowerCase() || '';
      const href = el.href?.toLowerCase() || '';
      const className = el.class?.toLowerCase() || '';
      return text.includes('出勤') || text.includes('即姫') || text.includes('即ヒメ') || 
             text.includes('登録') || href.includes('standby') || className.includes('standby');
    });

    console.log(`📊 関連要素数: ${relevantElements.length}`);
    relevantElements.forEach((el, i) => {
      console.log(`  ${i + 1}. [${el.type}] ${el.text} (class: ${el.class}, href: ${el.href})`);
    });

    // ページの主要なテキストを取得
    console.log('\n📝 ページの主要なテキスト:');
    const pageText = await page.evaluate(() => {
      return document.body.textContent?.substring(0, 500) || '';
    });
    console.log(pageText);

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
    console.log('\n✅ ブラウザを閉じました');
  }
}

debugSokuHime().catch(console.error);
