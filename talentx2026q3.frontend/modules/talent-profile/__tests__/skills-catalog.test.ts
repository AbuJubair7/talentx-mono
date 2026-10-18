import {
  SKILLS_CATALOG,
  SOFT_SKILLS,
  TECHNICAL_SKILLS,
  TOOLS_AND_PLATFORMS,
} from "../constants/skills-catalog"

describe("skills-catalog", () => {
  it.each([
    ["technical", TECHNICAL_SKILLS, 100],
    ["soft", SOFT_SKILLS, 30],
    ["toolsAndPlatforms", TOOLS_AND_PLATFORMS, 50],
  ])("%s list is a large non-empty set", (_name, list, minSize) => {
    expect(list.length).toBeGreaterThanOrEqual(minSize)
  })

  it.each([
    ["technical", TECHNICAL_SKILLS],
    ["soft", SOFT_SKILLS],
    ["toolsAndPlatforms", TOOLS_AND_PLATFORMS],
  ])("%s list has trimmed, non-blank entries", (_name, list) => {
    for (const entry of list) {
      expect(entry.trim().length).toBeGreaterThan(0)
      expect(entry).toBe(entry.trim())
    }
  })

  it.each([
    ["technical", TECHNICAL_SKILLS],
    ["soft", SOFT_SKILLS],
    ["toolsAndPlatforms", TOOLS_AND_PLATFORMS],
  ])("%s list has no case-insensitive duplicates", (_name, list) => {
    const lowered = list.map((entry) => entry.toLowerCase())
    expect(new Set(lowered).size).toBe(list.length)
  })

  it("exposes every category through SKILLS_CATALOG", () => {
    expect(SKILLS_CATALOG.technical).toBe(TECHNICAL_SKILLS)
    expect(SKILLS_CATALOG.soft).toBe(SOFT_SKILLS)
    expect(SKILLS_CATALOG.toolsAndPlatforms).toBe(TOOLS_AND_PLATFORMS)
  })
})
