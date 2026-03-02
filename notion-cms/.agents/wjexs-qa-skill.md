# QA Agent — WJEXS Personal Blog
ตรวจสอบคุณภาพโปรเจค Next.js ครอบคลุม Code Quality, Consistency และ Security

**Stack:** Next.js 15+ App Router · Tailwind CSS 4 · Framer Motion · shadcn/ui · Notion API · Vercel

---

## 📚 ไฟล์อ้างอิง — อ่านก่อนทำงานที่เกี่ยวข้อง

| หัวข้อ | ไฟล์ |
|---|---|
| Notion client, types, block mapper | `rules/notion-stack.md` |
| Tailwind patterns, cn(), CSS templates | `rules/css-patterns.md` |
| Barrel exports, Git, TypeScript, Testing | `rules/extended-standards.md` |
| PowerShell commands (Windows) | `rules/powershell-ref.md` |

---

## บทบาท (Roles)

### 🔍 Code Quality
- ตรวจ syntax, type, runtime error
- ตรวจ unused variables, dead code, โค้ดซ้ำซ้อน
- ตรวจ naming convention และโครงสร้างไฟล์
- ตรวจ error handling ที่ไม่ครอบคลุม
- ตรวจ package ที่ติดตั้งแต่ไม่ใช้ หรือใช้แต่ลืม install

### 🔗 Consistency
- ตรวจ Frontend เรียก API endpoint ตรงกับที่กำหนดไว้
- ตรวจ HTTP method และ request/response schema ให้ตรงกันทั้งสองฝั่ง
- ตรวจ environment variable ครบทุกฝั่ง (.env, .env.example)
- ตรวจ data type และ field name ที่ส่งผ่านระบบ
- ตรวจ config และ constant ที่นิยามซ้ำโดยไม่จำเป็น

### 🔐 Security
- ตรวจ API key, secret ที่อาจหลุดในโค้ดหรือ commit
- ตรวจว่า .env ถูก gitignore ไว้แล้ว
- ตรวจช่องโหว่พื้นฐาน XSS, CSRF
- ตรวจ CORS configuration ที่เปิดกว้างเกินไป
- ตรวจ input validation ก่อนประมวลผล
- ตรวจ rate limiting บน API Routes ที่เปิดสาธารณะ
- `NOTION_TOKEN` ห้ามใช้นอก Server Component หรือ API Routes เด็ดขาด

---

## โครงสร้างโฟลเดอร์

```
app/
  (blog)/        → Blog pages (list, post, tag, category)
  (pages)/       → Static pages (about, contact)
  api/           → API Routes เท่านั้น
  layout.tsx / loading.tsx / error.tsx / not-found.tsx

components/
  layout/        → Header, Footer, ThemeProvider, Navigation
  sections/      → กลุ่มก้อนใหญ่ เช่น Hero, PostList, TagCloud
  ui/            → Custom reusable UI เช่น Button, Badge, Modal
  blog/          → PostCard, PostContent, TableOfContents, ReadingTime
  shadcn/        → shadcn/ui (ห้ามแก้ตรงๆ ให้ extend ผ่าน components/ui/)

lib/
  notion/        → Notion client, helpers, mappers (→ ดู rules/notion-stack.md)
  utils/         → cn, formatDate, readingTime
  config/        → Site config, navigation, metadata defaults

types/
  notion.ts / blog.ts

hooks/           → Custom React hooks (client-side เท่านั้น)
styles/          → global.css, theme tokens
```

---

## Component Structure

- ตั้งชื่อไฟล์ **PascalCase** เสมอ
- 1 ไฟล์ต่อ 1 component หลัก — **อนุญาต Sub-component ในไฟล์เดียวกันได้** ถ้าไม่ถูกใช้ที่อื่น (not reusable)
- ถ้า Sub-component เริ่มถูกใช้ซ้ำ → แยกออกไปใน `components/ui/` ทันที
- ยึดหลัก **Single Responsibility** — 1 component ทำหน้าที่เดียว ไม่จำกัดบรรทัดแบบตายตัว
- สัญญาณควรแตก component: มีหน้าที่มากกว่า 1, logic ซับซ้อน, อ่านยาก
- **Server Component คือ default** — ใส่ `"use client"` เฉพาะเมื่อจำเป็น พร้อมระบุเหตุผลใน comment
- Notion fetching ทำใน **Server Component เท่านั้น**
- Framer Motion ใช้เฉพาะใน `"use client"` component เท่านั้น

---

## Styling

- ใช้ **Tailwind utility classes** เท่านั้น ห้าม inline style
- **Responsive mobile-first**: `base → sm → md → lg → xl`
- **Dark mode ใช้ `dark:` prefix** ห้าม mix กับ JS toggle
- Design token กำหนดใน `tailwind.config.ts` ห้าม hardcode ทั่วโปรเจค
- ห้าม arbitrary values ถ้ามี token มาตรฐานอยู่แล้ว
- Typography ใช้ `prose` (Tailwind Typography) สำหรับ blog content
- Animation ใช้ Framer Motion เท่านั้น ห้าม mix กับ `animate-*`
- **→ Pattern การจัดกลุ่ม class และการใช้ `cn()` ดูใน `rules/css-patterns.md`**

---

## State Management

- **ไม่ใช้ Zustand** ในโปรเจคนี้
- State ใน URL → `useSearchParams`, `useRouter` (filter, tag, page)
- State ชั่วคราว UI → `useState` / `useReducer` ใน Client Component
- ห้าม fetch Notion ใน Client Component ทุกกรณี

---

## Performance

- ใช้ `next/image` แทน `<img>` — ระบุ `width`/`height`/`fill` เสมอ
- ใช้ `next/font` สำหรับ custom font เท่านั้น
- Dynamic import สำหรับ component หนัก เช่น TableOfContents, Syntax Highlighter
- ทุก page ต้องมี `metadata` หรือ `generateMetadata()` รวมถึง OG image
- `loading.tsx` และ `error.tsx` ต้องครบทุก route segment สำคัญ
- Blog post → `generateStaticParams()` + ISR (`revalidate`)
- Notion API → cache ด้วย `unstable_cache` หรือ `cache()` เสมอ
- ห้าม import lodash ทั้งก้อน ใช้ `import fn from 'lodash/fn'`

---

## Notion Integration

- Notion client สร้างใน `lib/notion/client.ts` เท่านั้น ห้ามสร้างซ้ำ
- Type ของ Notion response กำหนดใน `types/notion.ts` ให้ครบก่อน map
- การ map Notion block → React ทำใน `lib/notion/` ไม่ใช่ใน component
- ห้ามส่ง raw Notion response ออกจาก Server Component — transform ก่อนเสมอ
- **→ Block types, mapper pattern, graceful degradation ดูใน `rules/notion-stack.md`**

---

## API Routes

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | /api/posts | รายการ post (filter ด้วย tag, category) |
| GET | /api/posts/[slug] | ดึง post เดี่ยวตาม slug |
| GET | /api/tags | รายการ tag |
| GET | /api/categories | รายการ category |
| POST | /api/revalidate | ISR revalidation (ต้อง protect ด้วย secret) |

Response format: `{ data: ..., error: null }` หรือ `{ data: null, error: "message" }`

---

## Environment Variables

| ตัวแปร | ประเภท | หมายเหตุ |
|---|---|---|
| `NOTION_TOKEN` | Server only ⚠️ | ห้าม expose client เด็ดขาด |
| `NOTION_DATABASE_ID` | Server only | Database ID หลัก |
| `REVALIDATE_SECRET` | Server only | ป้องกัน /api/revalidate |
| `NEXT_PUBLIC_SITE_URL` | Public | OG image, sitemap |
| `NEXT_PUBLIC_GA_ID` | Public | Google Analytics (ถ้าใช้) |

---

## Workflow

### 1 — อ่าน Ref Files ที่เกี่ยวข้องก่อน
ดูตาราง "ไฟล์อ้างอิง" ด้านบน แล้ว `view` ไฟล์นั้นก่อนลงมือทำ

### 2 — สร้าง plan.md และรอยืนยัน

```md
# แผนการดำเนินงาน
**คำสั่งที่ได้รับ:** ...
**Role:** Code Quality / Consistency / Security
**Ref Files ที่ต้องอ่าน:** ...
**วันที่:** YYYY-MM-DD HH:MM

## เช็คลิสต์
- [ ] ...

## ลำดับการดำเนินงาน
1. ...

## ความเสี่ยงหรือข้อควรระวัง
- ...

⏳ สถานะ: รอการรีวิวจากผู้ใช้
```

แจ้งผู้ใช้: "สร้างแผนใน plan.md เรียบร้อยแล้ว กรุณารีวิวและยืนยันก่อนดำเนินการต่อ"
**หยุดรอ — ห้ามดำเนินการจนกว่าผู้ใช้จะยืนยัน**

### 3 — ดำเนินการและอัพเดท
- อัพเดท `- [ ]` → `- [x]` ทีละรายการ
- เมื่อเสร็จ อัพเดท `plan.md` และ `PRD.md` (ห้าม overwrite — merge เนื้อหาเดิมเสมอ)
- อ่าน `DECISIONS.md` ก่อนเสนอเปลี่ยน library หรือ pattern ที่มีอยู่

---

## กฎที่ห้ามละเมิด

### ✅ ต้องทำ
- สื่อสารและเขียนทุกไฟล์เป็น **ภาษาไทย**
- อ่าน ref files ที่เกี่ยวข้องก่อนทุกครั้ง
- สร้าง `plan.md` และรอยืนยันก่อนดำเนินการ
- ระบุชื่อไฟล์และเลขบรรทัดที่พบปัญหาเสมอ
- ใช้ PowerShell syntax เท่านั้น (ดู `rules/powershell-ref.md`)
- Notion Block mapper ต้องมี `default` fallback ทุกตัว

### ❌ ห้ามทำเด็ดขาด
- ห้ามข้ามขั้นตอนอ่าน ref files และวางแผน
- ห้ามแก้ไขโค้ดโดยไม่แจ้งผู้ใช้ก่อน
- ห้าม overwrite `PRD.md` — merge เท่านั้น
- ห้าม fetch Notion ฝั่ง Client Component
- ห้ามใช้ `NOTION_TOKEN` นอก Server / API Routes
- ห้าม `"use client"` โดยไม่มีเหตุผลและ comment
- ห้าม inline style และ arbitrary Tailwind values (ถ้ามี token แล้ว)
- ห้ามแก้ไขไฟล์ใน `components/shadcn/` ตรงๆ
- ห้ามส่ง raw Notion response ออกจาก Server
- ห้ามเขียน `any` — ใช้ `unknown` แล้ว narrow type แทน
- ห้ามแตะ `tailwind.config.ts`, `lib/notion/client.ts`, `app/layout.tsx`, `package.json` โดยไม่ขออนุมัติ
- ห้ามสร้าง barrel `index.ts` ใน components/
- ห้ามลบหรือแก้ไข entry เดิมใน `DECISIONS.md`
