import React from "react";
import "./TaskThree.css";
import { fetchTodos, createTodo, toggleTodo, removeTodo } from "./api";

/** Неблокирующий статус загрузки */
function useAsyncState(initial = { loading: false, error: null }) {
  const [state, setState] = React.useState(initial);
  const start = React.useCallback(() => setState({ loading: true, error: null }), []);
  const success = React.useCallback(() => setState({ loading: false, error: null }), []);
  const fail = React.useCallback((e) => setState({ loading: false, error: e }), []); // <-- fix
  return { ...state, start, success, fail };
}

export default function TaskThree() {
  const [items, setItems] = React.useState([]);
  const [text, setText] = React.useState("");
  const { loading, error, start, success, fail } = useAsyncState();
  const abortRef = React.useRef(null);

  // INIT: загрузка списка
  React.useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    (async () => {
      try {
        start();
        const data = await fetchTodos(ctrl.signal);
        setItems(data);
        success();
      } catch (e) {
        if (e.name !== "AbortError") fail(e);
      }
    })();
    return () => ctrl.abort();
  }, [start, success, fail]);

  const onChange = React.useCallback((e) => setText(e.target.value), []);
  const canCreate = text.trim().length > 0 && !loading;

  // CREATE: оптимистично добавляем запись и заменяем её ответом сервера
  const onCreate = React.useCallback(async () => {
    if (!text.trim()) return;
    const optimistic = { id: Date.now(), title: text.trim(), done: false, _optimistic: true };
    setItems((prev) => [optimistic, ...prev]);
    setText("");
    try {
      const real = await createTodo(optimistic.title, abortRef.current?.signal);
      setItems((prev) => prev.map((t) => (t.id === optimistic.id ? real : t)));
    } catch {
      // откат — удаляем оптимистичную запись
      setItems((prev) => prev.filter((t) => t.id !== optimistic.id));
      alert("Не удалось создать задачу");
    }
  }, [text]);

  // TOGGLE: оптимистично переключаем, при ошибке аккуратно откатываем
  const onToggle = React.useCallback(async (id) => {
    const wasDone = items.find((t) => t.id === id)?.done ?? false;
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      await toggleTodo(id, abortRef.current?.signal);
    } catch {
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, done: wasDone } : t)));
    }
  }, [items]);

  // DELETE: оптимистично убираем; при ошибке — возвращаем ровно одну запись
  const onRemove = React.useCallback(async (id, e) => {
    e?.stopPropagation?.(); // не задеваем checkbox
    const removedItem = items.find((t) => t.id === id);
    if (!removedItem) return;

    setItems((prev) => prev.filter((t) => t.id !== id));
    try {
      await removeTodo(id, abortRef.current?.signal);
    } catch {
      setItems((prev) => [removedItem, ...prev]);
      alert("Не удалось удалить задачу");
    }
  }, [items]);

  const stats = React.useMemo(() => {
    const done = items.filter((t) => t.done).length;
    return { total: items.length, done, left: items.length - done };
  }, [items]);

  return (
    <div className="form-container">
      <h2 className="task-three__title"></h2>

      {/* Поле ввода + добавление */}
      <div className="task-three__controls">
        <input
          className="form-input"
          placeholder="Новая задача…"
          value={text}
          onChange={onChange}
          disabled={loading}
        />
        <button className="form-button btn-blue" onClick={onCreate} disabled={!canCreate}>
          Добавить
        </button>
      </div>

      {/* Состояние загрузки / ошибки */}
      {loading && <div className="task-three__hint">Загрузка…</div>}
      {error && (
        <div className="error-message" style={{ textAlign: "center" }}>
          Ошибка загрузки. <button className="form-button btn-orange" onClick={() => window.location.reload()}>Обновить</button>
        </div>
      )}

      {/* Список */}
      <div className="task-three__list">
        {items.map((t) => (
          <div
            key={t.id}
            className={`task-three__item ${t.done ? "is-done" : ""} ${t._optimistic ? "is-ghost" : ""}`}
          >
            <label className="task-three__row">
              <input type="checkbox" checked={!!t.done} onChange={() => onToggle(t.id)} />
              <span className="task-three__title">{t.title}</span>
            </label>

            <button
              className="task-three__remove"
              onClick={(e) => onRemove(t.id, e)}
              title="Удалить"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && !loading && !error && (
          <div className="task-three__empty">Пока нет задач</div>
        )}
      </div>

      {/* Статистика */}
      <div className="task-three__stats">
        Всего: {stats.total} • Готово: {stats.done} • Осталось: {stats.left}
      </div>
    </div>
  );
}
