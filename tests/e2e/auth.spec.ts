// PATH: tests/e2e/auth.spec.ts

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Fluxo de autenticação", () => {
  // 1. /login carrega com campos email e password
  test("/login carrega formulário com campos email e password", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  // 2. Submit com campos vazios mostra validação
  test("/login com campos vazios mostra validação (botão disabled ou mensagem de erro)", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const submitButton = page.getByRole("button", { name: /entrar|login|acessar/i });

    // Tenta submeter sem preencher
    await submitButton.click();

    // Aceita: botão disabled OU mensagem de erro OU validação HTML5 (campo required)
    const isDisabled = await submitButton.isDisabled();
    const hasError = await page.locator('[role="alert"], .error, [data-error]').count() > 0;
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const hasValidationMessage = await emailInput.evaluate(
      (el) => (el as HTMLInputElement).validity?.valueMissing ?? false
    );

    expect(isDisabled || hasError || hasValidationMessage).toBe(true);
  });

  // 3. /signup carrega com campos nome, email e senha
  test("/signup carrega formulário com campos nome, email e senha", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    await expect(
      page.locator('input[name="name"], input[placeholder*="nome" i], input[id*="name" i]').first()
    ).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  // 4. /forgot-password carrega com campo de email
  test("/forgot-password carrega com campo de email visível", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);

    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  // 5. Rota protegida /dashboard redireciona para /login
  test("acessar /dashboard sem login redireciona para /login", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  // 6. Rota protegida /journey redireciona para /login
  test("acessar /journey sem login redireciona para /login", async ({ page }) => {
    await page.goto(`${BASE_URL}/journey`);

    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});
