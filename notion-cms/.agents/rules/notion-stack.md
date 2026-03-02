---
trigger: model_decision
---

# Ref: Notion Stack
> อ่านไฟล์นี้ก่อนทุกครั้งที่ทำงานเกี่ยวกับ Notion integration

---

## Library ที่ใช้ในโปรเจค

| Library | หน้าที่ | หมายเหตุ |
|---|---|---|
| `@notionhq/client` | Official Notion API client | ใช้ใน `lib/notion/client.ts` เท่านั้น |
| `notion-types` | TypeScript types สำหรับ Notion objects | import จาก `notion-types` |
| `notion-utils` | Helper functions เช่น `getPageTitle`, `getBlockTitle` | ใช้แทนการเขียนเอง |
| `react-notion-x` | Render Notion blocks เป็น React components | ใช้สำหรับ render content หน้า blog |

---

## Data Flow

```
Notion Database
  ↓ (fetch ใน Server Component หรือ lib/notion/ เท่านั้น)
@notionhq/client
  ↓ (raw response)
lib/notion/transform.ts   → แปลง raw → Blog domain types (types/blog.ts)
  ↓ (clean data)
Page Component (Server)   → ส่งต่อเป็น props ไปยัง Client Components
```

ห้ามข้ามขั้น transform — ห้ามส่ง raw Notion response ออกจาก Server Component โดยตรง

---

## Type หลักที่ใช้บ่อย

```ts
// จาก notion-types
import type {
  ExtendedRecordMap,   // ข้อมูลหน้า blog ทั้งหน้า (รวม blocks, users, collections)
  Block,               // Notion block เดี่ยว
  PageMap,             // map ของ page id → page data
  CollectionMap,       // map ของ collection (database)
} from "notion-types";

// จาก types/blog.ts ของโปรเจค
import type { Post, Tag, Category } from "@/types/blog";
```

---

## lib/notion/ — โครงสร้างไฟล์

```
lib/notion/
  client.ts       → สร้าง Notion client instance (singleton)
  posts.ts        → ฟังก์ชัน fetch posts จาก Notion database
  transform.ts    → แปลง Notion response → Blog types
  blocks.ts       → mapper Notion blocks → React components
  utils.ts        → helper เฉพาะ Notion เช่น slugify, extractText
```

---

## client.ts — Pattern ที่ถูกต้อง

```ts
// lib/notion/client.ts
import { Client } from "@notionhq/client";

// Singleton — ห้ามสร้างใหม่ในที่อื่น
export const notion = new Client({
  auth: process.env.NOTION_TOKEN, // Server only — ห้าม NEXT_PUBLIC_
});
```

---

## Block Mapper — Graceful Degradation (บังคับ)

Block mapper **ทุกตัว** ต้องมี `default` case เสมอ ห้าม throw error:

```ts
// lib/notion/blocks.ts
import type { Block } from "notion-types";

export function renderBlock(block: Block) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph block={block} />;
    case "heading_1":
      return <Heading1 block={block} />;
    case "heading_2":
      return <Heading2 block={block} />;
    case "heading_3":
      return <Heading3 block={block} />;
    case "bulleted_list_item":
      return <BulletedList block={block} />;
    case "numbered_list_item":
      return <NumberedList block={block} />;
    case "image":
      return <BlockImage block={block} />;
    case "code":
      return <CodeBlock block={block} />;
    case "quote":
      return <Quote block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "divider":
      return <hr className="my-8 border-zinc-200 dark:border-zinc-700" />;
    // ✅ ต้องมี default เสมอ
    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(`[Notion] Unsupported block type: "${block.type}"`);
        return (
          <div className="text-xs text-orange-400 border border-orange-200 p-2 rounded">
            [unsupported block: {block.type}]
          </div>
        );
      }
      return null; // production — ซ่อนเงียบๆ ไม่ให้เว็บพัง
  }
}
```

**กฎ:** เมื่อเพิ่ม block type ใหม่ใน Notion → ต้องเพิ่ม case ใน mapper ด้วยเสมอ

---

## notion-utils — Functions ที่ควรใช้แทนเขียนเอง

```ts
import {
  getPageTitle,        // ดึง title จาก page
  getBlockTitle,       // ดึง title จาก block
  getTextContent,      // แปลง rich text array → plain string
  getPageProperty,     // ดึง property จาก page
  uuidToId,            // แปลง UUID format
  idToUuid,            // แปลง id กลับเป็น UUID
} from "notion-utils";
```

---

## Caching — บังคับทุก fetch function

```ts
import { unstable_cache } from "next/cache";

export const getPosts = unstable_cache(
  async () => {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { property: "Status", status: { equals: "Published" } },
    });
    return response.results.map(transformPost); // transform ก่อนส่งออกเสมอ
  },
  ["posts"], // cache key
  { revalidate: 3600 } // 1 ชั่วโมง — ปรับตามความเหมาะสม
);
```

---

## จุดที่ต้องระวัง

- `NOTION_DATABASE_ID` ต้องอยู่ใน `.env` เสมอ ห้าม hardcode
- Notion API rate limit: 3 req/sec — cache จึงสำคัญมาก
- Block type ใหม่จาก Notion จะ fallback ไปที่ `default` case — ตรวจสอบ dev console
- `ExtendedRecordMap` ข้อมูลหนักมาก — ใช้เฉพาะตอน render หน้า post เดี่ยว
