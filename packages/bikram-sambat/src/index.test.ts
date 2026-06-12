import { describe, expect, it } from "vitest"
import {
  BS_SUPPORTED_END_YEAR,
  BS_SUPPORTED_START_YEAR,
  adToBS,
  bsToAD,
  getBSMonthLength,
  isBSSupportedYear,
} from "./index"

describe("bikram-sambat", () => {
  it("exposes offline range from 1700 through 2200 BS", () => {
    expect(BS_SUPPORTED_START_YEAR).toBe(1700)
    expect(BS_SUPPORTED_END_YEAR).toBe(2200)
    expect(isBSSupportedYear(1700)).toBe(true)
    expect(isBSSupportedYear(2200)).toBe(true)
    expect(isBSSupportedYear(1699)).toBe(false)
    expect(isBSSupportedYear(2201)).toBe(false)
  })

  it("converts historical BS 1700 Baisakh 1", () => {
    const ad = bsToAD(1700, 1, 1)
    expect(ad.getFullYear()).toBe(1643)
    expect(ad.getMonth()).toBe(3) // April (0-indexed)
    expect(ad.getDate()).toBe(9)
  })

  it("converts Baisakh 1 2082 to known AD date", () => {
    const ad = bsToAD(2082, 1, 1)
    expect(ad.getFullYear()).toBe(2025)
    expect(ad.getMonth()).toBe(3) // April (0-indexed)
    expect(ad.getDate()).toBe(14)
  })

  it("round-trips AD → BS → same calendar day", () => {
    const ad = new Date(2025, 5, 15)
    const bs = adToBS(ad)
    const back = bsToAD(bs.year, bs.month, bs.day)
    expect(back.getFullYear()).toBe(ad.getFullYear())
    expect(back.getMonth()).toBe(ad.getMonth())
    expect(back.getDate()).toBe(ad.getDate())
  })

  it("returns authoritative month lengths for 2082", () => {
    expect(getBSMonthLength(2082, 1)).toBe(31)
    expect(getBSMonthLength(2082, 2)).toBe(31)
    expect(getBSMonthLength(2082, 3)).toBe(31)
    expect(getBSMonthLength(2082, 4)).toBe(32)
  })

  it("converts far-future BS 2200 Baisakh 1", () => {
    const ad = bsToAD(2200, 1, 1)
    expect(ad.getFullYear()).toBe(2143)
    expect(ad.getMonth()).toBe(3)
    expect(ad.getDate()).toBe(17)
  })

  it("round-trips a mid-range future date", () => {
    const ad = new Date(2050, 8, 20)
    const bs = adToBS(ad)
    const back = bsToAD(bs.year, bs.month, bs.day)
    expect(back.getFullYear()).toBe(ad.getFullYear())
    expect(back.getMonth()).toBe(ad.getMonth())
    expect(back.getDate()).toBe(ad.getDate())
  })
})
