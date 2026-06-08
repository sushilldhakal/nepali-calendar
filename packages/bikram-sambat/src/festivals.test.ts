import { describe, it, expect } from "vitest"
import {
  NEPALI_FESTIVALS,
  getFestivalsForDate,
  getFestivalsForBSDate,
  getFestivalsForMonth,
  getFestivalsForBSMonth,
  getNationalHolidays,
  isNationalHoliday,
  isNationalHolidayBS,
  getFestivalById,
  getFestivalsByCategory,
} from "./festivals"

/** BS year aligned with bundled 2026 Gregorian holiday data */
const BS_YEAR = 2083

describe("Nepali Festivals", () => {
  describe("getFestivalsForBSDate", () => {
    it("should return Nepali New Year on Baisakh 1", () => {
      const festivals = getFestivalsForBSDate(BS_YEAR, 1, 1)
      expect(festivals.some((f) => f.id === "bs-new-year")).toBe(true)
      expect(festivals.find((f) => f.id === "bs-new-year")?.name).toBe("Nepali New Year")
    })

    it("should return empty array for dates without festivals", () => {
      const festivals = getFestivalsForBSDate(BS_YEAR, 3, 15)
      expect(festivals).toHaveLength(0)
    })

    it("should handle multi-day festivals", () => {
      const day1 = getFestivalsForBSDate(BS_YEAR, 6, 24)
      const day10 = getFestivalsForBSDate(BS_YEAR, 6, 33)

      expect(day1.some((f) => f.id === "dashain")).toBe(true)
      expect(day10.some((f) => f.id === "dashain")).toBe(true)
    })

    it("should not return festival outside its duration", () => {
      const beforeDashain = getFestivalsForBSDate(BS_YEAR, 6, 23)
      expect(beforeDashain.some((f) => f.id === "dashain")).toBe(false)
    })
  })

  describe("getFestivalsForDate", () => {
    it("should return festivals for a Gregorian date", () => {
      const festivals = getFestivalsForDate(new Date("2026-04-14"))
      expect(festivals.some((f) => f.id === "bs-new-year")).toBe(true)
    })
  })

  describe("getFestivalsForBSMonth", () => {
    it("should return all festivals in Baisakh", () => {
      const festivals = getFestivalsForBSMonth(1)
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.some((f) => f.id === "bs-new-year")).toBe(true)
    })

    it("should return festivals in Ashwin including Dashain", () => {
      const festivals = getFestivalsForBSMonth(6)
      expect(festivals.some((f) => f.id === "dashain")).toBe(true)
    })

    it("should return festivals in Bhadra including Indra Jatra", () => {
      const festivals = getFestivalsForBSMonth(5)
      expect(festivals.some((f) => f.id === "indra-jatra")).toBe(true)
    })

    it("should return an array for any BS month", () => {
      const festivals = getFestivalsForBSMonth(3)
      expect(Array.isArray(festivals)).toBe(true)
    })
  })

  describe("getFestivalsForMonth", () => {
    it("should return festivals in a Gregorian month", () => {
      const festivals = getFestivalsForMonth(4, 2026)
      expect(festivals.some((f) => f.id === "bs-new-year")).toBe(true)
    })
  })

  describe("getNationalHolidays", () => {
    it("should return only national holidays", () => {
      const holidays = getNationalHolidays()
      expect(holidays.length).toBeGreaterThan(0)
      expect(holidays.every((f) => f.isNationalHoliday)).toBe(true)
    })

    it("should include major national festivals", () => {
      const holidays = getNationalHolidays()
      const ids = holidays.map((f) => f.id)

      expect(ids).toContain("bs-new-year")
      expect(ids).toContain("dashain")
      expect(ids).toContain("tihar")
      expect(ids).toContain("buddha-jayanti")
    })
  })

  describe("isNationalHolidayBS", () => {
    it("should return true for Nepali New Year", () => {
      expect(isNationalHolidayBS(1, 1)).toBe(true)
    })

    it("should return true for days during Dashain", () => {
      expect(isNationalHolidayBS(6, 24)).toBe(true)
      expect(isNationalHolidayBS(6, 30)).toBe(true)
    })

    it("should return false for regular days", () => {
      expect(isNationalHolidayBS(1, 10)).toBe(false)
      expect(isNationalHolidayBS(3, 15)).toBe(false)
    })
  })

  describe("isNationalHoliday", () => {
    it("should return true for a known public holiday date", () => {
      expect(isNationalHoliday(new Date("2026-04-14"))).toBe(true)
    })
  })

  describe("getFestivalById", () => {
    it("should return Dashain by id", () => {
      const festival = getFestivalById("dashain")
      expect(festival).toBeDefined()
      expect(festival?.name).toBe("Dashain")
      expect(festival?.nameNepali).toBe("दशैं")
    })

    it("should return Tihar by id", () => {
      const festival = getFestivalById("tihar")
      expect(festival).toBeDefined()
      expect(festival?.name).toBe("Tihar")
    })

    it("should return undefined for non-existent id", () => {
      const festival = getFestivalById("non-existent-festival")
      expect(festival).toBeUndefined()
    })
  })

  describe("getFestivalsByCategory", () => {
    it("should return national festivals", () => {
      const festivals = getFestivalsByCategory("national")
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.every((f) => f.category === "national")).toBe(true)
    })

    it("should return religious festivals", () => {
      const festivals = getFestivalsByCategory("religious")
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.every((f) => f.category === "religious")).toBe(true)
      expect(festivals.some((f) => f.id === "buddha-jayanti")).toBe(true)
    })

    it("should return cultural festivals", () => {
      const festivals = getFestivalsByCategory("cultural")
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.every((f) => f.category === "cultural")).toBe(true)
    })

    it("should return regional festivals", () => {
      const festivals = getFestivalsByCategory("regional")
      expect(Array.isArray(festivals)).toBe(true)
    })
  })

  describe("Festival data integrity", () => {
    it("should have all required fields for each festival", () => {
      NEPALI_FESTIVALS.forEach((festival) => {
        expect(festival.id).toBeDefined()
        expect(festival.name).toBeDefined()
        expect(festival.nameNepali).toBeDefined()
        expect(festival.description).toBeDefined()
        expect(festival.category).toBeDefined()
        expect(typeof festival.isNationalHoliday).toBe("boolean")
        expect(festival.significance).toBeGreaterThanOrEqual(1)
        expect(festival.significance).toBeLessThanOrEqual(5)
        expect(festival.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(festival.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(festival.durationDays).toBeGreaterThanOrEqual(1)
        expect(festival.year).toBeGreaterThan(2000)
      })
    })

    it("should have unique festival IDs", () => {
      const ids = NEPALI_FESTIVALS.map((f) => f.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })
  })
})
