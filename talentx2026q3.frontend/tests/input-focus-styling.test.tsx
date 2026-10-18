import React from "react"
import { render, screen } from "@testing-library/react"
import fs from "fs"
import path from "path"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

describe("Phase 1: Global Input Focus Styling & Brand Theme Alignment", () => {
  describe("globals.css", () => {
    const globalsCssPath = path.resolve(__dirname, "../app/globals.css")
    const globalsCss = fs.readFileSync(globalsCssPath, "utf8")

    it("defines emerald ring token in :root", () => {
      expect(globalsCss).toMatch(/--ring:\s*oklch\(0\.55\s+0\.18\s+160\);/)
    })

    it("defines emerald ring token in .dark", () => {
      expect(globalsCss).toMatch(/--ring:\s*oklch\(0\.65\s+0\.18\s+160\);/)
    })

    it("configures focus-visible styling for text inputs and textareas in @layer base", () => {
      expect(globalsCss).toContain(
        'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):focus-visible'
      )
      expect(globalsCss).toContain("textarea:focus-visible")
      expect(globalsCss).toContain("select:focus-visible")
      expect(globalsCss).toContain("border-color: #059669;")
      expect(globalsCss).toContain("box-shadow: none;")
    })

    it("verifies button, [role=\"button\"], and select have cursor: pointer in globals.css", () => {
      expect(globalsCss).toContain("button,")
      expect(globalsCss).toContain('[role="button"],')
      expect(globalsCss).toContain("select,")
      expect(globalsCss).toContain("cursor: pointer;")
    })

    it("ensures aria-invalid focus styles take precedence with destructive color", () => {
      expect(globalsCss).toContain('input[type="text"][aria-invalid="true"]:focus-visible')
      expect(globalsCss).toContain('textarea[aria-invalid="true"]:focus-visible')
      expect(globalsCss).toContain("border-color: var(--destructive);")
    })
  })

  describe("Input component", () => {
    it("renders with emerald focus-visible border and ring classes", () => {
      render(<Input data-testid="test-input" />)
      const input = screen.getByTestId("test-input")

      expect(input.className).toContain("focus-visible:border-emerald-600")
      expect(input.className).toContain("focus-visible:ring-0")
    })

    it("preserves aria-invalid destructive styling classes", () => {
      render(<Input data-testid="test-input-invalid" aria-invalid="true" />)
      const input = screen.getByTestId("test-input-invalid")

      expect(input.className).toContain("aria-invalid:border-destructive")
    })
  })

  describe("Textarea component", () => {
    it("renders with emerald focus-visible border and ring classes", () => {
      render(<Textarea data-testid="test-textarea" />)
      const textarea = screen.getByTestId("test-textarea")

      expect(textarea.className).toContain("focus-visible:border-emerald-600")
      expect(textarea.className).toContain("focus-visible:ring-0")
    })

    it("preserves aria-invalid destructive styling classes", () => {
      render(<Textarea data-testid="test-textarea-invalid" aria-invalid="true" />)
      const textarea = screen.getByTestId("test-textarea-invalid")

      expect(textarea.className).toContain("aria-invalid:border-destructive")
    })
  })

  describe("Select component", () => {
    it("renders SelectTrigger with emerald focus-visible border and ring classes", () => {
      render(
        <Select>
          <SelectTrigger data-testid="test-select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId("test-select-trigger")

      expect(trigger.className).toContain("focus-visible:border-emerald-600")
      expect(trigger.className).toContain("focus-visible:ring-0")
      expect(trigger.className).toContain("focus:ring-0")
      expect(trigger.className).toContain("cursor-pointer")
    })

    it("preserves aria-invalid destructive styling classes on SelectTrigger", () => {
      render(
        <Select>
          <SelectTrigger data-testid="test-select-trigger-invalid" aria-invalid="true">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId("test-select-trigger-invalid")

      expect(trigger.className).toContain("aria-invalid:border-destructive")
      expect(trigger.className).toContain("aria-invalid:ring-destructive/20")
    })
  })

  describe("Button component", () => {
    it("renders with cursor-pointer and rounded-md classes", () => {
      render(<Button data-testid="test-button">Click me</Button>)
      const button = screen.getByTestId("test-button")

      expect(button.className).toContain("cursor-pointer")
      expect(button.className).toContain("rounded-md")
    })
  })
})
