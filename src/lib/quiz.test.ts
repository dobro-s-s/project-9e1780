import { describe, expect, it } from "vitest";

import {
  TASKS,
  currentRecord,
  initialQuizState,
  quizReducer,
  resultCounts,
  resultSummary,
  tasksInCategory,
  wrongAnswers,
  type QuizAction,
  type QuizState,
} from "./quiz";

const run = (actions: QuizAction[], start: QuizState = initialQuizState) =>
  actions.reduce((s, a) => quizReducer(s, a), start);

describe("quiz tasks", () => {
  it("has the five tasks with the agreed correct answers", () => {
    expect(TASKS.map((t) => t.answer)).toEqual(["15", "15", "Д", "морковь", "4"]);
  });

  it("offers exactly three options per task, including the answer", () => {
    expect(TASKS.map((t) => t.options)).toEqual([
      ["14", "15", "16"],
      ["8", "12", "15"],
      ["Д", "Е", "Ж"],
      ["яблоко", "морковь", "слива"],
      ["3", "4", "6"],
    ]);
  });

  it("uses the agreed hint for the second task", () => {
    expect(TASKS[1]?.hint).toBe(
      "Посмотри на числа по порядку: 4, 8, 12, 15, 16. Какие из них увеличиваются друг от друга на 4? Какое число нарушает закономерность?",
    );
  });

  it("gives every task a short explanation that names the correct answer", () => {
    expect(TASKS.map((t) => t.explain.trim().length > 0)).toEqual([true, true, true, true, true]);
    expect(TASKS.map((t) => t.explain.toLowerCase().includes(t.answer.toLowerCase()))).toEqual([
      true, true, true, true, true,
    ]);
  });
});

describe("quiz rules", () => {
  it("does not allow moving on after a wrong answer", () => {
    const s = run([{ type: "answer", option: "14" }, { type: "next" }]);
    expect(s.index).toBe(0);
    expect(currentRecord(s).status).toBe("wrong");
  });

  it("does not allow moving on before answering", () => {
    expect(run([{ type: "next" }]).index).toBe(0);
  });

  it("counts a correct answer with no mistakes as first try", () => {
    const s = run([{ type: "answer", option: "15" }]);
    expect(resultCounts(s.records).firstTry).toBe(1);
    expect(resultCounts(s.records).afterHint).toBe(0);
  });

  it("counts a correct answer after a hint separately", () => {
    const s = run([
      { type: "answer", option: "16" },
      { type: "retry" },
      { type: "answer", option: "14" },
      { type: "retry" },
      { type: "answer", option: "15" },
    ]);
    expect(resultCounts(s.records).firstTry).toBe(0);
    expect(resultCounts(s.records).afterHint).toBe(1);
  });

  it("finishes after the fifth task with the right totals", () => {
    const s = run([
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "8" },
      { type: "retry" },
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "Д" },
      { type: "next" },
      { type: "answer", option: "слива" },
      { type: "retry" },
      { type: "answer", option: "морковь" },
      { type: "next" },
      { type: "answer", option: "4" },
      { type: "next" },
    ]);
    expect(s.phase).toBe("done");
    expect(resultCounts(s.records).firstTry).toBe(3);
    expect(resultCounts(s.records).afterHint).toBe(2);
  });

  it("restart resets progress and counters", () => {
    const s = run([{ type: "answer", option: "15" }, { type: "next" }, { type: "restart" }]);
    expect(s).toEqual(initialQuizState);
  });
});

describe("result summary", () => {
  it("states the real counts with the right Russian noun forms", () => {
    expect(resultSummary(3, 2)).toBe(
      "Ты решил 3 задания с первой попытки и справился ещё с 2 заданиями с помощью подсказок.",
    );
    expect(resultSummary(1, 0)).toBe(
      "Ты решил 1 задание с первой попытки и справился ещё с 0 заданиями с помощью подсказок.",
    );
    expect(resultSummary(5, 0)).toBe(
      "Ты решил 5 заданий с первой попытки и справился ещё с 0 заданиями с помощью подсказок.",
    );
    expect(resultSummary(11, 1)).toBe(
      "Ты решил 11 заданий с первой попытки и справился ещё с 1 заданием с помощью подсказок.",
    );
    expect(resultSummary(21, 4)).toBe(
      "Ты решил 21 задание с первой попытки и справился ещё с 4 заданиями с помощью подсказок.",
    );
  });

  it("matches the counters of a finished run", () => {
    const s = run([
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "8" },
      { type: "retry" },
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "Д" },
      { type: "next" },
      { type: "answer", option: "слива" },
      { type: "retry" },
      { type: "answer", option: "морковь" },
      { type: "next" },
      { type: "answer", option: "4" },
      { type: "next" },
    ]);
    expect(resultSummary(resultCounts(s.records).firstTry, resultCounts(s.records).afterHint)).toBe(
      "Ты решил 3 задания с первой попытки и справился ещё с 2 заданиями с помощью подсказок.",
    );
  });
});

const FULL_RUN: QuizAction[] = [
  { type: "answer", option: "15" },
  { type: "next" },
  { type: "answer", option: "8" },
  { type: "retry" },
  { type: "answer", option: "12" },
  { type: "retry" },
  { type: "answer", option: "15" },
  { type: "next" },
  { type: "answer", option: "Д" },
  { type: "next" },
  { type: "answer", option: "слива" },
  { type: "retry" },
  { type: "answer", option: "морковь" },
  { type: "next" },
  { type: "answer", option: "4" },
  { type: "next" },
];

describe("going back between tasks", () => {
  it("returns to the previous task", () => {
    const s = run([{ type: "answer", option: "15" }, { type: "next" }, { type: "back" }]);
    expect(s.index).toBe(0);
  });

  it("does nothing on the first task (the screen sends the child home instead)", () => {
    expect(run([{ type: "back" }]).index).toBe(0);
  });

  it("keeps a solved task solved with its answer after going back", () => {
    const s = run([{ type: "answer", option: "15" }, { type: "next" }, { type: "back" }]);
    expect(currentRecord(s).status).toBe("correct");
    expect(currentRecord(s).selected).toBe("15");
  });

  it("keeps the hint open on a task the child left after a wrong answer", () => {
    const s = run([
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "8" },
      { type: "back" },
      { type: "next" },
    ]);
    expect(s.index).toBe(1);
    expect(currentRecord(s).status).toBe("wrong");
    expect(currentRecord(s).selected).toBe("8");
  });

  it("does not count a task twice when going back and forward", () => {
    const s = run([
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "back" },
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "back" },
      { type: "next" },
    ]);
    expect(s.index).toBe(1);
    expect(resultCounts(s.records).firstTry).toBe(1);
    expect(resultCounts(s.records).afterHint).toBe(0);
  });

  it("still counts after a hint when the child comes back and solves the task", () => {
    const s = run([
      { type: "answer", option: "15" },
      { type: "next" },
      { type: "answer", option: "12" },
      { type: "back" },
      { type: "next" },
      { type: "retry" },
      { type: "answer", option: "15" },
    ]);
    expect(resultCounts(s.records).firstTry).toBe(1);
    expect(resultCounts(s.records).afterHint).toBe(1);
  });

  it("does not skip an unsolved task by going back and forward", () => {
    const s = run([{ type: "answer", option: "15" }, { type: "next" }, { type: "back" }, { type: "next" }, { type: "next" }]);
    expect(s.index).toBe(1);
  });
});

describe("last task", () => {
  const toFifth: QuizAction[] = FULL_RUN.slice(0, -2);

  it("«Дальше» after the correct fifth answer finishes the quiz", () => {
    expect(run([...toFifth, { type: "answer", option: "4" }, { type: "next" }]).phase).toBe("done");
  });

  it("«Назад» on the solved fifth task returns to the fourth, keeping both answers", () => {
    const s = run([...toFifth, { type: "answer", option: "4" }, { type: "back" }]);
    expect(s.phase).toBe("main");
    expect(s.index).toBe(3);
    expect(currentRecord(s).selected).toBe("морковь");
    expect(s.records[4]?.status).toBe("correct");
  });
});

describe("result review lists", () => {
  const s = run(FULL_RUN);

  it("lists first-try tasks", () => {
    expect(tasksInCategory(s.records, "firstTry").map((t) => t.id)).toEqual([1, 3, 5]);
  });

  it("lists after-hint tasks", () => {
    expect(tasksInCategory(s.records, "afterHint").map((t) => t.id)).toEqual([2, 4]);
  });

  it("lists all five tasks in the full review", () => {
    expect(tasksInCategory(s.records, "all").map((t) => t.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("has no unsolved tasks after a finished run", () => {
    expect(tasksInCategory(s.records, "unsolved")).toEqual([]);
  });

  it("puts each of the five tasks into exactly one of the three groups", () => {
    const ids = (["firstTry", "afterHint", "unsolved"] as const).flatMap((c) =>
      tasksInCategory(s.records, c).map((t) => t.id),
    );
    expect(ids.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("lists tasks not solved yet as unsolved", () => {
    const partial = run([{ type: "answer", option: "15" }, { type: "next" }, { type: "answer", option: "8" }]);
    expect(tasksInCategory(partial.records, "unsolved").map((t) => t.id)).toEqual([3, 4, 5]);
    expect(tasksInCategory(partial.records, "wrong").map((t) => t.id)).toEqual([2]);
    expect(tasksInCategory(partial.records, "afterHint")).toEqual([]);
  });

  it("agrees with the counters", () => {
    expect(tasksInCategory(s.records, "firstTry")).toHaveLength(resultCounts(s.records).firstTry);
    expect(tasksInCategory(s.records, "afterHint")).toHaveLength(resultCounts(s.records).afterHint);
  });

  it("gives an empty after-hint list when everything was solved first try", () => {
    const perfect = run([
      { type: "answer", option: "15" }, { type: "next" },
      { type: "answer", option: "15" }, { type: "next" },
      { type: "answer", option: "Д" }, { type: "next" },
      { type: "answer", option: "морковь" }, { type: "next" },
      { type: "answer", option: "4" }, { type: "next" },
    ]);
    expect(tasksInCategory(perfect.records, "afterHint")).toEqual([]);
  });

  it("remembers the child's wrong answers and the final one", () => {
    const record = s.records[1]!;
    expect(wrongAnswers(record, TASKS[1]!)).toEqual(["8", "12"]);
    expect(record.selected).toBe("15");
  });
});
