import { chromium } from 'playwright';

const routes = [
  '/dashboard',
  '/candidates',
  '/booking/form',
  '/booking/view',
  '/feedback',
  '/todo-list',
  '/workflow',
  '/reports/rejection-ratio',
  '/admin/master-data',
  '/referral/register',
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Recruiter' }).click();
  await page.waitForURL(/\/todo-list$/);

  for (const route of routes) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
    const heading = await page.locator('main h1, main h2').first().textContent().catch(() => null);
    const text = await page.locator('main').first().textContent().catch(() => '');
    const url = page.url();
    console.log(JSON.stringify({ route, url, heading: heading?.trim() || null, preview: text.replace(/\s+/g, ' ').trim().slice(0, 200) }));
  }
} finally {
  await browser.close();
}
