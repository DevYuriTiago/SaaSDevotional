// PATH: tests/e2e/landing.spec.ts

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Landing page", () => {
  // 1. Título correto
  test("página inicial carrega com título correto", async ({ page }) => {
    await page.goto(BASE_URL);

    // Aceita título na <title> ou em um <h1>
    const title = await page.title();
    const h1Text = await page.locator("h1").first().textContent().catch(() => "");

    const hasTitle =
      title.includes("Sentindo Hoje") ||
      title.includes("O Que Você Está Sentindo Hoje") ||
      (h1Text ?? "").includes("Sentindo Hoje") ||
      (h1Text ?? "").includes("O Que Você Está Sentindo Hoje");

    expect(hasTitle).toBe(true);
  });

  // 2. Link "Entrar" aponta para /login
  test("link 'Entrar' está visível e aponta para /login", async ({ page }) => {
    await page.goto(BASE_URL);

    const link = page.getByRole("link", { name: /entrar/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /\/login/);
  });

  // 3. Seção de features menciona jornadas de 21 dias
  test("seção de features contém texto 'Jornadas de 21 dias'", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(
      page.getByText(/jornadas de 21 dias/i)
    ).toBeVisible();
  });

  // 4. Página responde em menos de 3 segundos
  test("página responde em menos de 3 segundos", async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });

  // 5. Meta description existe
  test("meta description existe", async ({ page }) => {
    await page.goto(BASE_URL);

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);

    const content = await metaDescription.getAttribute("content");
    expect(content).toBeTruthy();
    expect((content ?? "").length).toBeGreaterThan(0);
  });

  // 6. Viewport mobile 375×667 não tem overflow horizontal
  test("viewport mobile 375x667 não tem overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
