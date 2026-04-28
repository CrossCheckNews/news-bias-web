import { expect, test } from '@playwright/test'

const adminPath = process.env.VITE_ADMIN_SECRET_PATH ?? 'hello-new-s'

test('admin can log in and land on the dashboard', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ token: 'e2e-token', tokenType: 'Bearer', expiresIn: 3600 }),
    })
  })

  await page.route('**/api/dashboard/summary', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        totalArticles: 10,
        totalTopics: 2,
        todayCollectedArticles: 3,
        failedJobs: 0,
        lastCollectedAt: '2026-04-28T10:00:00',
        recentRuns: [],
      }),
    })
  })

  await page.route('**/api/dashboard/charts', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        articlesByPublisher: [{ name: 'CNN', count: 5 }],
        topicsByCountry: [{ name: 'US', count: 2 }],
        pipelineStatusCounts: [
          { name: 'RUNNING', count: 0 },
          { name: 'SUCCESS', count: 1 },
          { name: 'FAILED', count: 0 },
        ],
      }),
    })
  })

  await page.route('**/api/pipeline/stream', async (route) => {
    await route.fulfill({
      headers: { 'content-type': 'text/event-stream' },
      body: ': connected\n\n',
    })
  })

  await page.goto('/login')
  await page.getByLabel('아이디').fill('admin')
  await page.getByLabel('비밀번호').fill('admin1234')
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL(new RegExp(`/admin/${adminPath}/dashboard$`))
  await expect(page.getByText('Pipeline Dashboard')).toBeVisible()
})
