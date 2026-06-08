/**
 * Nepali Festivals and Holidays
 * 
 * This module provides festival/holiday data for Bikram Sambat dates.
 * Festivals are categorized by type and significance.
 * Data sourced from accurate festival calculations for 2026-2028.
 */

import { adToBS } from "./index"
import { holiday } from "./holiday"

export type FestivalCategory = "national" | "religious" | "cultural" | "regional"

export type Festival = {
  id: string
  name: string
  nameNepali: string
  description: string
  category: FestivalCategory
  isNationalHoliday: boolean
  significance: 1 | 2 | 3 | 4 | 5 // 5 = most significant
  /** Gregorian start date YYYY-MM-DD */
  startDate: string
  /** Gregorian end date YYYY-MM-DD */
  endDate: string
  /** Duration in days for multi-day festivals */
  durationDays: number
  /** Year this festival date applies to */
  year: number
}

// Festival metadata (names, categories, significance)
const FESTIVAL_META: Record<string, {
  name: string
  nameNepali: string
  description: string
  category: FestivalCategory
  isNationalHoliday: boolean
  significance: 1 | 2 | 3 | 4 | 5
}> = {
  "bs-new-year": {
    name: "Nepali New Year",
    nameNepali: "नयाँ वर्ष",
    description: "First day of the Nepali calendar year",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "buddha-jayanti": {
    name: "Buddha Jayanti",
    nameNepali: "बुद्ध जयन्ती",
    description: "Birthday of Lord Buddha",
    category: "religious",
    isNationalHoliday: true,
    significance: 5,
  },
  "janai-purnima": {
    name: "Janai Purnima",
    nameNepali: "जनै पूर्णिमा",
    description: "Sacred thread festival",
    category: "religious",
    isNationalHoliday: true,
    significance: 4,
  },
  "gai-jatra": {
    name: "Gai Jatra",
    nameNepali: "गाई जात्रा",
    description: "Cow festival to honor deceased",
    category: "cultural",
    isNationalHoliday: false,
    significance: 4,
  },
  "krishna-janmashtami": {
    name: "Krishna Janmashtami",
    nameNepali: "कृष्ण जन्माष्टमी",
    description: "Birthday of Lord Krishna",
    category: "religious",
    isNationalHoliday: true,
    significance: 5,
  },
  "teej": {
    name: "Teej",
    nameNepali: "तीज",
    description: "Festival for women, honoring Goddess Parvati",
    category: "religious",
    isNationalHoliday: true,
    significance: 5,
  },
  "rishitarpani": {
    name: "Rishi Panchami",
    nameNepali: "ऋषि पञ्चमी",
    description: "Day to honor the seven sages",
    category: "religious",
    isNationalHoliday: false,
    significance: 3,
  },
  "indra-jatra": {
    name: "Indra Jatra",
    nameNepali: "इन्द्र जात्रा",
    description: "Festival honoring Indra, the king of heaven",
    category: "cultural",
    isNationalHoliday: false,
    significance: 4,
  },
  "dashain": {
    name: "Dashain",
    nameNepali: "दशैं",
    description: "Nepal's greatest festival celebrating victory of good over evil",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "vijaya-dashami": {
    name: "Vijaya Dashami",
    nameNepali: "विजया दशमी",
    description: "The main day of Dashain festival",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "tihar": {
    name: "Tihar",
    nameNepali: "तिहार",
    description: "Festival of lights celebrating various animals and Goddess Laxmi",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "laxmi-puja": {
    name: "Laxmi Puja",
    nameNepali: "लक्ष्मी पूजा",
    description: "Main day of Tihar, worshiping Goddess Laxmi",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "bhai-tika": {
    name: "Bhai Tika",
    nameNepali: "भाई टीका",
    description: "Festival celebrating brother-sister relationship",
    category: "national",
    isNationalHoliday: true,
    significance: 5,
  },
  "chhath": {
    name: "Chhath",
    nameNepali: "छठ",
    description: "Ancient festival dedicated to Sun God",
    category: "religious",
    isNationalHoliday: true,
    significance: 5,
  },
  "maghe-sankranti": {
    name: "Maghe Sankranti",
    nameNepali: "माघे सङ्क्रान्ति",
    description: "Harvest festival marking the beginning of warmer weather",
    category: "cultural",
    isNationalHoliday: false,
    significance: 4,
  },
  "sonam-lhosar": {
    name: "Sonam Lhosar",
    nameNepali: "सोनाम ल्होसार",
    description: "Tamang New Year",
    category: "cultural",
    isNationalHoliday: true,
    significance: 4,
  },
  "shivaratri": {
    name: "Maha Shivaratri",
    nameNepali: "महाशिवरात्रि",
    description: "Great night of Lord Shiva",
    category: "religious",
    isNationalHoliday: true,
    significance: 5,
  },
  "holi": {
    name: "Holi",
    nameNepali: "होली",
    description: "Festival of colors celebrating spring",
    category: "cultural",
    isNationalHoliday: true,
    significance: 5,
  },
  "ghode-jatra": {
    name: "Ghode Jatra",
    nameNepali: "घोडे जात्रा",
    description: "Horse festival celebrated in Kathmandu",
    category: "cultural",
    isNationalHoliday: false,
    significance: 3,
  },
  "nag-panchami": {
    name: "Nag Panchami",
    nameNepali: "नाग पञ्चमी",
    description: "Festival worshiping the snake god",
    category: "religious",
    isNationalHoliday: false,
    significance: 3,
  },
  "saraswati-puja": {
    name: "Saraswati Puja",
    nameNepali: "सरस्वती पूजा",
    description: "Worship of Goddess Saraswati, goddess of knowledge",
    category: "religious",
    isNationalHoliday: false,
    significance: 4,
  },
  "gyalpo-lhosar": {
    name: "Gyalpo Lhosar",
    nameNepali: "ग्याल्पो ल्होसार",
    description: "Sherpa New Year",
    category: "cultural",
    isNationalHoliday: false,
    significance: 3,
  },
  "fagu-purnima": {
    name: "Fagu Purnima",
    nameNepali: "फागु पूर्णिमा",
    description: "Full moon festival in Falgun",
    category: "religious",
    isNationalHoliday: false,
    significance: 3,
  },
  "tamu-lhosar": {
    name: "Tamu Lhosar",
    nameNepali: "तामु ल्होसार",
    description: "Gurung New Year",
    category: "cultural",
    isNationalHoliday: false,
    significance: 3,
  },
  "yomari-punhi": {
    name: "Yomari Punhi",
    nameNepali: "योमरी पुन्ही",
    description: "Newari festival celebrating harvest",
    category: "cultural",
    isNationalHoliday: false,
    significance: 3,
  },
  "mha-puja": {
    name: "Mha Puja",
    nameNepali: "म्ह पूजा",
    description: "Newari festival celebrating self",
    category: "cultural",
    isNationalHoliday: false,
    significance: 3,
  },
  // Add more as needed with defaults for unknown ones
}

// Default metadata for festivals not in our mapping
const DEFAULT_META = {
  category: "cultural" as FestivalCategory,
  isNationalHoliday: false,
  significance: 3 as 1 | 2 | 3 | 4 | 5,
}

/**
 * Build festivals array from holiday data
 */
export const NEPALI_FESTIVALS: Festival[] = holiday.festivals.map((fest) => {
  const meta = FESTIVAL_META[fest.festival_id] || {
    name: fest.festival_id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    nameNepali: fest.festival_id,
    description: "",
    ...DEFAULT_META,
  }

  return {
    id: fest.festival_id,
    name: meta.name,
    nameNepali: meta.nameNepali,
    description: meta.description,
    category: meta.category,
    isNationalHoliday: meta.isNationalHoliday,
    significance: meta.significance,
    startDate: fest.start,
    endDate: fest.end,
    durationDays: fest.duration_days,
    year: holiday.year,
  }
})

/**
 * Get festivals for a specific date
 * @param date - JavaScript Date object
 */
export function getFestivalsForDate(date: Date): Festival[] {
  const dateStr = date.toISOString().split("T")[0]
  
  return NEPALI_FESTIVALS.filter((festival) => {
    // Check if the date falls within the festival period
    return dateStr >= festival.startDate && dateStr <= festival.endDate
  })
}

/**
 * Get festivals for a specific BS date
 */
export function getFestivalsForBSDate(bsYear: number, bsMonth: number, bsDay: number): Festival[] {
  // bsYear is kept for potential future year-specific festival calculations
  void bsYear
  
  // Convert BS to AD and use the AD-based lookup
  try {
    // For now, return all festivals and let the calendar component filter
    // This is a simplified version - proper implementation would convert BS to AD
    return NEPALI_FESTIVALS.filter((festival) => {
      const festStart = new Date(festival.startDate)
      const festStartBS = adToBS(festStart)
      const festEnd = new Date(festival.endDate)
      const festEndBS = adToBS(festEnd)
      
      // Check if BS date falls within festival range
      if (festStartBS.month === bsMonth || festEndBS.month === bsMonth) {
        if (festStartBS.month === bsMonth && festEndBS.month === bsMonth) {
          return bsDay >= festStartBS.day && bsDay <= festEndBS.day
        } else if (festStartBS.month === bsMonth) {
          return bsDay >= festStartBS.day
        } else if (festEndBS.month === bsMonth) {
          return bsDay <= festEndBS.day
        }
      }
      return false
    })
  } catch (error) {
    console.error("Error converting BS to AD:", error)
    return []
  }
}

/**
 * Get festivals for a specific month
 * @param month - Gregorian month (1-12)
 * @param year - Gregorian year
 */
export function getFestivalsForMonth(month: number, year: number = holiday.year): Festival[] {
  return NEPALI_FESTIVALS.filter((festival) => {
    const startDate = new Date(festival.startDate)
    const endDate = new Date(festival.endDate)
    
    return (
      (startDate.getMonth() + 1 === month && startDate.getFullYear() === year) ||
      (endDate.getMonth() + 1 === month && endDate.getFullYear() === year)
    )
  })
}

/**
 * Get festivals for a specific BS month
 */
export function getFestivalsForBSMonth(bsMonth: number): Festival[] {
  return NEPALI_FESTIVALS.filter((festival) => {
    const startDate = new Date(festival.startDate)
    const endDate = new Date(festival.endDate)
    const startBS = adToBS(startDate)
    const endBS = adToBS(endDate)
    
    return startBS.month === bsMonth || endBS.month === bsMonth
  })
}

/**
 * Get national holidays only
 */
export function getNationalHolidays(): Festival[] {
  return NEPALI_FESTIVALS.filter((festival) => festival.isNationalHoliday)
}

/**
 * Get festivals by category
 */
export function getFestivalsByCategory(category: FestivalCategory): Festival[] {
  return NEPALI_FESTIVALS.filter((festival) => festival.category === category)
}

/**
 * Check if a specific date is a national holiday
 * @param date - JavaScript Date object
 */
export function isNationalHoliday(date: Date): boolean {
  const festivals = getFestivalsForDate(date)
  return festivals.some((festival) => festival.isNationalHoliday)
}

/**
 * Check if a specific BS date is a national holiday
 */
export function isNationalHolidayBS(bsMonth: number, bsDay: number): boolean {
  return NEPALI_FESTIVALS.some((festival) => {
    const startDate = new Date(festival.startDate)
    const endDate = new Date(festival.endDate)
    const startBS = adToBS(startDate)
    const endBS = adToBS(endDate)
    
    if (!festival.isNationalHoliday) return false
    
    // Check if BS date falls within festival range
    if (startBS.month === bsMonth || endBS.month === bsMonth) {
      if (startBS.month === bsMonth && endBS.month === bsMonth) {
        return bsDay >= startBS.day && bsDay <= endBS.day
      } else if (startBS.month === bsMonth) {
        return bsDay >= startBS.day
      } else if (endBS.month === bsMonth) {
        return bsDay <= endBS.day
      }
    }
    return false
  })
}

/**
 * Get festival by ID
 */
export function getFestivalById(id: string): Festival | undefined {
  return NEPALI_FESTIVALS.find((festival) => festival.id === id)
}
