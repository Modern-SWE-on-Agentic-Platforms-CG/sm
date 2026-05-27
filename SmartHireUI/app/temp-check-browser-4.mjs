import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));
page.on('requestfailed', (req) => console.log('REQUESTFAILED', req.url(), req.failure()?.errorText));

try {
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Recruiter' }).click();
  await page.waitForURL(/\/todo-list$/);
  await page.waitForFunction(() => document.body.innerText.includes('To-Do List') || document.body.innerText.includes('Candidate pipeline view coming soon'), { timeout: 10000 });
  console.log('todo url', page.url());
  console.log('todo body', await page.locator('body').textContent());
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.body.innerText.includes('Dashboard') || document.body.innerText.includes('Welcome'), { timeout: 10000 });
  console.log('dashboard url', page.url());
  console.log('dashboard body', await page.locator('body').textContent());
} finally {
  await browser.close();
}
