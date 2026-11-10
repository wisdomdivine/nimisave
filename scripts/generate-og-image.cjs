const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const fontRegular = fs.readFileSync(path.join(__dirname, '../public/fonts/NeueMontreal-Regular.otf')).toString('base64');
const fontMedium = fs.readFileSync(path.join(__dirname, '../public/fonts/NeueMontreal-Medium.otf')).toString('base64');

// Clean SVG icon definitions matching the uploaded visual reference
const icons = {
  // 1. Blue tile - Smooth ascending curve with upward arrow (Symphony style)
  growth: `
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0e1015" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 17c1.5 0 2.5-1 3.5-3.5 1-2.5 2-4.5 4-4.5s3 2 4 4.5 2.5 3.5 4.5 3.5" />
      <path d="M16 8l4-4m0 0h-4m4 0v4" />
      <circle cx="4" cy="17" r="1.5" fill="#0e1015" stroke="none" />
    </svg>
  `,
  // 2. Lilac tile - Pointer cursor
  cursor: `
    <svg viewBox="0 0 24 24" width="46" height="46" fill="#0e1015">
      <path d="M4.5 3.5l14 7.5-6.5 1.8-3.5 6.2z" />
    </svg>
  `,
  // 3. Violet tile - 3D Isometric Cube / Assembly
  cube: `
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#0e1015" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  `,
  // 4. Mint tile - Calendar grid
  calendar: `
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#0e1015" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3.5" fill="#0e1015" stroke="none" />
      <rect x="5.5" y="8" width="13" height="11.5" rx="1.5" fill="#6EE7B7" stroke="none" />
      <circle cx="9" cy="11.5" r="1.1" fill="#0e1015" stroke="none" />
      <circle cx="12" cy="11.5" r="1.1" fill="#0e1015" stroke="none" />
      <circle cx="15" cy="11.5" r="1.1" fill="#0e1015" stroke="none" />
      <circle cx="9" cy="15.5" r="1.1" fill="#0e1015" stroke="none" />
      <circle cx="12" cy="15.5" r="1.1" fill="#0e1015" stroke="none" />
      <circle cx="15" cy="15.5" r="1.1" fill="#0e1015" stroke="none" />
      <line x1="8" y1="2" x2="8" y2="5" stroke="#0e1015" stroke-width="2.2" />
      <line x1="16" y1="2" x2="16" y2="5" stroke="#0e1015" stroke-width="2.2" />
    </svg>
  `,
  // 5. Lime tile - 3 Stacked Database Cylinders (matching reference)
  database: `
    <svg viewBox="0 0 24 24" width="48" height="48" fill="#0e1015">
      <ellipse cx="12" cy="4.8" rx="8" ry="2.6" />
      <path d="M4 4.8v3.6c0 1.45 3.58 2.6 8 2.6s8-1.15 8-2.6V4.8c-1.8 1.1-4.8 1.7-8 1.7s-6.2-.6-8-1.7z" />
      <path d="M4 10.2v3.6c0 1.45 3.58 2.6 8 2.6s8-1.15 8-2.6v-3.6c-1.8 1.1-4.8 1.7-8 1.7s-6.2-.6-8-1.7z" />
      <path d="M4 15.6v3.6c0 1.45 3.58 2.6 8 2.6s8-1.15 8-2.6v-3.6c-1.8 1.1-4.8 1.7-8 1.7s-6.2-.6-8-1.7z" />
    </svg>
  `,
  // 6. Orange tile - Search / discovery
  search: `
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0e1015" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
    </svg>
  `,
  // 7. Pink tile - Lightning / Zero Gas
  lightning: `
    <svg viewBox="0 0 24 24" width="46" height="46" fill="#0e1015">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  `,
  // 8. Soft green tile - Envelope / Voluntary prompt
  mail: `
    <svg viewBox="0 0 24 24" width="48" height="48" fill="#0e1015">
      <rect x="2" y="4.5" width="20" height="15.5" rx="3.5" />
      <polygon points="12 13 2 6 22 6" fill="#86EFAC" />
    </svg>
  `
};

// Radial spiral knot brand mark SVG
const spiralKnot = `
  <svg width="62" height="62" viewBox="0 0 100 100" fill="none">
    <g fill="#0e1015">
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(0 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(30 50 50)" />
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(60 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(90 50 50)" />
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(120 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(150 50 50)" />
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(180 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(210 50 50)" />
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(240 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(270 50 50)" />
      <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(300 50 50)" />
      <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(330 50 50)" />
    </g>
  </svg>
`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Neue Montreal';
    src: url('data:font/otf;base64,${fontRegular}') format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Neue Montreal';
    src: url('data:font/otf;base64,${fontMedium}') format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    width: 1200px;
    height: 630px;
    background: radial-gradient(circle at 50% 50%, #FAFBFD 0%, #F1F3F6 65%, #ECEEF2 100%);
    font-family: 'Neue Montreal', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Center Brand Lockup */
  .brand-center {
    display: flex;
    align-items: center;
    gap: 18px;
    z-index: 20;
    user-select: none;
  }
  .brand-logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brand-name {
    font-size: 64px;
    font-weight: 500;
    letter-spacing: -0.03em;
    color: #0c0d0e;
    line-height: 1;
  }

  /* Orbiting squircle cards */
  .tile {
    position: absolute;
    width: 110px;
    height: 110px;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.12), 0 6px 14px -3px rgba(15, 23, 42, 0.05);
    z-index: 10;
  }

  /* Floating orbital accent dots */
  .accent-dot {
    position: absolute;
    border-radius: 50%;
    z-index: 5;
  }
  .halo-ring {
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  /* Ambient texture overlay */
  .grain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.03;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    z-index: 25;
  }
</style>
</head>
<body>
  <div class="grain"></div>

  <!-- Center Lockup -->
  <div class="brand-center">
    <div class="brand-logo">
      ${spiralKnot}
    </div>
    <div class="brand-name">Nimisave</div>
  </div>

  <!-- 8 Orbiting Squircles matching reference composition -->
  <!-- 1. Top Left: Cursor (Lavender #DDD6FE) -->
  <div class="tile" style="top: 10px; left: 195px; background-color: #DDD6FE;">
    ${icons.cursor}
  </div>

  <!-- 2. Top Center: 3D Cube / Assembly (Violet #C4B5FD) -->
  <div class="tile" style="top: -24px; left: 545px; background-color: #C4B5FD;">
    ${icons.cube}
  </div>

  <!-- 3. Top Right: Calendar (Mint Teal #6EE7B7) -->
  <div class="tile" style="top: 10px; right: 195px; background-color: #6EE7B7;">
    ${icons.calendar}
  </div>

  <!-- 4. Left: Upward Growth Curve (Sky Blue #60A5FA) -->
  <div class="tile" style="top: 260px; left: 90px; background-color: #60A5FA;">
    ${icons.growth}
  </div>

  <!-- 5. Right: Vault Stack / Database (Electric Lime #CCFF00) -->
  <div class="tile" style="top: 260px; right: 90px; background-color: #CCFF00;">
    ${icons.database}
  </div>

  <!-- 6. Bottom Left: Voluntary Envelope (Fresh Green #86EFAC) -->
  <div class="tile" style="bottom: 10px; left: 195px; background-color: #86EFAC;">
    ${icons.mail}
  </div>

  <!-- 7. Bottom Center: Zero Gas Lightning (Hot Pink #F472B6) -->
  <div class="tile" style="bottom: -24px; left: 545px; background-color: #F472B6;">
    ${icons.lightning}
  </div>

  <!-- 8. Bottom Right: Search / Discovery (Vibrant Orange #FB923C) -->
  <div class="tile" style="bottom: 10px; right: 195px; background-color: #FB923C;">
    ${icons.search}
  </div>

  <!-- Playful Orbiting Accent Dots (matching reference) -->
  <!-- Top Left: Bright Green Dot with soft ring -->
  <div class="halo-ring" style="top: 130px; left: 395px; width: 34px; height: 34px; background: rgba(74, 222, 128, 0.22);">
    <div style="width: 18px; height: 18px; border-radius: 50%; background: #22C55E;"></div>
  </div>

  <!-- Top Right: Royal Blue Dot with outer halo ring -->
  <div class="halo-ring" style="top: 135px; right: 385px; width: 36px; height: 36px; background: rgba(59, 130, 246, 0.25);">
    <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563EB;"></div>
  </div>

  <!-- Bottom Left: Coral Red Dot with halo ring -->
  <div class="halo-ring" style="bottom: 140px; left: 405px; width: 34px; height: 34px; background: rgba(239, 68, 68, 0.22);">
    <div style="width: 18px; height: 18px; border-radius: 50%; background: #EF4444;"></div>
  </div>

  <!-- Bottom Right: Navy / Slate Dot -->
  <div class="accent-dot" style="bottom: 148px; right: 400px; width: 20px; height: 20px; background: #3B82F6;"></div>

  <!-- Mid Left Tiny Dot -->
  <div class="accent-dot" style="top: 310px; left: 240px; width: 10px; height: 10px; background: #F59E0B; opacity: 0.65;"></div>

  <!-- Mid Right Tiny Dot -->
  <div class="accent-dot" style="top: 310px; right: 240px; width: 10px; height: 10px; background: #8B5CF6; opacity: 0.65;"></div>
</body>
</html>`;

const tmpHtmlPath = '/tmp/og-preview.html';
const outPngPath = path.join(__dirname, '../public/og-image.png');

fs.writeFileSync(tmpHtmlPath, html, 'utf8');

// Execute headless Chrome
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1200,630 --hide-scrollbars --screenshot="${outPngPath}" "file://${tmpHtmlPath}"`;
execSync(cmd);
console.log('OG Image successfully regenerated at', outPngPath);
