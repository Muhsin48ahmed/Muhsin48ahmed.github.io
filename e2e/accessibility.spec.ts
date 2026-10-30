import AxeBuilder from '@axe-core/playwright'
import { expect, test, waitForLoader } from './fixtures'

const NO_MOTION_CSS =
  '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important}'

for (const view of [
  { name: 'immersive', path: '/', hasLoader: true },
  { name: 'classic', path: '/?view=classic', hasLoader: false },
]) {
  test(`${view.name} view has no serious or critical accessibility violations`, async ({ page }) => {
    // Contrast must be measured on final colours. Disable fades before any start: a running transition
    // ignores later duration changes, and software-rendered WebGL can stall it mid-way.
    await page.addInitScript((css) => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style')
        style.textContent = css
        document.head.appendChild(style)
      })
    }, NO_MOTION_CSS)
    await page.goto(view.path)
    if (view.hasLoader) await waitForLoader(page)
    await page.evaluate(() => document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => (el.dataset.visible = 'true')))

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('canvas').analyze()
    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    const summary = blocking.flatMap((v) =>
      v.nodes.map((n) => {
        const data = n.any[0]?.data as { fgColor?: string; contrastRatio?: number } | undefined
        const detail = data?.contrastRatio ? ` [${data.fgColor} at ${data.contrastRatio}:1]` : ''
        return `${v.id} (${v.impact}): ${n.target.join(' ')}${detail}`
      }),
    )
    expect(summary, summary.join('\n')).toEqual([])
  })
}
