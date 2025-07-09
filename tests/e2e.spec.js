const { test, expect } = require('@playwright/test');



test.describe('YC Coach - Core Functionality', () => {

    test('should load the main page and have an empty founder list', async ({ page }) => {
        // Navigate to the live application
        await page.goto('/');

        // 1. Check if the page title is correct
        await expect(page).toHaveTitle(/ycombinator.coach - AI YC Pitch Tool/);

        // 2. Check if the main heading is visible
        await expect(page.getByRole('heading', { name: 'Get Coaching on your YC Application' })).toBeVisible();

        // 3. Check that the founder list exists but is empty
        const founderList = page.locator('#founder-list');
        await expect(founderList).toBeVisible();
        const founderItems = founderList.locator('.founder-item');
        await expect(founderItems).toHaveCount(0);

        // 4. Check that the "Add a co-founder" button is present
        await expect(page.getByRole('button', { name: '+ Add a co-founder' })).toBeVisible();
    });

    test('should allow adding and editing a founder', async ({ page }) => {
        // Navigate to the live application
        await page.goto('/');

        // 1. Add a new co-founder
        await page.getByRole('button', { name: '+ Add a co-founder' }).click();

        // 2. Verify the new founder appears in the list
        const founderList = page.locator('#founder-list');
        const founderItems = founderList.locator('.founder-item');
        await expect(founderItems).toHaveCount(1);
        await expect(founderList.getByText('Founder 1')).toBeVisible();

        // 3. Click to edit the new founder's profile
        await founderList.getByRole('button', { name: 'Edit Profile' }).click();

        // 4. Verify navigation to the profile page
        await expect(page).toHaveURL(/.*founder-profile.html\?id=.*/);
        await expect(page.getByRole('heading', { name: 'Founder Profile' })).toBeVisible();

        // 5. Fill in the founder's name
        const founderName = 'Ada Lovelace';
        await page.locator('input[name="name"]').fill(founderName);

        // 6. Save and return to the main page
        await page.getByRole('button', { name: 'Save and Go to Main Page' }).click();

        // 7. Verify the user is back on the main page and the name is updated
        await expect(page).toHaveURL('/');
        await expect(founderList.getByText(founderName)).toBeVisible();
    });

});
