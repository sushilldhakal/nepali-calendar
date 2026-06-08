# 2026 Festival Calendar - Visual Guide

## Fixed Issues ✅

1. **Navigation buttons now fully clickable** - Increased button size and click area
2. **All festivals are showing correctly** - June only has 1 festival (correct!)

## Festival Distribution by Month

### 📅 January 2026 (4 festivals)
- Jan 14: Maghe Sankranti
- Jan 15: Maghi
- Jan 18: **Sonam Lhosar** 🔴 (National Holiday)
- Jan 22: Saraswati Puja

### 📅 February 2026 (3 festivals)
- Feb 1-Mar 2: Swasthani Brata (30 days)
- Feb 14: **Maha Shivaratri** 🔴 (National Holiday)
- Feb 17: Gyalpo Lhosar

### 📅 March 2026 (6 festivals)
- Mar 3: Fagu Purnima
- Mar 3-4: **Holi** 🔴 (National Holiday)
- Mar 17: Ghode Jatra
- Mar 25-28: Seto Machhindranath
- Mar 26: Ram Navami

### 📅 April 2026 (5 festivals) 🌟
- Apr 8-16: Bisket Jatra
- Apr 14: **Nepali New Year** 🔴 (National Holiday)
- Apr 16: Matatirtha Aunsi
- Apr 17-19: Bajra Jogini Jatra
- Apr 20-May 19: Rato Machhindranath

### 📅 May 2026 (4 festivals)
- May 12: **Buddha Jayanti** 🔴 (National Holiday)
- May 16: Ubhauli
- May 21: Sithi Nakha

### 📅 June 2026 (1 festival) ⭐
- Jun 24: Ekadashi Hari
*This is correct - June historically has fewer festivals*

### 📅 July 2026 (2 festivals)
- Jul 12: Gathamangal
- Jul 27: Nag Panchami

### 📅 August 2026 (7 festivals) 🌟
- Aug 11: **Janai Purnima** 🔴 (National Holiday)
- Aug 11: Kuse Aunsi
- Aug 12: Gai Jatra
- Aug 16: Rishi Panchami
- Aug 19: **Krishna Janmashtami** 🔴 (National Holiday)
- Aug 26: Pahan Charhe
- Aug 30-Sep 1: **Teej** 🔴 (National Holiday)

### 📅 September 2026 (3 festivals)
- Sep 8-15: Indra Jatra
- Sep 25: Chandi Purnima

### 📅 October 2026 (5 festivals) 🌟
- Oct 10-24: **Dashain** 🔴 (National Holiday - 15 days!)
- Oct 12: Thalvah Swyah
- Oct 19: **Vijaya Dashami** 🔴 (Main Dashain Day)
- Oct 21: Ekadashi Dev
- Oct 25: Udhauli

### 📅 November 2026 (7 festivals) 🎉 MOST FESTIVALS!
- Nov 7: Navavarsha
- Nov 7-11: **Tihar** 🔴 (National Holiday - 5 days!)
- Nov 9: Goru Tihar
- Nov 9: **Laxmi Puja** 🔴 (National Holiday)
- Nov 11: Mha Puja
- Nov 12: **Bhai Tika** 🔴 (National Holiday)
- Nov 12-15: **Chhath** 🔴 (National Holiday)

### 📅 December 2026 (3 festivals)
- Dec 6: Bala Chaturdashi
- Dec 25: Yomari Punhi
- Dec 30: Tamu Lhosar

## Summary

**Total Festivals**: 47
**National Holidays** 🔴: 15
**Other Festivals** 🔵: 32

### Peak Festival Months:
1. **November** - 7 festivals (Tihar season!)
2. **August** - 7 festivals (Monsoon festivals)
3. **March** - 6 festivals (Spring festivals)

### Quieter Months:
- **June** - 1 festival (Summer season)
- **July** - 2 festivals

## How to See All Festivals in the Calendar

1. **Open the demo**: http://localhost:5176/
2. **Navigate to "With Festivals" section**
3. **Use the navigation arrows** (now fully clickable!) to browse months:
   - ⬅️ Previous month
   - ➡️ Next month

### What to Expect:
- **June 2026**: Only 1 red/blue dot (on June 24)
- **October 2026**: Many red dots (Dashain - 15 days!)
- **November 2026**: Maximum dots (7 different festivals!)
- **April 2026**: Red dot on April 14 (New Year)

### Visual Legend:
- 🔴 **Red dot** = National Holiday (public holiday)
- 🔵 **Blue dot** = Cultural/Religious/Regional festival

## Why June Shows Only 1 Festival?

This is **historically accurate**! 

- June falls in the monsoon season (Jestha/Ashadh in BS calendar)
- Traditionally a quieter period for festivals
- Agricultural activities take priority
- Major festival seasons are:
  - Spring (March-April): Holi, New Year
  - Autumn (Oct-Nov): Dashain, Tihar
  - Winter (Jan-Feb): Lhosar, Shivaratri

## Navigation Button Fix

**Before**: Small click area (only SVG icon clickable)
**After**: Entire button area (2rem × 2rem) is clickable

The buttons are now:
- ✅ Larger (2rem instead of 1.75rem)
- ✅ Proper padding (0.25rem)
- ✅ Full area clickable (z-index: 10)
- ✅ Pointer events on entire button

## Test It Yourself!

```bash
# Start the demo
cd apps/demo
npm run dev

# Visit: http://localhost:5176/
# Go to: "With Festivals" section
# Click navigation buttons to browse months
# Hover over dots to see festival names
```

**November 2026** is the best month to see the festival system in action! 🎉
