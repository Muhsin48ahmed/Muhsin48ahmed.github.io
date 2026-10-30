import { test as base, expect, type Page } from '@playwright/test'

/** Fails the test on any uncaught page error. */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await use(errors)
      expect(errors, 'uncaught page errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/** Waits for the intro loader to finish (or its failsafe to fire). */
export async function waitForLoader(page: Page) {
  await expect(page.getByRole('progressbar', { name: /loading/i })).toBeHidden({ timeout: 30_000 })
}
