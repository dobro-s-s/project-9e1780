import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Puzzle } from "lucide-react";

import { PlayfulShapes } from "@/components/PlayfulShapes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Задания — Тренируем логику" },
      { name: "description", content: "Скоро здесь появятся задания на внимание и логику для детей 8–10 лет." },
      { property: "og:title", content: "Задания — Тренируем логику" },
      { property: "og:description", content: "Скоро здесь появятся задания на внимание и логику." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPlaceholder,
});

function TasksPlaceholder() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-10">
      <PlayfulShapes />

      <section className="animate-pop relative z-10 flex w-full max-w-lg flex-col items-center rounded-4xl bg-card px-6 py-12 text-center shadow-card sm:px-10 sm:py-16">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-accent text-accent-foreground sm:size-24">
          <Puzzle className="size-10 sm:size-12" strokeWidth={2.5} />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Здесь будут задания
        </h1>

        <Link to="/" className={cn(buttonVariants({ variant: "soft", size: "md" }), "mt-10")}>
          <ArrowLeft strokeWidth={3} />
          На главную
        </Link>
      </section>
    </main>
  );
}
