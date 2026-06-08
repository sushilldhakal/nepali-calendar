/**
 * Holiday Data for Nepali Festivals
 * 
 * This file contains comprehensive holiday and festival data for the Nepali calendar.
 * The data is used throughout the calendar system to:
 * - Display festivals on calendar dates
 * - Mark national holidays
 * - Provide festival information and significance
 * - Support multi-day festival ranges
 * 
 * Data structure:
 * - Each year contains festival entries with Gregorian date ranges
 * - Festivals include metadata about lunar months, calculation methods, and duration
 * - National holidays are marked through festival metadata
 * 
 * Usage:
 * - Import `getFestivalsForDate()` to check festivals on a specific date
 * - Import `isNationalHoliday()` to check if a date is a public holiday
 * - Import `NEPALI_FESTIVALS` to access all festival data
 * 
 * @see festivals.ts for festival query functions
 * @see festivals-api.ts for dynamic festival fetching
 * @see festivals-hybrid.ts for combined static + API approach
 */

/**
 * Raw holiday data generated from accurate festival calculations
 * Years: 2026-2028 (expandable)
 */
export const holidays = [
{
  "year": 2026,
  "generated_at": "2026-03-22T16:40:35.647009+00:00",
  "count": 47,
  "festivals": [
    {
      "festival_id": "maghe-sankranti",
      "start": "2026-01-14",
      "end": "2026-01-14",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "maghi",
      "start": "2026-01-15",
      "end": "2026-01-15",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "sonam-lhosar",
      "start": "2026-01-18",
      "end": "2026-01-18",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "saraswati-puja",
      "start": "2026-01-22",
      "end": "2026-01-22",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Magh",
      "is_adhik_year": true
    },
    {
      "festival_id": "swasthani-brata",
      "start": "2026-02-01",
      "end": "2026-03-02",
      "duration_days": 30,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "shivaratri",
      "start": "2026-02-14",
      "end": "2026-02-14",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Falgun",
      "is_adhik_year": true
    },
    {
      "festival_id": "gyalpo-lhosar",
      "start": "2026-02-17",
      "end": "2026-02-17",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "fagu-purnima",
      "start": "2026-03-03",
      "end": "2026-03-03",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "holi",
      "start": "2026-03-03",
      "end": "2026-03-04",
      "duration_days": 2,
      "method": "override",
      "lunar_month": "Falgun",
      "is_adhik_year": true
    },
    {
      "festival_id": "ghode-jatra",
      "start": "2026-03-17",
      "end": "2026-03-17",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Chaitra",
      "is_adhik_year": true
    },
    {
      "festival_id": "seto-machhindranath",
      "start": "2026-03-25",
      "end": "2026-03-28",
      "duration_days": 4,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "ram-navami",
      "start": "2026-03-26",
      "end": "2026-03-26",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "bisket-jatra",
      "start": "2026-04-08",
      "end": "2026-04-16",
      "duration_days": 9,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "bs-new-year",
      "start": "2026-04-14",
      "end": "2026-04-14",
      "duration_days": 1,
      "method": "override",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "matatirtha-aunsi",
      "start": "2026-04-16",
      "end": "2026-04-16",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "bajra-jogini-jatra",
      "start": "2026-04-17",
      "end": "2026-04-19",
      "duration_days": 3,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "rato-machhindranath",
      "start": "2026-04-20",
      "end": "2026-05-19",
      "duration_days": 30,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "buddha-jayanti",
      "start": "2026-05-12",
      "end": "2026-05-12",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Baishakh",
      "is_adhik_year": true
    },
    {
      "festival_id": "ubhauli",
      "start": "2026-05-16",
      "end": "2026-05-16",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "sithi-nakha",
      "start": "2026-05-21",
      "end": "2026-05-21",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "ekadashi-hari",
      "start": "2026-06-24",
      "end": "2026-06-24",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "gathamangal",
      "start": "2026-07-12",
      "end": "2026-07-12",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "nag-panchami",
      "start": "2026-07-27",
      "end": "2026-07-27",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Shrawan",
      "is_adhik_year": true
    },
    {
      "festival_id": "janai-purnima",
      "start": "2026-08-11",
      "end": "2026-08-11",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Shrawan",
      "is_adhik_year": true
    },
    {
      "festival_id": "kuse-aunsi",
      "start": "2026-08-11",
      "end": "2026-08-11",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "gai-jatra",
      "start": "2026-08-12",
      "end": "2026-08-12",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Shrawan",
      "is_adhik_year": true
    },
    {
      "festival_id": "rishitarpani",
      "start": "2026-08-16",
      "end": "2026-08-16",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "krishna-janmashtami",
      "start": "2026-08-19",
      "end": "2026-08-19",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Shrawan",
      "is_adhik_year": true
    },
    {
      "festival_id": "pahan-charhe",
      "start": "2026-08-26",
      "end": "2026-08-26",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "teej",
      "start": "2026-08-30",
      "end": "2026-09-01",
      "duration_days": 3,
      "method": "override",
      "lunar_month": "Bhadra",
      "is_adhik_year": true
    },
    {
      "festival_id": "indra-jatra",
      "start": "2026-09-08",
      "end": "2026-09-15",
      "duration_days": 8,
      "method": "override",
      "lunar_month": "Bhadra",
      "is_adhik_year": true
    },
    {
      "festival_id": "chandi-purnima",
      "start": "2026-09-25",
      "end": "2026-09-25",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "dashain",
      "start": "2026-10-10",
      "end": "2026-10-24",
      "duration_days": 15,
      "method": "override",
      "lunar_month": "Ashwin",
      "is_adhik_year": true
    },
    {
      "festival_id": "thalvah-swyah",
      "start": "2026-10-12",
      "end": "2026-10-12",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "vijaya-dashami",
      "start": "2026-10-19",
      "end": "2026-10-19",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Ashwin",
      "is_adhik_year": true
    },
    {
      "festival_id": "ekadashi-dev",
      "start": "2026-10-21",
      "end": "2026-10-21",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "udhauli",
      "start": "2026-10-25",
      "end": "2026-10-25",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "navavarsha",
      "start": "2026-11-07",
      "end": "2026-11-07",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "tihar",
      "start": "2026-11-07",
      "end": "2026-11-11",
      "duration_days": 5,
      "method": "override",
      "lunar_month": "Kartik",
      "is_adhik_year": true
    },
    {
      "festival_id": "goru-tihar",
      "start": "2026-11-09",
      "end": "2026-11-09",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "laxmi-puja",
      "start": "2026-11-09",
      "end": "2026-11-09",
      "duration_days": 1,
      "method": "lunar_month",
      "lunar_month": "Kartik",
      "is_adhik_year": true
    },
    {
      "festival_id": "mha-puja",
      "start": "2026-11-11",
      "end": "2026-11-11",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Kartik",
      "is_adhik_year": true
    },
    {
      "festival_id": "bhai-tika",
      "start": "2026-11-12",
      "end": "2026-11-12",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Kartik",
      "is_adhik_year": true
    },
    {
      "festival_id": "chhath",
      "start": "2026-11-12",
      "end": "2026-11-15",
      "duration_days": 4,
      "method": "override",
      "lunar_month": "Kartik",
      "is_adhik_year": true
    },
    {
      "festival_id": "bala-chaturdashi",
      "start": "2026-12-06",
      "end": "2026-12-06",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    },
    {
      "festival_id": "yomari-punhi",
      "start": "2026-12-25",
      "end": "2026-12-25",
      "duration_days": 1,
      "method": "override",
      "lunar_month": "Poush",
      "is_adhik_year": true
    },
    {
      "festival_id": "tamu-lhosar",
      "start": "2026-12-30",
      "end": "2026-12-30",
      "duration_days": 1,
      "method": "fallback_v1",
      "lunar_month": null,
      "is_adhik_year": true
    }
  ]
}
]

/**
 * Current year's holiday data (2026)
 * Used as the primary data source for the calendar
 */
export const holiday = holidays[0]

/**
 * Get holiday data for a specific year
 * @param year - Gregorian year (e.g., 2026)
 * @returns Holiday data for the year, or undefined if not available
 */
export function getHolidaysByYear(year: number) {
  return holidays.find(h => h.year === year)
}

/**
 * Get all available years in the holiday dataset
 * @returns Array of years with holiday data
 */
export function getAvailableYears(): number[] {
  return holidays.map(h => h.year)
}

/**
 * Check if holiday data exists for a specific year
 * @param year - Gregorian year to check
 * @returns true if data exists for the year
 */
export function hasHolidayDataForYear(year: number): boolean {
  return holidays.some(h => h.year === year)
}

/**
 * Festival data type from holiday entries
 */
export type HolidayFestival = {
  festival_id: string
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
  duration_days: number
  method: string
  lunar_month: string | null
  is_adhik_year: boolean
}

/**
 * Holiday year data type
 */
export type HolidayYear = {
  year: number
  generated_at: string
  count: number
  festivals: HolidayFestival[]
}
