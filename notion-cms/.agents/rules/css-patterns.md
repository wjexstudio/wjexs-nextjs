---
trigger: model_decision
---

# Ref: CSS Patterns & Tailwind
> อ่านไฟล์นี้ก่อนทุกครั้งที่ทำงานเกี่ยวกับ Styling หรือสร้าง Component ใหม่

---

## การใช้ cn() — เมื่อไหรควรใช้

`cn()` มาจาก `lib/utils/cn.ts` (wraps `clsx` + `tailwind-merge`)

```ts
// lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**ใช้ `cn()` เฉพาะ 2 กรณีเท่านั้น:**

```tsx
// ✅ กรณี 1: มี Conditional styling
const cardStyles = cn(
  "rounded-xl border bg-white p-6",
  "hover:shadow-md transition-shadow",
  "dark:bg-zinc-900 dark:border-zinc-800",
  isFeatured && "border-blue-500 ring-2 ring-blue-200", // conditional
  isLoading && "opacity-50 pointer-events-none"
);

// ✅ กรณี 2: รับ className props จากภายนอก
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border p-6", className)}>{children}</div>;
}

// ✅ Static style ยาวมาก → แยก const ธรรมดา ไม่ต้องหุ้ม cn()
const sectionWrapper = "mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8";
return <section className={sectionWrapper}>...</section>;

// ❌ ห้าม — ยัดใน JSX ตรงๆ เมื่อ class ยาวเกิน 4 ค่า
return <div className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800">...</div>;
```

---

## ลำดับการเรียง Class (ให้เรียงตามลำดับนี้เสมอ)

```
Layout (display, position, flex, grid)
→ Spacing (p, m, gap)
→ Sizing (w, h, max-w, min-h)
→ Typography (font, text, leading, tracking)
→ Color (bg, text-color, fill)
→ Border (border, rounded, outline)
→ Effect (shadow, opacity, blur)
→ State (hover:, focus:, active:, disabled:)
→ Responsive (sm:, md:, lg:, xl:)
→ Dark (dark:)
```

ตัวอย่าง:
```tsx
// ✅ เรียงถูกต้อง
"flex items-center gap-4 px-6 py-3 w-full font-medium text-sm text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:ring-2 sm:w-auto dark:bg-blue-500"
```

---

## Component Templates — Copy แล้วแก้ได้เลย

### Page Section Wrapper
```tsx
export default function SectionName() {
  const wrapper = "mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8";
  return (
    <section className={wrapper}>
      ...
    </section>
  );
}
```

### Card Component (รับ className props)
```tsx
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-zinc-200 bg-white p-6",
      "shadow-sm transition-shadow hover:shadow-md",
      "dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}>
      {children}
    </div>
  );
}
```

### Post Card
```tsx
// Sub-component (not reusable — อยู่ในไฟล์เดียวกันได้)
function PostMeta({ date, readTime }: { date: string; readTime: number }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
      <time>{date}</time>
      <span>·</span>
      <span>{readTime} min read</span>
    </div>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const card = cn(
    "group rounded-xl border border-zinc-200 bg-white p-6",
    "transition-all hover:shadow-md hover:border-zinc-300",
    "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
  );

  return (
    <article className={card}>
      <PostMeta date={post.date} readTime={post.readTime} />
      <h2 className="mt-3 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100">
        {post.title}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
    </article>
  );
}
```

### Client Component พร้อม Animation
```tsx
"use client"; // ต้องการ: Framer Motion animation

import { motion } from "framer-motion";

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Badge / Tag
```tsx
interface BadgeProps {
  label: string;
  variant?: "default" | "outline";
  className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  const variants = {
    default: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    outline: "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
  };

  return (
    <span className={cn(base, variants[variant], className)}>{label}</span>
  );
}
```

### Blog Content (prose)
```tsx
export function BlogContent({ html }: { html: string }) {
  return (
    <div
      className={cn(
        "prose prose-zinc max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5",
        "dark:prose-invert dark:prose-code:bg-zinc-800"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

---

## Design Tokens — ที่กำหนดใน tailwind.config.ts

> ห้ามแก้ไขไฟล์นี้โดยไม่ขออนุมัติ

ใช้ token เหล่านี้แทนการ hardcode ค่า:

```ts
// ตัวอย่าง token ที่ควรมีใน tailwind.config.ts
colors: {
  brand: { ... },    // สีหลักของเว็บ → ใช้ bg-brand-500, text-brand-600
},
fontFamily: {
  sans: [...],       // font หลัก → ใช้ font-sans
  mono: [...],       // font code → ใช้ font-mono
},
```

ถ้าต้องการค่าที่ยังไม่มี token → แจ้งผู้ใช้เพื่อเพิ่มใน config แทนการใช้ arbitrary value

---

## Dark Mode — Pattern ที่ถูกต้อง

```tsx
// ✅ ใช้ dark: prefix เสมอ
"bg-white dark:bg-zinc-900"
"text-zinc-900 dark:text-zinc-100"
"border-zinc-200 dark:border-zinc-800"
"text-zinc-500 dark:text-zinc-400"

// ❌ ห้าม — ใช้ JS toggle หรือ class-based manual toggle
const isDark = useTheme(); // ❌
className={isDark ? "bg-zinc-900" : "bg-white"} // ❌
```

ThemeProvider ใช้ `next-themes` และต้องตั้งค่า `attribute="class"` เพื่อให้ `dark:` ทำงานได้

---

## Responsive — Mobile-first เสมอ

```tsx
// ✅ เริ่มจาก mobile แล้วค่อย override ขึ้น
"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
"text-xl sm:text-2xl lg:text-4xl"
"px-4 sm:px-6 lg:px-8"

// ❌ ห้าม Desktop-first
"grid-cols-3 sm:grid-cols-2 grid-cols-1" // ❌ ลำดับผิด
```
