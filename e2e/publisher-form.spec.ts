import { expect, test } from '@playwright/test'

const adminPath = process.env.VITE_ADMIN_SECRET_PATH ?? 'hello-new-s'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('admin_token', 'e2e-token')
    window.sessionStorage.setItem('admin_token_expiry', String(Date.now() + 60 * 60 * 1000))
  })
})

test('publisher form enables submit after required fields are filled', async ({ page }) => {
  await page.goto(`/admin/${adminPath}/publishers/new`)

  const saveButton = page.getByRole('button', { name: /저장하기/ })
  await expect(saveButton).toBeDisabled()

  await page.getByPlaceholder('예: 더 에디토리얼').fill('테스트 언론사')
  await page.getByRole('combobox').selectOption('US')
  await page.getByPlaceholder('https://example.com/feed.xml').fill('https://example.com/rss.xml')

  await expect(saveButton).toBeEnabled()
})
