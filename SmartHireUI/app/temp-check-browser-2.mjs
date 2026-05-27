import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));
page.on('requestfailed', (req) => console.log('REQUESTFAILED', req.url(), req.failure()?.errorText));

try {
  await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
  console.log('home url', page.url());
  await page.getByRole('button', { name: 'Recruiter' }).click();
  await page.waitForTimeout(2000);
  console.log('after click url', page.url());
  console.log('storage', await page.evaluate(() => ({ token: localStorage.getItem('auth_token'), expiry: localStorage.getItem('token_expiry') })));
  const routes = ['/dashboard', '/candidates', '/booking/form', '/booking/view', '/feedback', '/todo-list', '/workflow', '/reports/rejection-ratio'];
  for (const route of routes) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
    const bodyText = await page.locator('body').textContent();
    const heading = await page.locator('main h1, main h2').first().textContent().catch(() => null);
    console.log('ROUTE', route, 'URL', page.url(), 'HEADING', heading?.trim() || null, 'BODY_SNIPPET', bodyText?.replace(/\s+/g, ' ').trim().slice(0, 200));
  }
} finally {
  await browser.close();
}
