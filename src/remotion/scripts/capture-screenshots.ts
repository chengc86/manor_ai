import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'public/assets');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function captureScreenshots() {
  // Ensure assets directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  try {
    // Screenshot 1: Parent Home Page
    console.log('Capturing parent home page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000); // Wait for animations
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'home.png'),
      type: 'png',
    });
    console.log('✓ Home page captured');

    // Screenshot 2: Admin Login Page
    console.log('Capturing admin login page...');
    await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-login.png'),
      type: 'png',
    });
    console.log('✓ Admin login page captured');

    // Screenshot 3: Admin Dashboard (if accessible)
    console.log('Capturing admin dashboard...');
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png'),
      type: 'png',
    });
    console.log('✓ Admin dashboard captured');

    // Screenshot 4: Settings page
    console.log('Capturing settings page...');
    await page.goto(`${baseUrl}/admin/settings`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-settings.png'),
      type: 'png',
    });
    console.log('✓ Settings page captured');

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
