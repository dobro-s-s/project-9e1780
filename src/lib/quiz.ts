export type QuizTask = {
  id: number;
  kind: string;
  question: string;
  /** Shown as big chips above the question; omitted for word problems. */
  items?: string[];
  /** Full text of a word problem. */
  story?: string;
  options: string[];
  answer: string;
  hint: string;
  praise: string;
  /** Short reason shown in the answer review on the result screen. */
  explain: string;
};

export const TASKS: QuizTask[] = [
  {
    id: 1,
    kind: "Числовая последовательность",
    question: "Какое число будет следующим?",
    items: ["3", "6", "9", "12", "?"],
    options: ["14", "15", "16"],
    answer: "15",
    hint: "Посмотри, на сколько каждое число больше предыдущего: от 3 до 6, от 6 до 9, от 9 до 12. Прибавь столько же к числу 12.",
    praise: "Верно! Каждый раз прибавляется 3, и 12\u00a0+\u00a03\u00a0=\u00a015.",
    explain: "Каждое число больше предыдущего на 3: 3, 6, 9, 12. Значит, дальше 12 + 3 = 15.",
  },
  {
    id: 2,
    kind: "Найди лишнее число",
    question: "Какое число здесь лишнее?",
    items: ["4", "8", "12", "15", "16"],
    options: ["8", "12", "15"],
    answer: "15",
    hint: "Посмотри на числа по порядку: 4, 8, 12, 15, 16. Какие из них увеличиваются друг от друга на 4? Какое число нарушает закономерность?",
    praise: "Точно! 4, 8, 12 и 16 делятся на 4, а 15 — нет.",
    explain: "4, 8, 12 и 16 делятся на 4 без остатка, а 15 — нет. Поэтому 15 лишнее.",
  },
  {
    id: 3,
    kind: "Продолжи последовательность",
    question: "Какая буква будет следующей?",
    items: ["А", "Б", "В", "Г", "?"],
    options: ["Д", "Е", "Ж"],
    answer: "Д",
    hint: "Вспомни алфавит: А, Б, В, Г… Какая буква стоит сразу после Г?",
    praise: "Правильно! В алфавите после Г идёт Д.",
    explain: "Это буквы алфавита по порядку: А, Б, В, Г. Сразу после Г идёт Д.",
  },
  {
    id: 4,
    kind: "Найди лишнее слово",
    question: "Какое слово здесь лишнее?",
    items: ["яблоко", "груша", "морковь", "слива"],
    options: ["яблоко", "морковь", "слива"],
    answer: "морковь",
    hint: "Подумай, где что растёт. Три из них — фрукты и растут на деревьях, а одно — овощ и растёт в земле на грядке.",
    praise: "Молодец! Яблоко, груша и слива — фрукты, а морковь — овощ.",
    explain: "Яблоко, груша и слива — фрукты, они растут на деревьях. Морковь — овощ, она растёт в земле.",
  },
  {
    id: 5,
    kind: "Логическая задача",
    question: "Сколько всего детей в семье?",
    story: "У Маши три брата. У каждого брата есть одна сестра.",
    options: ["3", "4", "6"],
    answer: "4",
    hint: "У всех братьев одна и та же сестра — это сама Маша. Посчитай братьев и не забудь про Машу.",
    praise: "Здорово! Три брата и Маша — всего 4 ребёнка.",
    explain: "У всех трёх братьев одна и та же сестра — Маша. Значит, в семье 3 брата и Маша: всего 4 ребёнка.",
  },
];

export type QuizStatus = "answering" | "correct" | "wrong";

/** Everything the child did on one task; kept when they step back and forth. */
export type TaskRecord = {
  status: QuizStatus;
  selected: string | null;
  /** Whether this task already had a wrong attempt (so the hint was shown). */
  hadMistake: boolean;
  /** Every answer pressed on this task, in order. */
  attempts: string[];
};

export type QuizState = {
  index: number;
  records: TaskRecord[];
  firstTry: number;
  afterHint: number;
  finished: boolean;
};

export type QuizAction =
  | { type: "answer"; option: string }
  | { type: "retry" }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

export const emptyRecord: TaskRecord = { status: "answering", selected: null, hadMistake: false, attempts: [] };

export function createInitialState(tasks: QuizTask[] = TASKS): QuizState {
  return {
    index: 0,
    records: tasks.map(() => emptyRecord),
    firstTry: 0,
    afterHint: 0,
    finished: false,
  };
}

export const initialQuizState: QuizState = createInitialState();

export function currentRecord(state: QuizState): TaskRecord {
  return state.records[state.index] ?? emptyRecord;
}

function withRecord(state: QuizState, record: TaskRecord): QuizState {
  const records = state.records.slice();
  records[state.index] = record;
  return { ...state, records };
}

export function quizReducer(state: QuizState, action: QuizAction, tasks: QuizTask[] = TASKS): QuizState {
  const record = currentRecord(state);
  switch (action.type) {
    case "answer": {
      // A solved task cannot be answered again, so it is never counted twice.
      if (state.finished || record.status !== "answering") return state;
      const task = tasks[state.index];
      if (!task) return state;
      const attempts = [...record.attempts, action.option];
      if (action.option === task.answer) {
        return {
          ...withRecord(state, { ...record, status: "correct", selected: action.option, attempts }),
          firstTry: record.hadMistake ? state.firstTry : state.firstTry + 1,
          afterHint: record.hadMistake ? state.afterHint + 1 : state.afterHint,
        };
      }
      return withRecord(state, { ...record, status: "wrong", selected: action.option, hadMistake: true, attempts });
    }
    case "retry": {
      if (record.status !== "wrong") return state;
      return withRecord(state, { ...record, status: "answering", selected: null });
    }
    case "next": {
      // Moving on is only allowed after a correct answer.
      if (state.finished || record.status !== "correct") return state;
      const isLast = state.index >= tasks.length - 1;
      return isLast ? { ...state, finished: true } : { ...state, index: state.index + 1 };
    }
    case "back": {
      // Step back to the previous task; every task keeps its answers and hint state.
      if (state.finished || state.index === 0) return state;
      return { ...state, index: state.index - 1 };
    }
    case "restart":
      return createInitialState(tasks);
  }
}

export type ReviewCategory = "all" | "firstTry" | "afterHint" | "unsolved";

/**
 * Tasks shown in a review list. firstTry, afterHint and unsolved split all tasks into three
 * groups with no overlap: solved without a mistake, solved after a hint, not solved yet.
 */
export function tasksInCategory(
  records: TaskRecord[],
  category: ReviewCategory,
  tasks: QuizTask[] = TASKS,
): QuizTask[] {
  return tasks.filter((_, i) => {
    if (category === "all") return true;
    const r = records[i];
    const solved = r?.status === "correct";
    if (category === "unsolved") return !solved;
    if (!r || !solved) return false;
    return category === "afterHint" ? r.hadMistake : !r.hadMistake;
  });
}

/** Wrong answers tried on a task, each listed once, in the order they were first chosen. */
export function wrongAnswers(record: TaskRecord, task: QuizTask): string[] {
  return [...new Set(record.attempts.filter((a) => a !== task.answer))];
}

/** Picks the Russian form of a noun for a number: 1 задание, 2 задания, 5 заданий. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Plain-language recap of the run, e.g. «Ты решил 3 задания … и справился ещё с 2 заданиями …». */
export function resultSummary(firstTry: number, afterHint: number): string {
  const first = pluralRu(firstTry, "задание", "задания", "заданий");
  // «справился ещё с N …» needs the instrumental case: с 1 заданием, с 2 заданиями, с 0 заданиями.
  const hinted = afterHint % 10 === 1 && afterHint % 100 !== 11 ? "заданием" : "заданиями";
  return `Ты решил ${firstTry} ${first} с первой попытки и справился ещё с ${afterHint} ${hinted} с помощью подсказок.`;
}

export function resultComment(firstTry: number, total: number): string {
  if (firstTry === total) return "Блестяще! Все задания с первой попытки — ты настоящий мастер логики!";
  if (firstTry >= total - 2) return "Отличная работа! Логика у тебя работает на ура. Ещё чуть-чуть — и будет идеально!";
  return "Все задания решены — это здорово! С каждой тренировкой будет получаться всё лучше.";
}
