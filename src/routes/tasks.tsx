import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Lightbulb, ListChecks, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";

import owl from "@/assets/owl-mascot.png";
import { PlayfulShapes } from "@/components/PlayfulShapes";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TASKS,
  initialQuizState,
  quizReducer,
  resultComment,
  resultSummary,
  type QuizAction,
  type QuizState,
} from "@/lib/quiz";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Задания — Тренируем логику" },
      {
        name: "description",
        content: "Пять заданий на внимание и логику для детей 8–10 лет: последовательности, лишнее число и слово, логическая задача.",
      },
      { property: "og:title", content: "Задания — Тренируем логику" },
      { property: "og:description", content: "Пять весёлых заданий на внимание и логику для детей 8–10 лет." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksScreen,
});

const reducer = (state: QuizState, action: QuizAction) => quizReducer(state, action);

function TasksScreen() {
  const [state, dispatch] = useReducer(reducer, initialQuizState);

  return (
    <main className="relative flex min-h-dvh items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10">
      <PlayfulShapes />
      {state.finished ? (
        <ResultCard state={state} onRestart={() => dispatch({ type: "restart" })} />
      ) : (
        <TaskCard key={state.index} state={state} dispatch={dispatch} />
      )}
    </main>
  );
}

function Progress({ index }: { index: number }) {
  const total = TASKS.length;
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="whitespace-nowrap font-display text-base font-bold text-muted-foreground sm:text-lg">
        Задание <span className="text-foreground">{index + 1}</span> из {total}
      </p>
      <div
        className="flex gap-1 sm:gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`Задание ${index + 1} из ${total}`}
      >
        {TASKS.map((t, i) => (
          <span
            key={t.id}
            className={cn(
              "h-3 w-5 rounded-full transition-colors sm:w-9",
              i < index ? "bg-secondary" : i === index ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ state, dispatch }: { state: QuizState; dispatch: (a: QuizAction) => void }) {
  const actionRef = useRef<HTMLButtonElement>(null);

  // Move focus to the feedback button so it scrolls into view on small screens.
  useEffect(() => {
    if (state.status !== "answering") actionRef.current?.focus();
  }, [state.status]);

  const task = TASKS[state.index];
  if (!task) return null;
  const answering = state.status === "answering";
  const longOptions = task.options.some((o) => o.length > 3);

  return (
    <section className="animate-pop relative z-10 w-full max-w-2xl rounded-4xl bg-card px-5 py-6 shadow-card sm:px-10 sm:py-10">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="На главную"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" strokeWidth={3} />
        </Link>
        <div className="flex-1">
          <Progress index={state.index} />
        </div>
      </div>

      <p className="mt-6 inline-flex rounded-full bg-accent/50 px-4 py-1.5 text-sm font-extrabold text-accent-foreground sm:text-base">
        {task.kind}
      </p>

      {task.story && (
        <p className="mt-5 text-2xl font-bold leading-snug text-foreground sm:text-3xl">{task.story}</p>
      )}

      {task.items && (
        <ul className="mt-5 flex flex-wrap gap-2 sm:gap-3" aria-label="Задание">
          {task.items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className={cn(
                "flex h-14 min-w-14 items-center justify-center rounded-2xl px-3 font-display text-2xl font-bold sm:h-16 sm:min-w-16 sm:text-3xl",
                item === "?" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                item.length > 3 && "text-lg sm:text-2xl",
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      <h1 className="mt-6 font-display text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
        {task.question}
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {task.options.map((option) => {
          const isSelected = state.selected === option;
          return (
            <Button
              key={option}
              variant="soft"
              disabled={!answering}
              onClick={() => dispatch({ type: "answer", option })}
              aria-pressed={isSelected}
              className={cn(
                "h-20 w-full px-2 font-bold sm:h-24",
                longOptions ? "text-base sm:text-2xl" : "text-3xl sm:text-4xl",
                "disabled:opacity-100",
                !answering && !isSelected && "opacity-50",
                isSelected && state.status === "correct" && "border-secondary bg-secondary text-secondary-foreground",
                isSelected && state.status === "wrong" && "border-primary bg-primary/10 text-primary-deep",
              )}
            >
              {option}
            </Button>
          );
        })}
      </div>

      <div aria-live="polite">
        {state.status === "correct" && (
          <Feedback tone="correct" title="Правильно!" text={task.praise}>
            <Button ref={actionRef} variant="play" size="md" onClick={() => dispatch({ type: "next" })}>
              Дальше
              <ArrowRight strokeWidth={3} />
            </Button>
          </Feedback>
        )}
        {state.status === "wrong" && (
          <Feedback tone="wrong" title="Не совсем так. Подсказка:" text={task.hint}>
            <Button ref={actionRef} variant="soft" size="md" onClick={() => dispatch({ type: "retry" })}>
              <RotateCcw strokeWidth={3} />
              Попробовать ещё раз
            </Button>
          </Feedback>
        )}
      </div>
    </section>
  );
}

function Feedback({
  tone,
  title,
  text,
  children,
}: {
  tone: "correct" | "wrong";
  title: string;
  text: string;
  children: ReactNode;
}) {
  const Icon = tone === "correct" ? Check : Lightbulb;
  return (
    <div
      className={cn(
        "animate-pop mt-6 rounded-3xl p-5 sm:p-6",
        tone === "correct" ? "bg-secondary/15" : "bg-accent/35",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            tone === "correct" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-7" strokeWidth={3} />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-foreground sm:text-2xl">{title}</p>
          <p className="mt-1 text-lg font-semibold leading-snug text-foreground sm:text-xl">{text}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-center sm:justify-end">{children}</div>
    </div>
  );
}

function ResultCard({ state, onRestart }: { state: QuizState; onRestart: () => void }) {
  const total = TASKS.length;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <section className="animate-pop relative z-10 flex w-full max-w-xl flex-col items-center rounded-4xl bg-card px-6 py-8 text-center shadow-card sm:px-10 sm:py-12">
      <img
        src={owl}
        alt="Весёлая сова с пазлом"
        width={1024}
        height={1024}
        className="animate-float size-32 drop-shadow-xl sm:size-40"
      />

      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
        Все задания <span className="text-primary">решены!</span>
      </h1>

      <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:gap-4">
        <Stat
          icon={<Sparkles className="size-6" strokeWidth={3} />}
          value={state.firstTry}
          total={total}
          label="с первой попытки"
          className="bg-secondary/15"
          iconClassName="bg-secondary text-secondary-foreground"
        />
        <Stat
          icon={<Lightbulb className="size-6" strokeWidth={3} />}
          value={state.afterHint}
          total={total}
          label="после подсказки"
          className="bg-accent/35"
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      <p className="mt-6 text-lg font-bold leading-snug text-foreground sm:text-xl">
        {resultSummary(state.firstTry, state.afterHint)}
      </p>

      <p className="mt-4 text-xl font-bold leading-snug text-foreground sm:text-2xl">
        {resultComment(state.firstTry, total)}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button ref={buttonRef} variant="play" size="md" onClick={onRestart}>
          <RotateCcw strokeWidth={3} />
          Пройти ещё раз
        </Button>
        <Button variant="soft" size="md" onClick={() => setReviewOpen(true)}>
          <ListChecks strokeWidth={3} />
          Разобрать ответы
        </Button>
        <Link to="/" className={cn(buttonVariants({ variant: "soft", size: "md" }))}>
          На главную
        </Link>
      </div>

      <AnswerReview open={reviewOpen} onOpenChange={setReviewOpen} />
    </section>
  );
}

/** All five tasks with the correct answer and a short reason, opened from the result screen. */
function AnswerReview({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-y-auto rounded-4xl border-0 bg-card p-5 shadow-card sm:rounded-4xl sm:p-8">
        <DialogHeader className="pr-10">
          <DialogTitle className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            Разбираем ответы
          </DialogTitle>
          <DialogDescription className="text-base font-semibold text-muted-foreground sm:text-lg">
            Все пять заданий с правильными ответами и короткими объяснениями.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-6 space-y-4">
          {TASKS.map((task) => (
            <li key={task.id} className="rounded-3xl bg-muted/60 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                  {task.id}
                </span>
                <p className="font-display text-base font-bold text-foreground sm:text-lg">{task.kind}</p>
              </div>

              {task.items && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Задание">
                  {task.items.map((item, i) => (
                    <li
                      key={`${item}-${i}`}
                      className={cn(
                        "flex h-9 min-w-9 items-center justify-center rounded-xl px-2 font-display text-base font-bold sm:text-lg",
                        item === "?" ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {task.story && (
                <p className="mt-3 text-base font-bold leading-snug text-foreground sm:text-lg">{task.story}</p>
              )}

              <p className="mt-3 flex flex-wrap items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                Правильный ответ:
                <span className="rounded-xl bg-secondary px-3 py-1 font-display text-secondary-foreground">
                  {task.answer}
                </span>
              </p>
              <p className="mt-2 text-base font-semibold leading-snug text-muted-foreground sm:text-lg">
                {task.explain}
              </p>
            </li>
          ))}
        </ol>

        <DialogClose className={cn(buttonVariants({ variant: "play", size: "md" }), "mt-6 w-full sm:w-auto")}>
          Понятно!
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon,
  value,
  total,
  label,
  className,
  iconClassName,
}: {
  icon: ReactNode;
  value: number;
  total: number;
  label: string;
  className: string;
  iconClassName: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl p-4 sm:p-5", className)}>
      <span className={cn("flex size-10 items-center justify-center rounded-xl", iconClassName)}>{icon}</span>
      <p className="mt-2 font-display text-4xl font-extrabold text-foreground sm:text-5xl">
        {value}
        <span className="text-xl text-muted-foreground sm:text-2xl"> из {total}</span>
      </p>
      <p className="mt-1 text-base font-bold text-muted-foreground sm:text-lg">{label}</p>
    </div>
  );
}
