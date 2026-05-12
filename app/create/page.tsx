"use client";

import { useRouter } from "next/navigation";
import StoryGenerator from "@/components/StoryGenerator";
import AppHeader from "@/components/AppHeader";

export default function CreatePage() {
  const router = useRouter();

  return (
    <>
      <AppHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-28">
        <StoryGenerator
          onStoryGenerated={() => {
            // 生成成功后不做自动跳转，让用户在结果页看完故事
          }}
          onClose={() => router.push("/")}
        />
      </main>
    </>
  );
}
