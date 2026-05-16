import { describe, expect, it } from "vitest"
import { adToBS, bsToAD, getBSMonthLength } from "./index"

describe("bikram-sambat", () => {
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
    expect(getBSMonthLength(2082, 3)).toBe(32)
  })
})
