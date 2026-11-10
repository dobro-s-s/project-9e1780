import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

import owl from "@/assets/owl-mascot.png";
import { PlayfulShapes } from "@/components/PlayfulShapes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Тренируем логику — тренажёр для детей 8–10 лет" },
      {
        name: "description",
        content: "Весёлые задания на внимание и логику для детей 8–10 лет. Нажми «Начать» и проверь свою сообразительность!",
      },
      { property: "og:title", content: "Тренируем логику" },
      {
        property: "og:description",
        content: "Весёлые задания на внимание и логику для детей 8–10 лет.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StartScreen,
});

function StartScreen() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-10 md:px-8">
      <PlayfulShapes />

      <section className="animate-pop relative z-10 flex w-full max-w-xl flex-col items-center text-center lg:max-w-5xl lg:flex-row lg:gap-12 lg:text-left">
        <img
          src={owl}
          alt="Весёлая сова с пазлом"
          width={1024}
          height={1024}
          className="animate-float size-44 shrink-0 drop-shadow-xl sm:size-56 lg:size-80"
        />

        <div className="mt-4 flex flex-col items-center lg:mt-0 lg:items-start">
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Тренируем <span className="text-primary">логику</span>
          </h1>

          <p className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
            Привет! Готов проверить свою сообразительность?
          </p>

          <p className="mt-3 text-lg font-semibold text-muted-foreground sm:text-xl">
            Тебя ждут интересные задания на внимание и логику
          </p>

          <Link
            to="/tasks"
            className={cn(buttonVariants({ variant: "play", size: "xl" }), "mt-9")}
          >
            <Play fill="currentColor" />
            Начать
          </Link>
        </div>
      </section>
    </main>
  );
}
