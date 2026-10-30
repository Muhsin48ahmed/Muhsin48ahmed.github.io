import { expect, test, waitForLoader } from './fixtures'

test.describe('immersive view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForLoader(page)
  })

  test('shows the hero with name, role and stats once loaded', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Muhsin Ahmed' })).toBeVisible()
    await expect(page.getByText('Full-Stack Engineer & Data Scientist').first()).toBeVisible()
    await expect(page.getByText('53k+', { exact: true })).toBeVisible()
  })

  test('navigating to a section updates the active menu item', async ({ page, isMobile }) => {
    await page.getByRole('banner').getByRole('link', { name: 'Projects' }).click()
    await expect(page).toHaveURL(/#projects$/)
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeInViewport()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'location')
    if (!isMobile) {
      await expect(page.locator('nav[aria-label="Zones"] a[aria-current="location"]')).toContainText('Projects')
    }
  })

  test('opens a project, runs the surge lab and closes with Escape', async ({ page }) => {
    await page.locator('#projects').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: /Nairobi Surge Pricing Prediction/ }).click()

    const dialog = page.getByRole('dialog', { name: 'Nairobi Surge Pricing Prediction' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: /live demo/i })).toHaveAttribute('href', /streamlit\.app/)

    const status = dialog.getByRole('status')
    const slider = dialog.getByRole('slider', { name: /hour/i })
    await slider.focus()
    await slider.press('Home') // 00:00, off-peak
    const offPeak = Number((await status.textContent())?.match(/(\d+)%/)?.[1])
    await slider.press('End') // 23:00, still off-peak
    await dialog.getByRole('switch', { name: 'Rain' }).click()
    await dialog.getByRole('combobox', { name: /zone/i }).selectOption('cbd')
    await expect(status).not.toHaveText(new RegExp(`^${offPeak}%`))
    const rainyCbd = Number((await status.textContent())?.match(/(\d+)%/)?.[1])
    expect(rainyCbd).toBeGreaterThan(offPeak)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('validates the contact form and confirms a sent message', async ({ page }) => {
    let posted: unknown = null
    await page.route('https://formspree.io/**', async (route) => {
      posted = route.request().postDataJSON()
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    })
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const form = page.locator('form')
    await form.getByRole('button', { name: /send/i }).click()
    await expect(form.getByRole('alert')).toHaveCount(3)

    await form.getByLabel('Name').fill('Ada Lovelace')
    await form.getByLabel('Email').fill('ada@example.com')
    await form.getByLabel('Message').fill('Hello Muhsin, I have a data science role for you.')
    await form.getByRole('button', { name: /send/i }).click()
    await expect(page.getByText(/thanks — message received/i)).toBeVisible()
    expect(posted).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' })
  })

  test('the résumé button serves the PDF', async ({ page, request }) => {
    const link = page.getByRole('link', { name: /download résumé/i })
    await expect(link).toHaveAttribute('href', '/resume.pdf')
    const response = await request.get('/resume.pdf')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
  })

  test('never scrolls sideways', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
