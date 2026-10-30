import { expect, test } from './fixtures'

test.describe('classic view', () => {
  test('loads without the 3D world or the loader', async ({ page }) => {
    await page.goto('/?view=classic')
    await expect(page.getByRole('heading', { level: 1, name: 'Muhsin Ahmed' })).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.getByRole('progressbar')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-view', 'classic')
  })

  test('shows every project in full, with the surge lab inline', async ({ page }) => {
    await page.goto('/?view=classic#projects')
    const surge = page.getByRole('article', { name: 'Nairobi Surge Pricing Prediction' })
    await surge.scrollIntoViewIfNeeded()
    await expect(surge.getByRole('link', { name: /live demo/i })).toHaveAttribute('href', /streamlit\.app/)
    await expect(surge.getByRole('img').first()).toBeVisible()

    const status = surge.getByRole('status')
    const before = await status.textContent()
    await surge.getByRole('combobox', { name: /zone/i }).selectOption('cbd')
    await expect(status).not.toHaveText(before ?? '')
    await expect(page.locator('#projects').getByRole('article')).toHaveCount(5)
  })

  test('highlights the section being read and switches back to 3D', async ({ page }) => {
    await page.goto('/?view=classic')
    await page.getByRole('banner').getByRole('link', { name: 'Contact' }).click()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'location')

    await page.getByRole('banner').getByRole('link', { name: '3D view' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('data-view', 'immersive')
  })
})

test('the hero offers the classic view from the 3D page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Classic view', exact: true }).click()
  await expect(page).toHaveURL(/\?view=classic$/)
  await expect(page.locator('canvas')).toHaveCount(0)
})
