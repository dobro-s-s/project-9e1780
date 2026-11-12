import { fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { Route as TasksRoute } from "@/routes/tasks";

const ANSWERS = ["15", "15", "Д", "морковь", "4"];

// Renders only the tasks screen inside a tiny router, so the real buttons and state are exercised.
async function renderTasks() {
  const root = createRootRoute({ component: Outlet });
  const tasks = createRoute({ getParentRoute: () => root, path: "/tasks", component: TasksRoute.options.component });
  const home = createRoute({ getParentRoute: () => root, path: "/", component: () => <p>start</p> });
  const router = createRouter({
    routeTree: root.addChildren([home, tasks]),
    history: createMemoryHistory({ initialEntries: ["/tasks"] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByText("Задание", { exact: false });
}

const taskNumber = () => screen.getByRole("progressbar").getAttribute("aria-valuenow");
const answer = (option: string) => fireEvent.click(screen.getByRole("button", { name: option }));
const next = () => fireEvent.click(screen.getByRole("button", { name: /Дальше/ }));
const back = () => fireEvent.click(screen.getByRole("button", { name: "Назад к предыдущему заданию" }));

describe("tasks screen navigation", () => {
  it("«Дальше» moves from each task to the next one", async () => {
    await renderTasks();
    for (let i = 0; i < 4; i++) {
      expect(taskNumber()).toBe(String(i + 1));
      answer(ANSWERS[i]!);
      next();
    }
    expect(taskNumber()).toBe("5");
  });

  it("«Дальше» on the fifth task opens the results screen", async () => {
    await renderTasks();
    ANSWERS.forEach((a) => {
      answer(a);
      next();
    });
    expect(screen.getByRole("heading", { name: /Все задания/ })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("«Назад» on the solved fifth task returns to the fourth with its answer kept", async () => {
    await renderTasks();
    ANSWERS.forEach((a, i) => {
      answer(a);
      if (i < 4) next();
    });
    back();
    expect(taskNumber()).toBe("4");
    expect(screen.getByText("Правильно!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "морковь" })).toHaveAttribute("aria-pressed", "true");
    next();
    expect(taskNumber()).toBe("5");
    next();
    expect(screen.getByRole("heading", { name: /Все задания/ })).toBeInTheDocument();
  });

  it("«Назад» works from every task after the first", async () => {
    await renderTasks();
    ANSWERS.slice(0, 4).forEach((a) => {
      answer(a);
      next();
    });
    for (let n = 5; n > 1; n--) {
      expect(taskNumber()).toBe(String(n));
      back();
    }
    expect(taskNumber()).toBe("1");
  });
});
