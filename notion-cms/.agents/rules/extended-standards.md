---
trigger: model_decision
---

# Ref: Extended Standards
> อ่านไฟล์นี้เมื่อทำงานเกี่ยวกับ Git, TypeScript, Testing, หรือการเพิ่ม dependency ใหม่

---

## 📦 Import Style — ห้ามใช้ Barrel Exports

โปรเจคนี้ **ไม่ใช้** `index.ts` barrel exports — import ตรงไปยังไฟล์เสมอ:

```ts
// ✅ ถูกต้อง — import ตรง
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/blog/PostCard";
import { cn } from "@/lib/utils/cn";

// ❌ ห้าม — ห้ามสร้าง index.ts ใน components/
import { Button, PostCard } from "@/components";
import { cn } from "@/lib/utils";
```

เหตุผล: ป้องกัน circular dependency, tree-shaking ทำงานเต็มที่, Agent ไม่ต้องเดาว่า export มาจากไฟล์ไหน

---

## 📝 TypeScript Strictness

`tsconfig.json` ต้องมี config เหล่านี้:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true
  }
}
```

**กฎ:**
- ห้ามเขียน `any` ทุกกรณี — ใช้ `unknown` แล้ว narrow type แทน
- ถ้าพบ `@ts-ignore` หรือ `@ts-expect-error` ที่ไม่มี comment อธิบาย → แจ้งผู้ใช้ทันที

```ts
// ✅ ถูกต้อง — ใช้ unknown แล้ว narrow
function processData(input: unknown) {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  throw new Error("Expected string");
}

// ❌ ห้าม
function processData(input: any) { ... }
```

---

## 🧪 Testing — ขั้นต่ำที่ต้องมี

ไม่บังคับทดสอบทุก component แต่ต้องมีขั้นต่ำ:

| ส่วน | ระดับ | เหตุผล |
|---|---|---|
| `lib/notion/transform.ts` | Unit test — **บังคับ** | Logic การแปลงข้อมูลสำคัญที่สุด |
| `lib/notion/blocks.ts` | Unit test — **บังคับ** | mapper ทุก block type + fallback |
| `lib/utils/` | Unit test ถ้ามี logic | เช่น `formatDate`, `readingTime` |
| components | ไม่บังคับ | test เฉพาะถ้ามี logic ซับซ้อน |

ถ้ายังไม่มี test → ระบุ comment ไว้แทน ห้ามปล่อยเงียบ:
```ts
// TODO: เพิ่ม unit test สำหรับ transformPost
```

---

## 🏷️ Git Commit Convention

Agent ต้องใช้ format นี้เสมอเมื่อ suggest commit message:

```
type(scope): คำอธิบายสั้น ภาษาไทยหรืออังกฤษ
```

| Type | ใช้เมื่อ |
|---|---|
| `feat` | เพิ่มฟีเจอร์ใหม่ |
| `fix` | แก้ bug |
| `style` | แก้ styling/formatting ไม่กระทบ logic |
| `refactor` | ปรับโครงสร้างโค้ดโดยไม่เปลี่ยน behavior |
| `perf` | ปรับปรุง performance |
| `docs` | แก้ documentation หรือ comment |
| `chore` | งานอื่นๆ เช่น update dependency, config |

ตัวอย่าง:
```
feat(blog): add TableOfContents component
fix(notion): handle undefined block type in mapper
style(card): reorganize Tailwind class order
perf(posts): add unstable_cache to getPosts
```

---

## 🔒 Agent Scope Limits — ไฟล์ที่ห้ามแตะโดยไม่ขออนุมัติ

| ไฟล์ / โฟลเดอร์ | เหตุผล |
|---|---|
| `tailwind.config.ts` | กระทบ design token ทั้งระบบ |
| `lib/notion/client.ts` | กระทบ Notion integration ทั้งหมด |
| `app/layout.tsx` | กระทบ layout ทุกหน้า |
| `package.json` (เพิ่ม dependency ใหม่) | ต้องประเมิน bundle size + license |
| `.env.example` | ต้องให้ developer review ก่อน |
| `DECISIONS.md` | บันทึกได้ แต่ห้ามลบหรือแก้ไข entry เดิม |

**ขั้นตอนเมื่อต้องแตะไฟล์เหล่านี้:**
1. แจ้งผู้ใช้ว่าต้องแก้ไขไฟล์อะไร เพราะอะไร
2. รอยืนยันก่อนดำเนินการทุกกรณี

---

## 🗂️ Decision Log — วิธีใช้ DECISIONS.md

เมื่อมีการตัดสินใจสำคัญ เช่น เลือก library ใหม่, เปลี่ยน pattern, หรือมี trade-off ให้บันทึกใน `DECISIONS.md` ที่ root:

```md
## YYYY-MM-DD — [ชื่อการตัดสินใจ]
**เหตุผล:** ...
**ทางเลือกที่ปฏิเสธ:** ... (เพราะ ...)
**ผลกระทบ:** ไฟล์ / โฟลเดอร์ที่เกี่ยวข้อง
```

**กฎสำหรับ Agent:**
- อ่าน `DECISIONS.md` ก่อนเสนอเปลี่ยน library หรือ pattern ที่มีอยู่
- ห้ามลบหรือแก้ไข entry เดิม — append เท่านั้น
- ถ้าเสนอ decision ใหม่ ให้ draft entry ให้ผู้ใช้ review ก่อน add จริง
