import React from 'react'
import { Flex, Text, Button, Theme } from "@radix-ui/themes";

{/* หัวข้อเนื้อหา */ }
const Herosection = () => {
    return (
        <Theme>
            <Flex direction="column" gap="2">

                <section className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                    <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                        ยินดีต้อนรับสู่ Notion CMS
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        ระบบจัดการเนื้อหาด้วย Notion API และ Next.js 15
                    </p>
                </section>
                
                <Text>Hello from Radix Themes :)</Text>
                <Button>Let's go</Button>
            </Flex>
        </Theme>
    )
}

export default Herosection