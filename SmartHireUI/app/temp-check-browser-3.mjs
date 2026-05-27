import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));
page.on('requestfailed', (req) => console.log('REQUESTFAILED', req.url(), req.failure()?.errorText));

try {
  await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Recruiter' }).click();
  await page.waitForURL(/\/todo-list$/);
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('URL', page.url());
  console.log('BODY HTML', await page.locator('body').innerHTML());
  console.log('MAIN HTML', await page.locator('main').innerHTML());
} finally {
  await browser.close();
}
