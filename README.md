# Nepali Calendar

Open-source **Bikram Sambat** calendar for JavaScript and React. Free to use, MIT licensed.

**[Live Demo →](https://sushilldhakal.github.io/nepali-calendar/)**

## Features

✅ **Bikram Sambat dates** — Display Nepali calendar dates  
✅ **Dual calendar display** — BS and AD dates side-by-side  
✅ **Festival indicators** — Built-in Nepali festivals & holidays  
✅ **shadcn/ui compatible** — Seamless integration  
✅ **Zero dependencies** — Core conversion library standalone  
✅ **TypeScript** — Fully typed  

| Package | npm | Description |
|---------|-----|-------------|
| [`bikram-sambat`](./packages/bikram-sambat) | [![npm](https://img.shields.io/npm/v/bikram-sambat)](https://www.npmjs.com/package/bikram-sambat) | AD ↔ BS conversion (zero dependencies) |
| [`react-nepali-calendar`](./packages/react-nepali-calendar) | [![npm](https://img.shields.io/npm/v/react-nepali-calendar)](https://www.npmjs.com/package/react-nepali-calendar) | Bikram Sambat date picker for React |

## Quick start

```bash
npm install react-nepali-calendar react-day-picker
```

```tsx
import "react-nepali-calendar/styles.css"
import { NepaliCalendar } from "react-nepali-calendar"

<NepaliCalendar mode="single" selected={date} onSelect={setDate} />
```

### With Festivals

```tsx
<NepaliCalendar 
  mode="single" 
  selected={date} 
  onSelect={setDate}
  showFestivals={true}
/>
```

See **[FESTIVALS.md](./FESTIVALS.md)** for complete festival documentation.

Works with **shadcn/ui** out of the box — the calendar's CSS variables map directly to shadcn's design tokens.

## Demo

**Online:** https://sushilldhakal.github.io/nepali-calendar/

**Run locally:**

```bash
git clone https://github.com/sushilldhakal/nepali-calendar.git
cd nepali-calendar
npm install
npm run build
npm run demo
```

Open http://localhost:5175

## Monorepo scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspaces |
| `npm run build` | Build all packages |
| `npm test` | Run bikram-sambat tests |
| `npm run demo` | Start the Vite demo app |
| `npm run typecheck` | TypeScript check all packages |

## Supported BS years

**2080–2090** (AD 2023–2033) with authoritative month lengths.  
Contributions welcome — see [`packages/bikram-sambat/src/index.ts`](./packages/bikram-sambat/src/index.ts) to add more years.

## Contributing

1. Fork the repo
2. `npm install`
3. Make changes in `packages/`
4. `npm run build && npm test`
5. Open a pull request

## License

MIT — see [LICENSE](./LICENSE)
