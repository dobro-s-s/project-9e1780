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
  },
  {
    id: 2,
    kind: "Найди лишнее число",
    question: "Какое число здесь лишнее?",
    items: ["4", "8", "12", "15", "16"],
    options: ["8", "12", "15"],
    answer: "15",
    hint: "Проверь, какие числа делятся на 4 без остатка. Все числа делятся, кроме одного — оно и лишнее.",
    praise: "Точно! 4, 8, 12 и 16 делятся на 4, а 15 — нет.",
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
  },
];

export type QuizStatus = "answering" | "correct" | "wrong";

export type QuizState = {
  index: number;
  status: QuizStatus;
  selected: string | null;
  /** Whether the current task already had a wrong attempt. */
  hadMistake: boolean;
  firstTry: number;
  afterHint: number;
  finished: boolean;
};

export type QuizAction =
  | { type: "answer"; option: string }
  | { type: "retry" }
  | { type: "next" }
  | { type: "restart" };

export const initialQuizState: QuizState = {
  index: 0,
  status: "answering",
  selected: null,
  hadMistake: false,
  firstTry: 0,
  afterHint: 0,
  finished: false,
};

export function quizReducer(state: QuizState, action: QuizAction, tasks: QuizTask[] = TASKS): QuizState {
  switch (action.type) {
    case "answer": {
      if (state.finished || state.status !== "answering") return state;
      const task = tasks[state.index];
      if (!task) return state;
      if (action.option === task.answer) {
        return {
          ...state,
          status: "correct",
          selected: action.option,
          firstTry: state.hadMistake ? state.firstTry : state.firstTry + 1,
          afterHint: state.hadMistake ? state.afterHint + 1 : state.afterHint,
        };
      }
      return { ...state, status: "wrong", selected: action.option, hadMistake: true };
    }
    case "retry": {
      if (state.status !== "wrong") return state;
      return { ...state, status: "answering", selected: null };
    }
    case "next": {
      // Moving on is only allowed after a correct answer.
      if (state.status !== "correct") return state;
      const isLast = state.index >= tasks.length - 1;
      return {
        ...state,
        index: isLast ? state.index : state.index + 1,
        status: "answering",
        selected: null,
        hadMistake: false,
        finished: isLast,
      };
    }
    case "restart":
      return initialQuizState;
  }
}

export function resultComment(firstTry: number, total: number): string {
  if (firstTry === total) return "Блестяще! Все задания с первой попытки — ты настоящий мастер логики!";
  if (firstTry >= total - 2) return "Отличная работа! Логика у тебя работает на ура. Ещё чуть-чуть — и будет идеально!";
  return "Все задания решены — это здорово! С каждой тренировкой будет получаться всё лучше.";
}
