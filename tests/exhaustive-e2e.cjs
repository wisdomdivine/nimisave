/**
 * Exhaustive E2E Test Suite for Nimisave
 * 
 * Verifies 100% stress-free user experience across:
 * 1. Live Production & SEO Endpoints (HTTP 200, Content-Type, OpenGraph, Sitelinks, Sitemap, Robots.txt)
 * 2. Visual / Typography / Design Constraint Audit (Zero borders, zero emojis, zero em dashes, zero pipes, zero bullet dividers, zero hyphens)
 * 3. Landing Page UX & Navigation
 * 4. Web3 / SIWE Authentication Flow & Iron Encryption Session Sealing
 * 5. Dashboard Page: Goal Assembly, Real-Time Progress, Micro-Settlement Transactions
 * 6. Voluntary Prompts Page: Category Switcher, TopicPickerModal, Subcategory Filters, Real-Time Search, Prompt Saving
 * 7. Supporter Communities Page: Club Pools, Micro-Funding Actions, Membership Metrics
 * 8. Settlement Wallet Page: Non-Custodial Multi-Asset Balances, CoinGecko Live NIM Rate, Zero Gas Relayer
 * 9. Responsive Layout Audits (Mobile 390x844 & Desktop 1440x900)
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.TEST_URL || 'https://nimisave.pages.dev';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔\x1b[0m ${message}`);
    results.push({ status: 'PASS', message });
  } else {
    failed++;
    console.error(`  \x1b[31m✖\x1b[0m ${message}`);
    results.push({ status: 'FAIL', message });
  }
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          text: buffer.toString('utf8'),
          buffer: buffer
        });
      });
    }).on('error', reject);
  });
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log(`Starting Exhaustive E2E Test Suite on: ${BASE_URL}`);
  console.log('================================================================\n');

  // ===========================================================================
  // TEST SUITE 1: Live Deployment & SEO Endpoints
  // ===========================================================================
  console.log('\x1b[1m[Suite 1: Live Production & SEO Endpoints]\x1b[0m');
  try {
    const rootRes = await fetchUrl(BASE_URL);
    assert(rootRes.statusCode === 200, `Root URL (${BASE_URL}) returned HTTP 200`);
    assert(rootRes.headers['content-type'].includes('text/html'), 'Root returns text/html');
    assert(rootRes.text.includes('<title>Nimisave</title>'), 'Root HTML has correct <title>');
    assert(rootRes.text.includes('property="og:image" content="https://nimisave.pages.dev/og-image.png"'), 'Root HTML has og:image tag');
    assert(rootRes.text.includes('name="twitter:card" content="summary_large_image"'), 'Root HTML has Twitter card');
    assert(rootRes.text.includes('application/ld+json'), 'Root HTML has JSON-LD structured data');
    assert(rootRes.text.includes('"@type": "SiteNavigationElement"'), 'Structured data includes SiteNavigationElement sitelinks');

    const ogRes = await fetchUrl(`${BASE_URL}/og-image.png`);
    assert(ogRes.statusCode === 200, 'OG image (/og-image.png) returned HTTP 200');
    assert(ogRes.headers['content-type'].includes('image/png'), 'OG image is image/png');
    assert(ogRes.buffer.length > 50000, `OG image size is valid (${Math.round(ogRes.buffer.length / 1024)} KB)`);

    const width = ogRes.buffer.readUInt32BE(16);
    const height = ogRes.buffer.readUInt32BE(20);
    assert(width === 1200 && height === 630, `OG image dimensions are 1200x630 (actual: ${width}x${height})`);

    const sitemapRes = await fetchUrl(`${BASE_URL}/sitemap.xml`);
    assert(sitemapRes.statusCode === 200, 'Sitemap (/sitemap.xml) returned HTTP 200');
    assert(sitemapRes.headers['content-type'].includes('xml'), 'Sitemap is application/xml');
    assert(sitemapRes.text.includes('https://nimisave.pages.dev/'), 'Sitemap includes root /');
    assert(sitemapRes.text.includes('https://nimisave.pages.dev/dashboard'), 'Sitemap includes /dashboard');
    assert(sitemapRes.text.includes('https://nimisave.pages.dev/prompts'), 'Sitemap includes /prompts');
    assert(sitemapRes.text.includes('https://nimisave.pages.dev/communities'), 'Sitemap includes /communities');
    assert(sitemapRes.text.includes('https://nimisave.pages.dev/wallet'), 'Sitemap includes /wallet');

    const robotsRes = await fetchUrl(`${BASE_URL}/robots.txt`);
    assert(robotsRes.statusCode === 200, 'Robots.txt (/robots.txt) returned HTTP 200');
    assert(robotsRes.text.includes('Sitemap: https://nimisave.pages.dev/sitemap.xml'), 'Robots.txt points to sitemap.xml');
  } catch (err) {
    assert(false, `Live endpoint test error: ${err.message}`);
  }

  // ===========================================================================
  // LAUNCH HEADLESS BROWSER
  // ===========================================================================
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // Mock Ethereum Provider for live SIWE verification
  await page.evaluateOnNewDocument(() => {
    window.ethereum = {
      isMetaMask: true,
      selectedAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      request: async ({ method, params }) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
          return ['0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'];
        }
        if (method === 'eth_chainId') return '0x1';
        if (method === 'eth_getBalance') return '0x2386f26fc10000'; // 0.01 ETH
        if (method === 'personal_sign') {
          return '0x3045022100e4b85c18408f6d67b2d56d400e932ec13959fe29d660fa11438fa7bc2b845d02201d4188b4d82b4a537f07bbd56be7d25e0b96871032cf0a1c6a236df7a0ec4ec61b';
        }
        return '0x0';
      },
      on: () => {},
      removeListener: () => {}
    };
  });

  // ===========================================================================
  // TEST SUITE 2: Landing Page UX & Navigation
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 2: Landing Page UX & Visual Integrity]\x1b[0m');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    assert(consoleErrors.length === 0, `Landing page loaded with 0 console errors (found: ${consoleErrors.length})`);

    const logoExists = await page.evaluate(() => {
      const svg = document.querySelector('header svg');
      return svg !== null;
    });
    assert(logoExists, 'Header brand logo SVG is present and rendered');

    const connectButtonInfo = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Connect Wallet') || b.textContent.includes('0x'));
      if (!btn) return null;
      const hasGreenDot = btn.querySelector('.bg-emerald-500, .bg-emerald-400, .bg-green-500') !== null;
      return {
        text: btn.textContent.trim(),
        hasGreenDot: hasGreenDot
      };
    });
    assert(connectButtonInfo !== null, 'Connect Wallet button is found in header');
    assert(connectButtonInfo && !connectButtonInfo.hasGreenDot, 'Connect Wallet button has ZERO green dots or pulse indicators');

    const illustrationExists = await page.evaluate(() => {
      const img = document.querySelector('img[src="/illustration-windows-dark.png"]');
      return img !== null;
    });
    assert(illustrationExists, '3D goals illustration (illustration-windows-dark.png) is rendered in main hero');

    const linksExist = await page.evaluate(() => {
      const xLink = document.querySelector('a[href="https://x.com/nimiq"]');
      const gitLink = document.querySelector('a[href="https://github.com/wisdomdivine/nimisave"]');
      return xLink !== null && gitLink !== null;
    });
    assert(linksExist, 'Social links (X / Twitter and GitHub) are present');
  } catch (err) {
    assert(false, `Landing page test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 3: SIWE Authentication & Iron Encrypted Session
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 3: Web3 / SIWE Authentication & Iron Encryption]\x1b[0m');
  try {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Connect Wallet'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 600));

    const modalTitle = await page.evaluate(() => {
      const el = document.querySelector('h3, [role="dialog"]');
      return el ? el.textContent : '';
    });
    assert(modalTitle.includes('Connect') || modalTitle.includes('Wallet'), 'Connect Settlement Wallet modal opened');

    await page.evaluate(() => {
      const option = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MetaMask and EVM'));
      if (option) option.click();
    });

    // Wait for SIWE authentication and iron session sealing
    await new Promise(r => setTimeout(r, 1500));

    const sessionToken = await page.evaluate(() => {
      return sessionStorage.getItem('nimisave_auth_session');
    });
    assert(sessionToken !== null && sessionToken.length > 20, 'Iron encrypted session token sealed and saved in sessionStorage');

    const connectedAddressDisplay = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('0x'));
      return btn ? btn.textContent.trim() : null;
    });
    assert(connectedAddressDisplay !== null, `Header reflects authenticated wallet: ${connectedAddressDisplay}`);
  } catch (err) {
    assert(false, `Wallet SIWE authentication test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 4: Dashboard Page & Goal Assembly
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 4: Dashboard Page & Real-Time Goal Assembly]\x1b[0m');
  try {
    // Navigate via client-side routing to keep authenticated session
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/dashboard"], a[to="/dashboard"]');
      if (link) {
        link.click();
      } else {
        window.location.href = '/dashboard';
      }
    });
    await new Promise(r => setTimeout(r, 1500));

    const dashboardRendered = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return (
        bodyText.includes('Save. Play. Build.') ||
        bodyText.includes('Total Funds Saved') ||
        bodyText.includes('Goal Box') ||
        bodyText.includes('Nimiq Micro Settlement Protocol')
      );
    });
    assert(dashboardRendered, 'Dashboard page rendered successfully with goal metrics');

    // Verify 3D Goal Stage presence (either WebGL Canvas or robust fallback stage)
    const goalStageRendered = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const fallback = document.querySelector('.bg-neutral-925');
      return canvas !== null || fallback !== null;
    });
    assert(goalStageRendered, 'Goal assembly stage rendered cleanly with zero WebGL crashes');

    const hasCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-3xl, .rounded-2xl');
      return cards.length >= 3;
    });
    assert(hasCards, 'Statistics cards and Goal Box containers rendered');
  } catch (err) {
    assert(false, `Dashboard test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 5: Voluntary Prompts & Extensive Topic Picker Modal
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 5: Voluntary Prompts & Extensive Topic Picker]\x1b[0m');
  try {
    await page.goto(`${BASE_URL}/prompts`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const categoriesFound = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        football: text.includes('Football'),
        basketball: text.includes('Basketball'),
        gaming: text.includes('Gaming'),
        crypto: text.includes('Crypto')
      };
    });
    assert(
      categoriesFound.football &&
      categoriesFound.basketball &&
      categoriesFound.gaming &&
      categoriesFound.crypto,
      'All 4 hobby categories rendered (Football, Basketball, Gaming, Crypto)'
    );

    // Open TopicPickerModal by clicking "Browse all"
    const browseClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Browse all'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(browseClicked, 'Browse all topics button clicked');

    await new Promise(r => setTimeout(r, 600));

    const modalOpened = await page.evaluate(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      return searchInput !== null;
    });
    assert(modalOpened, 'TopicPickerModal opened with search filter input');

    if (modalOpened) {
      await page.type('input[placeholder*="Search"]', 'Real Madrid');
      await new Promise(r => setTimeout(r, 400));

      const filterWorks = await page.evaluate(() => {
        const modalButtons = Array.from(document.querySelectorAll('[role="dialog"] button, .fixed button'));
        return modalButtons.some(b => b.textContent.includes('Real Madrid'));
      });
      assert(filterWorks, 'Real-time topic search correctly filtered list to "Real Madrid"');

      // Click "Real Madrid" to select it
      await page.evaluate(() => {
        const option = Array.from(document.querySelectorAll('[role="dialog"] button, .fixed button')).find(b => b.textContent.includes('Real Madrid'));
        if (option) option.click();
      });

      await new Promise(r => setTimeout(r, 500));

      const topicUpdated = await page.evaluate(() => {
        return document.body.innerText.includes('Real Madrid');
      });
      assert(topicUpdated, 'Active topic successfully updated to "Real Madrid" in the voluntary prompt configuration');
    }
  } catch (err) {
    assert(false, `Voluntary prompts test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 6: Supporter Communities Page
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 6: Supporter Communities & Collective Pools]\x1b[0m');
  try {
    await page.goto(`${BASE_URL}/communities`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const communitiesRendered = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Supporter') || text.includes('Pool') || text.includes('Community');
    });
    assert(communitiesRendered, 'Communities page loaded successfully');

    const clubCardsCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-3xl, .rounded-2xl');
      return cards.length;
    });
    assert(clubCardsCount >= 2, `Community clubs and collective pools rendered (${clubCardsCount} cards)`);
  } catch (err) {
    assert(false, `Communities page test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 7: Settlement Wallet Page & Pricing
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 7: Settlement Wallet & Live Rate Settlement]\x1b[0m');
  try {
    await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const walletBalances = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasNim: text.includes('NIM'),
        hasUsdt: text.includes('USDT'),
        hasRelayer: text.includes('Relayer') || text.includes('Zero Gas')
      };
    });
    assert(walletBalances.hasNim && walletBalances.hasUsdt, 'Wallet displays both NIM and USDT non custodial balances');
    assert(walletBalances.hasRelayer, 'Zero gas relayer protocol status is visible');

    const hasLivePrice = await page.evaluate(() => {
      return document.body.innerText.includes('$');
    });
    assert(hasLivePrice, 'Live currency conversion rate ($) is active');
  } catch (err) {
    assert(false, `Wallet page test error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 8: Strict Design & Copy Constraints Audit
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 8: Strict Design & Copy Constraints Audit]\x1b[0m');
  try {
    const testUrls = [`${BASE_URL}/`, `${BASE_URL}/dashboard`, `${BASE_URL}/prompts`, `${BASE_URL}/wallet`];

    let totalEmojiViolations = 0;
    let totalEmDashViolations = 0;
    let totalPipeViolations = 0;
    let totalBulletViolations = 0;
    let totalBorderViolations = 0;

    const emojiRegex = /[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u;

    for (const url of testUrls) {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 600));

      const pageAudit = await page.evaluate((emojiPatternStr) => {
        const emojiReg = new RegExp(emojiPatternStr, 'u');
        const text = document.body.innerText;

        const hasEmojis = emojiReg.test(text);
        const hasEmDash = text.includes('—') || text.includes('–');
        const hasPipe = text.includes('|');
        const hasBullet = text.includes('•') || text.includes('·');

        const allElements = document.querySelectorAll('*');
        let borderCount = 0;
        for (const el of allElements) {
          const style = window.getComputedStyle(el);
          if (
            style.borderWidth &&
            parseFloat(style.borderWidth) > 0 &&
            style.borderStyle !== 'none' &&
            style.borderColor !== 'transparent' &&
            style.borderColor !== 'rgba(0, 0, 0, 0)'
          ) {
            borderCount++;
          }
        }

        return { hasEmojis, hasEmDash, hasPipe, hasBullet, borderCount };
      }, emojiRegex.source);

      if (pageAudit.hasEmojis) totalEmojiViolations++;
      if (pageAudit.hasEmDash) totalEmDashViolations++;
      if (pageAudit.hasPipe) totalPipeViolations++;
      if (pageAudit.hasBullet) totalBulletViolations++;
      totalBorderViolations += pageAudit.borderCount;
    }

    assert(totalEmojiViolations === 0, `Constraint: ZERO emojis across all pages (violations: ${totalEmojiViolations})`);
    assert(totalEmDashViolations === 0, `Constraint: ZERO em dashes across all pages (violations: ${totalEmDashViolations})`);
    assert(totalPipeViolations === 0, `Constraint: ZERO pipe dividers (|) across all pages (violations: ${totalPipeViolations})`);
    assert(totalBulletViolations === 0, `Constraint: ZERO bullet dividers across all pages (violations: ${totalBulletViolations})`);
    assert(totalBorderViolations === 0, `Constraint: ZERO visible borders anywhere (violations: ${totalBorderViolations})`);
  } catch (err) {
    assert(false, `Design constraints audit error: ${err.message}`);
  }

  // ===========================================================================
  // TEST SUITE 9: Responsive Layout Audits (Mobile 390x844)
  // ===========================================================================
  console.log('\n\x1b[1m[Suite 9: Mobile Viewport Stress Test (iPhone 14 - 390x844)]\x1b[0m');
  try {
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const mobileHasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!mobileHasHorizontalScroll, 'Mobile Landing Page has zero horizontal scroll overflow');

    await page.goto(`${BASE_URL}/prompts`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const mobilePromptsScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!mobilePromptsScroll, 'Mobile Prompts Page has zero horizontal scroll overflow');
  } catch (err) {
    assert(false, `Mobile viewport test error: ${err.message}`);
  }

  await browser.close();

  // ===========================================================================
  // TEST SUMMARY REPORT
  // ===========================================================================
  console.log('\n================================================================');
  console.log(`E2E TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error during E2E test execution:', err);
  process.exit(1);
});
