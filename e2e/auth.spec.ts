import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should show login form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
    await expect(page.getByLabel("Contraseña")).toBeVisible()
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible()
  })

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await expect(page.getByText("El correo es obligatorio")).toBeVisible()
  })

  test("should enter demo mode", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Entrar en modo demo" }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Entrar en modo demo" }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test("should display portal cards", async ({ page }) => {
    await expect(page.getByText("Sala de Portales")).toBeVisible()
    await expect(page.getByText("Total")).toBeVisible()
    await expect(page.getByText("Activos")).toBeVisible()
  })

  test("should search portals", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Buscar por nombre, categoría o módulo...")
    await searchInput.fill("ERP")
    await expect(page.getByText("ERP Acme Corp")).toBeVisible()
  })
})

test.describe("Generator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Entrar en modo demo" }).click()
    await page.waitForURL(/\/dashboard/)
    await page.goto("/generator")
  })

  test("should display module catalog", async ({ page }) => {
    await expect(page.getByText("Generador de Sistemas")).toBeVisible()
    await expect(page.getByText("ERP")).toBeVisible()
  })

  test("should add and remove modules", async ({ page }) => {
    await page.getByRole("button", { name: "Agregar" }).first().click()
    await expect(page.getByText("Tu Lista")).toBeVisible()
    await expect(page.getByText("1 módulo")).toBeVisible()
    await page.getByRole("button", { name: "Quitar" }).first().click()
    await expect(page.getByText("0 módulos")).toBeVisible()
  })
})
