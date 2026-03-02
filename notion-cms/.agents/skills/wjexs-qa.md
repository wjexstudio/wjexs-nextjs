# QA Agent — WJEXS Personal Blog
## Skill Description
ตรวจสอบคุณภาพโปรเจค Next.js ครอบคลุม Code Quality, Consistency และ Security
รวมถึงมาตรฐาน Frontend สำหรับโปรเจค WJEXS Personal Blog

---

## โปรเจคนี้คืออะไร
WJEXS — Personal Blog, Next.js 15+ App Router
- Styling: Tailwind CSS 4 + Framer Motion + shadcn/ui
- CMS: Notion API (Server-side only)
- Deploy: Vercel

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
- ตรวจ `NOTION_TOKEN` ห้ามใช้นอก Server Component หรือ API Routes เด็ดขาด

---

## Frontend Standards (Next.js 15 App Router)

### โครงสร้างโฟลเดอร์
```
app/
  (blog)/          → Blog pages (list, post, tag, category)
  (pages)/         → Static pages (about, contact)
  api/             → API Routes เท่านั้น
  layout.tsx       → Root layout
  loading.tsx      → Global loading
  error.tsx        → Global error
  not-found.tsx    → 404

components/
  layout/          → Header, Footer, ThemeProvider, Navigation
  sections/        → Hero, PostList, TagCloud, AuthorBio, Newsletter (กลุ่มก้อนใหญ่)
  ui/              → UI พื้นฐานที่ใช้ซ้ำทั่วเว็บ เช่น Button, Badge, Modal, Tag
                     (ต่างจาก shadcn — นี่คือ custom components ของโปรเจคนี้)
  blog/            → PostCard, PostContent, TableOfContents, ReadingTime
  shadcn/          → shadcn/ui components (อย่าแก้ไขตรงๆ ให้ extend ผ่าน components/ui/)

lib/
  notion/          → Notion client, helpers, type definitions
  utils/           → Utility functions (cn, formatDate, readingTime)
  config/          → Site config, navigation, metadata defaults

types/
  notion.ts        → Notion response types
  blog.ts          → Blog domain types (Post, Tag, Category)

hooks/             → Custom React hooks (client-side เท่านั้น)
styles/            → global.css, theme tokens
public/            → Static assets
```

### Component Structure

**การตั้งชื่อและจัดไฟล์**
- ไฟล์ component ตั้งชื่อ **PascalCase** เสมอ
- 1 ไฟล์ต่อ 1 component หลัก — แต่ **อนุญาตให้มี Sub-component ในไฟล์เดียวกันได้** หาก Sub-component นั้นไม่ถูกใช้ที่อื่น (not reusable) เพื่อให้จัดการ Style และ State รวมกันได้ง่ายขึ้น
  ```tsx
  // ✅ OK — SubItem ใช้เฉพาะใน PostCard เท่านั้น
  function PostCardMeta({ date }: { date: string }) { ... }
  export default function PostCard() { ... }

  // ❌ ไม่ OK — ถ้า PostCardMeta ถูกใช้ในไฟล์อื่นด้วย ต้องแยกออกไป
  ```
- ถ้า Sub-component เริ่มถูกใช้ซ้ำในที่อื่น → แยกออกเป็นไฟล์ใน `components/ui/` ทันที

**ขนาดและความรับผิดชอบ**
- ยึดหลัก **Single Responsibility Principle** — 1 component ทำหน้าที่เดียว ชัดเจน
- ไม่มีการจำกัดบรรทัดแบบตายตัว หากโค้ดยาวเพราะ Type definitions หรือ Style variants อนุโลมได้
- สัญญาณที่ควรแตก component ย่อย: มีหน้าที่มากกว่า 1 อย่าง, มี logic ซ้อนซับซ้อน, หรือยากต่อการทดสอบ/อ่านทำความเข้าใจ

**Server / Client boundary**
- **Server Component คือ default** — ใส่ `"use client"` เฉพาะเมื่อจำเป็นเท่านั้น พร้อมระบุเหตุผลในคอมเมนต์
  ```tsx
  "use client"; // ต้องการ: useEffect สำหรับ scroll tracking
  ```
- Notion content fetching ทำใน **Server Component เท่านั้น** ห้าม fetch ฝั่ง Client
- shadcn/ui ห้ามแก้ไขไฟล์ใน `components/shadcn/` ตรงๆ ให้ extend ผ่าน `components/ui/`
- Framer Motion ใช้เฉพาะใน `"use client"` component เท่านั้น

### Styling

**หลักการหลัก**
- ใช้ **Tailwind utility classes** เป็นหลัก ห้ามเขียน inline style
- **Responsive เขียน mobile-first เสมอ**: `base → sm → md → lg → xl`
- **Dark mode ใช้ `dark:` prefix** ให้สอดคล้องกันทั้งโปรเจค ห้าม mix กับ JS toggle
- Design token (สี, spacing, font) กำหนดใน `tailwind.config.ts` ห้ามกระจาย hardcode ทั่วโปรเจค
- ห้าม arbitrary values เช่น `w-[123px]` ถ้ามี token มาตรฐานอยู่แล้ว
- Typography ใช้ Tailwind Typography plugin (`prose`) สำหรับ blog content
- Animation ใช้ Framer Motion เท่านั้น ห้าม mix กับ Tailwind `animate-*` ในองค์ประกอบเดียวกัน

**การจัดระเบียบ Class**
- class เกิน 4 ค่า ให้ใช้ `cn()` จาก `lib/utils/cn.ts` เสมอ
- เรียงลำดับ class ตามกลุ่ม: Layout → Spacing → Sizing → Typography → Color → Border → Effect → State → Responsive → Dark
- หาก Style มีหลาย variant ที่ซับซ้อน ให้แยกตัวแปรไว้ด้านบนของ component แทนการเขียนยาวใน JSX:
  ```tsx
  // ✅ แยกตัวแปรให้อ่านง่าย
  const cardStyles = cn(
    "rounded-xl border bg-white p-6",
    "hover:shadow-md transition-shadow",
    "dark:bg-zinc-900 dark:border-zinc-800",
    isFeatured && "border-blue-500 ring-2 ring-blue-200"
  );
  return <div className={cardStyles}>...</div>;

  // ❌ ยัดทุกอย่างใน JSX ทำให้อ่านยาก
  return <div className={cn("rounded-xl border bg-white p-6 hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800", isFeature && "border-blue-500 ring-2 ring-blue-200")}>...</div>;
  ```

### Skills — บังคับใช้เสมอ
ก่อนสร้างหรือแก้ไขไฟล์ประเภทต่อไปนี้ **ต้องอ่าน SKILL.md ก่อนทุกครั้ง**:

| งานที่ทำ | Skill ที่ต้องอ่าน |
|---|---|
| สร้าง/แก้ Word document | `/mnt/skills/public/docx/SKILL.md` |
| สร้าง/แก้ PDF | `/mnt/skills/public/pdf/SKILL.md` |
| สร้าง/แก้ Presentation | `/mnt/skills/public/pptx/SKILL.md` |
| สร้าง/แก้ Spreadsheet | `/mnt/skills/public/xlsx/SKILL.md` |
| ออกแบบ UI / Frontend component | `/mnt/skills/public/frontend-design/SKILL.md` |

**กฎการใช้ Skills:**
- เรียก `view` tool บน SKILL.md ก่อนเขียนโค้ดหรือสร้างไฟล์ใดๆ ที่เกี่ยวข้อง
- ห้ามข้ามขั้นตอนนี้แม้จะเคยทำงานคล้ายกันมาแล้ว
- Skills หลายตัวสามารถใช้ร่วมกันได้ในงานเดียว

### State Management
- **ไม่ใช้ Zustand** ในโปรเจคนี้
- State ใน URL ใช้ URL Search Params (`useSearchParams`, `useRouter`) — เช่น filter tag, category, page
- State ชั่วคราว UI ใช้ `useState` หรือ `useReducer` ใน Client Component
- ห้าม fetch Notion ใน Client Component ทุกกรณี

### Performance
- ใช้ `next/image` แทน `<img>` ทุกกรณี — ระบุ `width`, `height` หรือ `fill` เสมอ
- ใช้ `next/font` สำหรับ custom font เท่านั้น
- Dynamic import สำหรับ component ที่หนัก เช่น `TableOfContents`, Syntax Highlighter
- ห้าม import lodash ทั้งก้อน ใช้ `import fn from 'lodash/fn'`
- ทุก page ต้องมี `metadata` หรือ `generateMetadata()` — รวมถึง OG image
- `loading.tsx` และ `error.tsx` ต้องมีครบทุก route segment สำคัญ
- Blog post ใช้ `generateStaticParams()` + ISR (`revalidate`) แทน SSR เต็มรูปแบบ
- Notion API ต้อง cache ผลลัพธ์ด้วย `unstable_cache` หรือ `cache()` เสมอ เพื่อลด request ซ้ำ

### Notion Integration
- Notion client สร้างใน `lib/notion/client.ts` เท่านั้น ห้ามสร้างซ้ำในที่อื่น
- Type ของ Notion response กำหนดใน `types/notion.ts` ให้ครบก่อน map ข้อมูล
- การ map Notion block → HTML/React ต้องทำใน `lib/notion/` ไม่ใช่ใน component
- ห้ามส่ง raw Notion response ออกจาก Server Component โดยตรง ให้ transform ก่อนเสมอ

### API Routes มาตรฐาน
| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | /api/posts | รายการ blog post (อาจ filter ด้วย tag, category) |
| GET | /api/posts/[slug] | ดึง post เดี่ยวตาม slug |
| GET | /api/tags | รายการ tag ทั้งหมด |
| GET | /api/categories | รายการ category ทั้งหมด |
| POST | /api/revalidate | Trigger ISR revalidation (ต้อง protect ด้วย secret) |

Response format ทุก endpoint: `{ data: ..., error: null }` หรือ `{ data: null, error: "message" }`

### Environment Variables
| ตัวแปร | ประเภท | หมายเหตุ |
|---|---|---|
| `NOTION_TOKEN` | Server only ⚠️ | ห้าม expose ฝั่ง client เด็ดขาด |
| `NOTION_DATABASE_ID` | Server only | Database ID หลัก |
| `REVALIDATE_SECRET` | Server only | ป้องกัน /api/revalidate |
| `NEXT_PUBLIC_SITE_URL` | Public | สำหรับ OG image, sitemap |
| `NEXT_PUBLIC_GA_ID` | Public | Google Analytics (ถ้าใช้) |

---

## ขั้นตอนการทำงาน (Workflow)

### ขั้นตอนที่ 1 — อ่าน Skills ที่เกี่ยวข้องก่อนเสมอ
ดูว่างานที่ได้รับเกี่ยวข้องกับ Skill ใดบ้าง แล้วเรียก `view` tool เพื่ออ่าน SKILL.md นั้นก่อนดำเนินการ

### ขั้นตอนที่ 2 — วางแผนก่อนเสมอ
เมื่อรับคำสั่ง ให้สร้างหรืออัพเดท `plan.md` ทันที:

```md
# แผนการดำเนินงาน
**คำสั่งที่ได้รับ:** ...
**Role ที่เกี่ยวข้อง:** Code Quality / Consistency / Security
**Skills ที่ต้องใช้:** ...
**วันที่:** YYYY-MM-DD HH:MM

## เช็คลิสต์
### 🔍 Code Quality
- [ ] ...
### 🔗 Consistency
- [ ] ...
### 🔐 Security
- [ ] ...

## ลำดับการดำเนินงาน
1. ...

## ความเสี่ยงหรือข้อควรระวัง
- ...

**⏳ สถานะ: รอการรีวิวจากผู้ใช้**
```

แจ้งผู้ใช้ว่า "สร้างแผนใน plan.md เรียบร้อยแล้ว กรุณารีวิวและยืนยันก่อนดำเนินการต่อ"
**หยุดรอ — ห้ามดำเนินการจนกว่าผู้ใช้จะยืนยัน**

### ขั้นตอนที่ 3 — ดำเนินการหลังยืนยัน
1. ทำตามเช็คลิสต์ทีละขั้น
2. อัพเดท `- [ ]` เป็น `- [x]` เมื่อเสร็จแต่ละรายการ
3. เมื่อเสร็จทั้งหมด อัพเดท `plan.md` และ `PRD.md`

**`PRD.md`** โครงสร้าง:
```md
# PRD — Project Requirements & Standards
**อัพเดทล่าสุด:** YYYY-MM-DD

## มาตรฐานโค้ด (Code Standards)
## โครงสร้างโฟลเดอร์ (Folder Structure)
## ข้อตกลง API (API Contract)
## มาตรฐานความปลอดภัย (Security Standards)
## มาตรฐาน Notion Integration
## รายการที่ต้องติดตามต่อ (Backlog)
```

---

## คำสั่ง PowerShell (Windows เท่านั้น)
| ห้ามใช้ (Linux/CMD) | ใช้แทน (PowerShell) |
|---|---|
| `cat file` | `Get-Content file` |
| `grep "text" file` | `Select-String "text" file` |
| `ls` | `Get-ChildItem` |
| `rm file` | `Remove-Item file` |
| `find . -name "*.ts"` | `Get-ChildItem -Recurse -Filter "*.ts"` |
| `touch file` | `New-Item file` |
| `mkdir folder` | `New-Item -ItemType Directory folder` |
| `rmdir /s /q folder` | `Remove-Item -Recurse -Force folder` |
| `echo text >> file` | `Add-Content file "text"` |
| `echo text > file` | `Set-Content file "text"` |
| `type file.txt` | `Get-Content file.txt` |
| `findstr "text" file` | `Select-String "text" file` |
| `where node` | `Get-Command node` |
| `tasklist` | `Get-Process` |
| `taskkill /f /im node.exe` | `Stop-Process -Name node -Force` |

---

## 💡 จุดที่ควรพิจารณาเพิ่มเติม (สำหรับ Maintainer)

> ส่วนนี้ไม่ใช่กฎบังคับ แต่เป็นสิ่งที่ควรพิจารณาเพิ่มเพื่อให้โปรเจคสเกลและบำรุงรักษาได้ง่ายขึ้น

### 📦 Barrel Exports — ควรกำหนดแนวทางให้ชัด
ปัจจุบันยังไม่มีกฎว่าจะใช้ `index.ts` หรือไม่ ควรเลือก 1 แนวทาง:
- **ใช้ barrel**: `components/ui/index.ts` → `export { Button } from './Button'` — import สะอาด แต่อาจกระทบ tree-shaking
- **ไม่ใช้ barrel**: import ตรงไปยังไฟล์ — ชัดเจนกว่า แต่ path ยาวกว่า
- เลือกแล้วกำหนดเป็นกฎตายตัวทั่วโปรเจค ห้าม mix ทั้งสองแบบ

### 🗂️ Decision Log — บันทึกเหตุผลของการตัดสินใจ
เมื่อมีการเลือก library, pattern, หรือ architecture ใหม่ ให้บันทึกไว้ใน `DECISIONS.md`:
```md
## [วันที่] เลือกใช้ Framer Motion แทน CSS Transition
**เหตุผล:** ต้องการ animation ที่ซับซ้อนและ interruptable
**ทางเลือกที่ปฏิเสธ:** CSS transition (ขาด physics-based easing)
```
ช่วยให้ Agent และผู้ดูแลในอนาคตไม่ตั้งคำถามซ้ำ

### 🧪 Testing Strategy — ควรกำหนดระดับ
ถ้ายังไม่มี test เลย ควรกำหนดขั้นต่ำ:
- `lib/notion/` → Unit test ฟังก์ชัน transform/map ข้อมูล
- `lib/utils/` → Unit test utility functions
- ไม่ต้องทดสอบ component ทุกตัว แต่ควรระบุไว้ว่า "ยังไม่ทดสอบ" แทนการปล่อยเงียบ

### 🏷️ Git Commit Convention — ช่วย Agent เข้าใจ history
กำหนด prefix ที่ใช้:
```
feat: เพิ่มฟีเจอร์ใหม่
fix: แก้ bug
style: แก้ไขเฉพาะ styling/formatting
refactor: ปรับโครงสร้างโค้ดโดยไม่เปลี่ยน behavior
docs: แก้ไข documentation
chore: งานอื่นๆ เช่น update dependency
```

### 🔒 Agent Scope Limits — กำหนดว่า Agent ห้ามแตะอะไรโดยไม่ถาม
ควรระบุไว้ชัดเจน เช่น:
- ห้ามเปลี่ยน `tailwind.config.ts` โดยไม่ได้รับอนุมัติ (กระทบ design token ทั้งระบบ)
- ห้ามเปลี่ยน `lib/notion/client.ts` โดยไม่ได้รับอนุมัติ
- ห้ามเพิ่ม dependency ใหม่ใน `package.json` โดยไม่แจ้งก่อน

### 📝 TypeScript Strictness — ควรล็อค tsconfig
ระบุใน rules ว่าต้องผ่าน config เหล่านี้:
```json
{ "strict": true, "noUnusedLocals": true, "noUnusedParameters": true }
```
ป้องกัน Agent เขียน `any` หรือ unused variable โดยไม่รู้ตัว

---



### ✅ ต้องทำเสมอ
- สื่อสารและเขียนทุกไฟล์เป็น **ภาษาไทย** เสมอ
- อ่าน SKILL.md ที่เกี่ยวข้องก่อนสร้างหรือแก้ไขไฟล์ทุกครั้ง
- สร้าง `plan.md` และรอยืนยันทุกครั้ง ไม่มีข้อยกเว้น
- อัพเดท `plan.md` และ `PRD.md` ทุกครั้งที่เสร็จงาน
- ระบุชื่อไฟล์และเลขบรรทัดที่พบปัญหาเสมอ
- ใช้ PowerShell syntax เท่านั้น ห้ามใช้คำสั่ง Linux หรือ CMD flags
- Responsive ต้องเขียน mobile-first (`base → sm → md → lg`) ทุกครั้ง
- Dark mode ต้องใช้ `dark:` prefix ให้สอดคล้องทั้งโปรเจค
- ใช้ `cn()` เมื่อมี class เกิน 4 ค่า

### ❌ ห้ามทำเด็ดขาด
- ห้ามข้ามขั้นตอนอ่าน Skill และวางแผน
- ห้ามแก้ไขโค้ดโดยไม่แจ้งผู้ใช้ก่อน
- ห้าม overwrite `PRD.md` ทั้งหมด ให้ merge เนื้อหาเดิมเสมอ
- ห้าม fetch Notion API ฝั่ง Client Component
- ห้ามใช้ `NOTION_TOKEN` นอก Server Component หรือ API Routes
- ห้าม `"use client"` โดยไม่มีเหตุผลชัดเจน
- ห้าม inline style ทุกกรณี
- ห้าม arbitrary Tailwind values ถ้ามี token มาตรฐานอยู่แล้ว
- ห้ามแก้ไขไฟล์ใน `components/shadcn/` ตรงๆ ให้ extend ผ่าน `components/ui/`
- ห้ามส่ง raw Notion response ออกจาก Server ไปยัง Client โดยตรง