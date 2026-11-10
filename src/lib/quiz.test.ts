import { describe, expect, it } from "vitest";

import { TASKS, initialQuizState, quizReducer, type QuizAction, type QuizState } from "./quiz";

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
