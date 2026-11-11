import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Lightbulb, ListChecks, RotateCcw, Sparkles } from "lucide-react";
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
  currentRecord,
  emptyRecord,
  initialQuizState,
  quizReducer,
  resultComment,
  resultCounts,
  resultSummary,
  tasksInCategory,
  wrongAnswers,
  type QuizAction,
  type QuizState,
  type QuizTask,
  type ReviewCategory,
  type TaskRecord,
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
      {state.phase === "done" ? (
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

const backButtonClass =
  "flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-border px-2.5 font-extrabold text-muted-foreground transition-colors hover:text-foreground sm:px-4";

function TaskCard({ state, dispatch }: { state: QuizState; dispatch: (a: QuizAction) => void }) {
  const actionRef = useRef<HTMLButtonElement>(null);
  const record = currentRecord(state);
  const lastStatus = useRef(record.status);

  // Each task opens at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // After an answer, move focus to the feedback button so it scrolls into view on small screens.
  // Skipped when returning to a task that was already answered.
  useEffect(() => {
    if (record.status !== lastStatus.current && record.status !== "answering") actionRef.current?.focus();
    lastStatus.current = record.status;
  }, [record.status]);

  const task = TASKS[state.index];
  if (!task) return null;
  const answering = record.status === "answering";
  const longOptions = task.options.some((o) => o.length > 3);
  const backContent = (
    <>
      <ArrowLeft className="size-5" strokeWidth={3} />
      <span className="hidden sm:inline">Назад</span>
    </>
  );

  return (
    <section className="animate-pop relative z-10 w-full max-w-2xl rounded-4xl bg-card px-5 py-6 shadow-card sm:px-10 sm:py-10">
      <div className="flex items-center gap-3">
        {state.index === 0 ? (
          <Link to="/" aria-label="Назад на главную" className={backButtonClass}>
            {backContent}
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Назад к предыдущему заданию"
            onClick={() => dispatch({ type: "back" })}
            className={backButtonClass}
          >
            {backContent}
          </button>
        )}
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
          const isSelected = record.selected === option;
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
                isSelected && record.status === "correct" && "border-secondary bg-secondary text-secondary-foreground",
                isSelected && record.status === "wrong" && "border-primary bg-primary/10 text-primary-deep",
              )}
            >
              {option}
            </Button>
          );
        })}
      </div>

      <div aria-live="polite">
        {record.status === "correct" && (
          <Feedback tone="correct" title="Правильно!" text={task.praise}>
            <Button ref={actionRef} variant="play" size="md" onClick={() => dispatch({ type: "next" })}>
              Дальше
              <ArrowRight strokeWidth={3} />
            </Button>
          </Feedback>
        )}
        {record.status === "wrong" && (
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

type ReviewView = { category: ReviewCategory; open: boolean; taskId: number | null };

function ResultCard({ state, onRestart }: { state: QuizState; onRestart: () => void }) {
  const total = TASKS.length;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [review, setReview] = useState<ReviewView>({ category: "all", open: false, taskId: null });
  const counts = resultCounts(state.records);
  const unsolved = counts.unsolved + counts.wrong;
  const openReview = (category: ReviewCategory) => setReview({ category, open: true, taskId: null });

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <section className="animate-pop relative z-10 flex w-full max-w-2xl flex-col items-center rounded-4xl bg-card px-5 py-8 text-center shadow-card sm:px-10 sm:py-12">
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

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          icon={<Sparkles className="size-6" strokeWidth={3} />}
          value={counts.firstTry}
          total={total}
          label="с первой попытки"
          onClick={() => openReview("firstTry")}
          className="bg-secondary/15 hover:bg-secondary/25"
          iconClassName="bg-secondary text-secondary-foreground"
        />
        <Stat
          icon={<Lightbulb className="size-6" strokeWidth={3} />}
          value={counts.afterHint}
          total={total}
          label="после подсказки"
          onClick={() => openReview("afterHint")}
          className="bg-accent/35 hover:bg-accent/50"
          iconClassName="bg-accent text-accent-foreground"
        />
        <Stat
          icon={<CircleHelp className="size-6" strokeWidth={3} />}
          value={unsolved}
          total={total}
          label="не решено"
          onClick={() => openReview("unsolved")}
          className="bg-primary/10 hover:bg-primary/15"
          iconClassName="bg-primary text-primary-foreground"
        />
      </div>

      <p className="mt-6 text-lg font-bold leading-snug text-foreground sm:text-xl">
        {resultSummary(counts.firstTry, counts.afterHint)}
      </p>

      <p className="mt-4 text-xl font-bold leading-snug text-foreground sm:text-2xl">
        {resultComment(counts.firstTry, total, counts.firstTry + counts.afterHint)}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button ref={buttonRef} variant="play" size="md" onClick={onRestart}>
          <RotateCcw strokeWidth={3} />
          Пройти ещё раз
        </Button>
        <Button variant="soft" size="md" onClick={() => openReview("all")}>
          <ListChecks strokeWidth={3} />
          Разобрать ответы
        </Button>
        <Link to="/" className={cn(buttonVariants({ variant: "soft", size: "md" }))}>
          На главную
        </Link>
      </div>

      <ReviewDialog
        view={review}
        records={state.records}
        onOpenChange={(open) => setReview((r) => ({ ...r, open }))}
        onShowTask={(taskId) => setReview((r) => ({ ...r, taskId }))}
      />
    </section>
  );
}

const REVIEW_TEXT: Record<ReviewCategory, { title: string; description: string; empty: string }> = {
  all: {
    title: "Разбираем ответы",
    description: "Все пять заданий с правильными ответами и объяснениями. Нажми на задание, чтобы посмотреть подробный разбор.",
    empty: "",
  },
  firstTry: {
    title: "С первой попытки",
    description: "Задания, которые ты решил правильно без подсказки. Нажми на задание, чтобы посмотреть разбор.",
    empty: "В этот раз ни одно задание не решено с первой попытки. Ничего страшного — подсказки помогли тебе справиться!",
  },
  afterHint: {
    title: "После подсказки",
    description: "Задания, в которых правильный ответ получился после подсказки. Нажми на задание, чтобы посмотреть разбор.",
    empty: "Здесь пусто — подсказка тебе ни разу не понадобилась. Все задания решены с первой попытки!",
  },
  wrong: {
    title: "Неправильно",
    description: "Задания, где остался неверный ответ. Посмотри правильный ответ и объяснение.",
    empty: "Здесь пусто — неправильных ответов не осталось!",
  },
  unsolved: {
    title: "Не решено",
    description: "Задания, на которые правильный ответ пока не получен.",
    empty: "Здесь пусто — ты решил все пять заданий! Нерешённых заданий нет.",
  },
};

/** One window for every review: a list of tasks and, after a tap, the full review of one task. */
function ReviewDialog({
  view,
  records,
  onOpenChange,
  onShowTask,
}: {
  view: ReviewView;
  records: TaskRecord[];
  onOpenChange: (open: boolean) => void;
  onShowTask: (taskId: number | null) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const text = REVIEW_TEXT[view.category];
  const tasks = tasksInCategory(records, view.category);
  const detailTask = view.taskId === null ? null : TASKS.find((t) => t.id === view.taskId) ?? null;
  const recordOf = (task: QuizTask) => records[TASKS.indexOf(task)] ?? emptyRecord;

  const show = (taskId: number | null) => {
    onShowTask(taskId);
    contentRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (detailTask) backRef.current?.focus({ preventScroll: true });
  }, [detailTask]);

  return (
    <Dialog open={view.open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="max-h-[88dvh] w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-y-auto rounded-4xl border-0 bg-card p-5 text-left shadow-card sm:rounded-4xl sm:p-8"
      >
        {detailTask ? (
          <>
            <Button ref={backRef} variant="soft" size="md" className="justify-self-start" onClick={() => show(null)}>
              <ArrowLeft strokeWidth={3} />К списку
            </Button>
            <DialogHeader className="mt-5 pr-10">
              <DialogTitle className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                Задание {detailTask.id}
              </DialogTitle>
              <DialogDescription className="text-base font-bold text-muted-foreground sm:text-lg">
                {detailTask.kind}
              </DialogDescription>
            </DialogHeader>
            <TaskDetail task={detailTask} record={recordOf(detailTask)} />
          </>
        ) : (
          <>
            <DialogHeader className="pr-10">
              <DialogTitle className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                {text.title}
              </DialogTitle>
              <DialogDescription className="text-base font-semibold text-muted-foreground sm:text-lg">
                {text.description}
              </DialogDescription>
            </DialogHeader>

            {tasks.length === 0 ? (
              <p className="mt-6 rounded-3xl bg-muted/60 p-5 text-lg font-bold leading-snug text-foreground sm:text-xl">
                {text.empty}
              </p>
            ) : (
              <ol className="mt-6 space-y-4">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => show(task.id)}
                      className="block w-full rounded-3xl bg-muted/60 p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 sm:p-5"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                          {task.id}
                        </span>
                        <span className="flex-1 font-display text-base font-bold text-foreground sm:text-lg">
                          {task.kind}
                        </span>
                        <ChevronRight className="size-6 shrink-0 text-muted-foreground" strokeWidth={3} />
                      </span>
                      <span className="mt-3 block text-base font-bold leading-snug text-foreground sm:text-lg">
                        {task.story ? `${task.story} ${task.question}` : `${task.question} ${task.items?.join(", ") ?? ""}`}
                      </span>
                      <span className="mt-3 block space-y-2">
                        <ChildAnswer task={task} record={recordOf(task)} />
                        <AnswerRow label="Правильный ответ:">
                          <Chip tone="right">{task.answer}</Chip>
                        </AnswerRow>
                      </span>
                      <span className="mt-2 block text-base font-semibold leading-snug text-muted-foreground sm:text-lg">
                        {task.explain}
                      </span>
                      <span className="mt-3 flex items-center gap-1 text-base font-extrabold text-primary-deep">
                        Подробный разбор
                        <ArrowRight className="size-4" strokeWidth={3} />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <DialogClose className={cn(buttonVariants({ variant: "play", size: "md" }), "mt-6 w-full sm:w-auto sm:justify-self-end")}>
          Понятно!
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetail({ task, record }: { task: QuizTask; record: TaskRecord }) {
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-3xl bg-muted/60 p-4 sm:p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Условие</p>
        {task.story && <p className="mt-2 text-lg font-bold leading-snug text-foreground sm:text-xl">{task.story}</p>}
        {task.items && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Задание">
            {task.items.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className={cn(
                  "flex h-11 min-w-11 items-center justify-center rounded-xl px-2.5 font-display text-lg font-bold sm:h-12 sm:min-w-12 sm:text-xl",
                  item === "?" ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-display text-lg font-bold text-foreground sm:text-xl">{task.question}</p>
      </div>

      <div className="space-y-3 rounded-3xl bg-muted/60 p-4 sm:p-5">
        <ChildAnswer task={task} record={record} />
        <AnswerRow label="Правильный ответ:">
          <Chip tone="right">{task.answer}</Chip>
        </AnswerRow>
      </div>

      <div className="rounded-3xl bg-secondary/15 p-4 sm:p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Почему так</p>
        <p className="mt-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">{task.explain}</p>
      </div>
    </div>
  );
}

/** What the child chose: the right answer at once, wrong tries then the right one, or wrong tries only. */
function ChildAnswer({ task, record }: { task: QuizTask; record: TaskRecord }) {
  const wrong = wrongAnswers(record, task);
  const solved = record.status === "correct";
  if (!solved && wrong.length === 0) {
    return (
      <AnswerRow label="Твой ответ:">
        <span className="font-semibold text-muted-foreground">ответа пока нет</span>
      </AnswerRow>
    );
  }
  if (wrong.length === 0) {
    return (
      <AnswerRow label="Твой ответ:">
        <Chip tone="right">{task.answer}</Chip>
        <span className="font-semibold text-muted-foreground">верно с первой попытки</span>
      </AnswerRow>
    );
  }
  return (
    <>
      <AnswerRow label={solved ? "Сначала ты выбрал:" : "Твой ответ:"}>
        {wrong.map((w) => (
          <Chip key={w} tone="wrong">
            {w}
          </Chip>
        ))}
      </AnswerRow>
      {solved && (
        <AnswerRow label="После подсказки:">
          <Chip tone="right">{task.answer}</Chip>
        </AnswerRow>
      )}
    </>
  );
}

function AnswerRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-base font-bold text-foreground sm:text-lg">
      {label}
      {children}
    </span>
  );
}

function Chip({ tone, children }: { tone: "right" | "wrong"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-xl px-3 py-1 font-display",
        tone === "right" ? "bg-secondary text-secondary-foreground" : "bg-primary/15 text-primary-deep",
      )}
    >
      {children}
    </span>
  );
}

function Stat({
  icon,
  value,
  total,
  label,
  onClick,
  className,
  iconClassName,
}: {
  icon: ReactNode;
  value: number;
  total: number;
  label: string;
  onClick: () => void;
  className: string;
  iconClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value} из ${total}. Открыть список заданий`}
      className={cn(
        "flex items-center gap-4 rounded-3xl p-4 text-left transition-[background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 sm:flex-col sm:gap-0 sm:p-5 sm:text-center",
        className,
      )}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconClassName)}>{icon}</span>
      <span className="flex-1 sm:flex-none">
        <span className="block font-display text-3xl font-extrabold text-foreground sm:mt-2 sm:text-5xl">
          {value}
          <span className="text-lg text-muted-foreground sm:text-2xl"> из {total}</span>
        </span>
        <span className="mt-0.5 block text-base font-bold text-muted-foreground sm:mt-1 sm:text-lg">{label}</span>
      </span>
      <ChevronRight className="size-6 shrink-0 text-muted-foreground sm:hidden" strokeWidth={3} />
      <span className="mt-2 hidden items-center gap-1 text-sm font-extrabold text-foreground sm:flex">
        Посмотреть
        <ChevronRight className="size-4" strokeWidth={3} />
      </span>
    </button>
  );
}
