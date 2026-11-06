import { expect, test } from '@playwright/test'

test('/pomo/ renders the Koidoro timer', async ({ page }) => {
  await page.goto('/pomo/')
  await expect(page.getByRole('heading', { name: 'Koidoro' })).toBeVisible()
  await expect(page.locator('button.primary')).toBeVisible()
})

test('/pomo without a slash redirects to the timer', async ({ page }) => {
  await page.goto('/pomo')
  await expect(page).toHaveURL(/\/pomo\/$/)
  await expect(page.getByRole('heading', { name: 'Koidoro' })).toBeVisible()
})
