import { test, expect } from '@playwright/test';

test('Verification: Ensure Clean Environment', async ({ page }) => {
  // Go to homepage
  await page.goto('/');

  // Wait for the app to load sufficiently. We can check for a key element.
  // We'll wait for the body to be attached to ensure the page has loaded content.
  await expect(page.locator('body')).toBeVisible();

  // 1. Check localStorage for old data
  // The automated script checks for these keys and considers it "dirty" if they exist.
  const oldKeys = ['chat-sessions', 'chat-messages', 'fincept-chat-data'];

  const localStorageData = await page.evaluate((keys) => {
    const found = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) found[key] = value;
    });
    return found;
  }, oldKeys);

  const foundKeys = Object.keys(localStorageData);
  if (foundKeys.length > 0) {
    console.warn('❌ Found old keys in localStorage:', foundKeys);
  } else {
    console.log('✅ No old localStorage data found');
  }

  // Assert no old data
  expect(foundKeys, 'Should not have old chat data in localStorage').toHaveLength(0);

  console.log('✅ Verification clean.');
});
