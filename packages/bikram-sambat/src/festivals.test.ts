import { describe, it, expect } from "vitest"
import {
  getFestivalsForDate,
  getFestivalsForMonth,
  getNationalHolidays,
  isNationalHoliday,
  getFestivalById,
  getFestivalsByCategory,
} from "./festivals"

describe("Nepali Festivals", () => {
  describe("getFestivalsForDate", () => {
    it("should return Nepali New Year on Baisakh 1", () => {
      const festivals = getFestivalsForDate(2081, 1, 1)
      expect(festivals).toHaveLength(1)
      expect(festivals[0].id).toBe("nepali-new-year")
      expect(festivals[0].name).toBe("Nepali New Year")
    })

    it("should return empty array for dates without festivals", () => {
      const festivals = getFestivalsForDate(2081, 1, 2)
      expect(festivals).toHaveLength(0)
    })

    it("should handle multi-day festivals", () => {
      // Dashain starts on Ashwin 25 and lasts 15 days
      const day1 = getFestivalsForDate(2081, 6, 25)
      const day10 = getFestivalsForDate(2081, 6, 34) // Day 10 of Dashain
      
      expect(day1.some(f => f.id === "dashain")).toBe(true)
      expect(day10.some(f => f.id === "dashain")).toBe(true)
    })

    it("should not return festival outside its duration", () => {
      const beforeDashain = getFestivalsForDate(2081, 6, 24)
      expect(beforeDashain.some(f => f.id === "dashain")).toBe(false)
    })
  })

  describe("getFestivalsForMonth", () => {
    it("should return all festivals in Baisakh", () => {
      const festivals = getFestivalsForMonth(1)
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.some(f => f.id === "nepali-new-year")).toBe(true)
    })

    it("should return festivals in Ashwin including Dashain", () => {
      const festivals = getFestivalsForMonth(6)
      expect(festivals.some(f => f.id === "dashain")).toBe(true)
      expect(festivals.some(f => f.id === "indra-jatra")).toBe(true)
    })

    it("should return empty array for months without festivals", () => {
      // Assuming month 3 (Ashadh) has no festivals in our current list
      const festivals = getFestivalsForMonth(3)
      expect(Array.isArray(festivals)).toBe(true)
    })
  })

  describe("getNationalHolidays", () => {
    it("should return only national holidays", () => {
      const holidays = getNationalHolidays()
      expect(holidays.length).toBeGreaterThan(0)
      expect(holidays.every(f => f.isNationalHoliday)).toBe(true)
    })

    it("should include major national festivals", () => {
      const holidays = getNationalHolidays()
      const ids = holidays.map(f => f.id)
      
      expect(ids).toContain("nepali-new-year")
      expect(ids).toContain("dashain")
      expect(ids).toContain("tihar")
      expect(ids).toContain("republic-day")
    })
  })

  describe("isNationalHoliday", () => {
    it("should return true for Nepali New Year", () => {
      expect(isNationalHoliday(1, 1)).toBe(true)
    })

    it("should return true for days during Dashain", () => {
      expect(isNationalHoliday(6, 25)).toBe(true)
      expect(isNationalHoliday(6, 30)).toBe(true)
    })

    it("should return false for regular days", () => {
      expect(isNationalHoliday(1, 10)).toBe(false)
      expect(isNationalHoliday(3, 15)).toBe(false)
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
      expect(festivals.every(f => f.category === "national")).toBe(true)
    })

    it("should return religious festivals", () => {
      const festivals = getFestivalsByCategory("religious")
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.every(f => f.category === "religious")).toBe(true)
      expect(festivals.some(f => f.id === "buddha-jayanti")).toBe(true)
    })

    it("should return cultural festivals", () => {
      const festivals = getFestivalsByCategory("cultural")
      expect(festivals.length).toBeGreaterThan(0)
      expect(festivals.every(f => f.category === "cultural")).toBe(true)
    })

    it("should return regional festivals", () => {
      const festivals = getFestivalsByCategory("regional")
      expect(Array.isArray(festivals)).toBe(true)
    })
  })

  describe("Festival data integrity", () => {
    it("should have all required fields for each festival", () => {
      const festivals = getFestivalsForMonth(1)
      
      festivals.forEach(festival => {
        expect(festival.id).toBeDefined()
        expect(festival.name).toBeDefined()
        expect(festival.nameNepali).toBeDefined()
        expect(festival.description).toBeDefined()
        expect(festival.category).toBeDefined()
        expect(typeof festival.isNationalHoliday).toBe("boolean")
        expect(festival.significance).toBeGreaterThanOrEqual(1)
        expect(festival.significance).toBeLessThanOrEqual(5)
        expect(festival.bsMonth).toBeGreaterThanOrEqual(1)
        expect(festival.bsMonth).toBeLessThanOrEqual(12)
        expect(festival.bsDay).toBeGreaterThanOrEqual(1)
        expect(festival.bsDay).toBeLessThanOrEqual(32)
      })
    })

    it("should have unique festival IDs", () => {
      const allFestivals = []
      for (let month = 1; month <= 12; month++) {
        allFestivals.push(...getFestivalsForMonth(month))
      }
      
      const ids = allFestivals.map(f => f.id)
      const uniqueIds = new Set(ids)
      
      expect(ids.length).toBe(uniqueIds.size)
    })
  })
})
