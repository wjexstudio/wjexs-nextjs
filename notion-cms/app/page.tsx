import Image from "next/image";

export default function Home() {
  // แสดงหน้าโฮมเริ่มต้น
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* โลโก้ Next.js */}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority // โหลดรูปนี้เป็นอันดับแรกสำหรับ LCP
        />
        
        {/* เนื้อหาหลัก */}
        <section className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            ยินดีต้อนรับสู่ Notion CMS
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            ระบบจัดการเนื้อหาด้วย Notion API และ Next.js 15
          </p>
        </section>

        {/* ปุ่มลัด */}
        <section className="flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            อ่าน Documentation
          </a>
        </section>
      </main>
    </div>
  );
}
