import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1800));

// Hero pin wrap is 280vh. Animation window = 1 viewport (900px). t = scrollY / 900.
// After t=1 (scrollY=900) there is ~80vh of crescent hold before the pin releases.
const states = [
  { label: 'half',     scrollY: 450  }, // t = 0.5
  { label: 'crescent', scrollY: 810  }, // t = 0.9
  { label: 'final',    scrollY: 900  }, // t = 1.0
];

for (const { label, scrollY } of states) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await new Promise(r => setTimeout(r, 400));

  let n = 3;
  while (fs.existsSync(path.join(outDir, `screenshot-${n}-${label}.png`))) n++;
  const outFile = path.join(outDir, `screenshot-${n}-${label}.png`);
  await page.screenshot({ path: outFile, fullPage: false });
  console.log(`Saved: ${outFile}`);
}

await browser.close();
