import { describe, expect, it } from "vitest";

import {
  TASKS,
  initialQuizState,
  quizReducer,
  resultSummary,
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
      "Посмотри на числа 4, 8, 12 и 16. Что у них общего? Какое число не подходит к этой группе?",
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
    expect(s.status).toBe("wrong");
  });

  it("does not allow moving on before answering", () => {
    expect(run([{ type: "next" }]).index).toBe(0);
  });

  it("counts a correct answer with no mistakes as first try", () => {
    const s = run([{ type: "answer", option: "15" }]);
    expect(s.firstTry).toBe(1);
    expect(s.afterHint).toBe(0);
  });

  it("counts a correct answer after a hint separately", () => {
    const s = run([
      { type: "answer", option: "16" },
      { type: "retry" },
      { type: "answer", option: "14" },
      { type: "retry" },
      { type: "answer", option: "15" },
    ]);
    expect(s.firstTry).toBe(0);
    expect(s.afterHint).toBe(1);
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
    expect(s.finished).toBe(true);
    expect(s.firstTry).toBe(3);
    expect(s.afterHint).toBe(2);
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
    expect(resultSummary(s.firstTry, s.afterHint)).toBe(
      "Ты решил 3 задания с первой попытки и справился ещё с 2 заданиями с помощью подсказок.",
    );
  });
});
