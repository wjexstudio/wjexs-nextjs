import Image from "next/image";
import Link from "next/link";
import Herosection from "@/components/Herosection";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export default function Home() {
  // แสดงหน้าโฮมเริ่มต้น
  return (
    <Theme accentColor="crimson" grayColor="sand" radius="large" scaling="95%">
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
          <nav>
            {/* โลโก้ Next.js */}
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority // โหลดรูปนี้เป็นอันดับแรกสำหรับ LCP
            />
            <ul>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </nav>
        </main>
        <Herosection />
      </div>
    </Theme>
  );
}
