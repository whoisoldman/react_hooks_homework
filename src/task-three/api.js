// src/task-three/api.js
// Простой mock API с задержками и ошибками по вероятности

const LATENCY = 600;               // мс
const FAIL_RATE = 0.15;            // 15% шанс ошибки
let idSeq = 3;

let DB = [
  { id: 1, title: "Buy milk", done: false },
  { id: 2, title: "Read hooks docs", done: true },
  { id: 3, title: "Write Task Three", done: false },
];

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
function mayFail() {
  if (Math.random() < FAIL_RATE) {
    const err = new Error("Mock API error");
    err.code = "MOCK_FAIL";
    throw err;
  }
}

export async function fetchTodos(signal) {
  await delay(LATENCY);
  mayFail();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  // имитируем глубокую копию с сервера
  return DB.map((t) => ({ ...t }));
}

export async function createTodo(title, signal) {
  await delay(LATENCY);
  mayFail();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const todo = { id: ++idSeq, title, done: false };
  DB = [todo, ...DB];
  return { ...todo };
}

export async function toggleTodo(id, signal) {
  await delay(LATENCY);
  mayFail();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  DB = DB.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  const todo = DB.find((t) => t.id === id);
  return { ...todo };
}

export async function removeTodo(id, signal) {
  await delay(LATENCY);
  mayFail();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  DB = DB.filter((t) => t.id !== id);
  return { ok: true };
}
