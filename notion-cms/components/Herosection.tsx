import React from 'react'

{/* หัวข้อเนื้อหา */ }
const Herosection = () => {
    return (
        <section className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                ยินดีต้อนรับสู่ Notion CMS
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
                ระบบจัดการเนื้อหาด้วย Notion API และ Next.js 15
            </p>
        </section>
    )
}

export default Herosection