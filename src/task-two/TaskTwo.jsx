import React, { useCallback, useMemo, useState } from "react";
import "./TaskTwo.css";

/** Рендер-счётчик (через ref, не триггерит перерисовку) */
function useRenderCount(label) {
  const ref = React.useRef(0);
  ref.current += 1;
  return `${label}: render #${ref.current}`;
}

/** Эмуляция «тяжёлого» вычисления — демонстрация пользы useMemo */
function heavyCalc(x) {
  let s = 0;
  for (let i = 0; i < 1_500_000; i++) s = (s + i) % 9973;
  return x ? `${x} • calc=${s}` : "";
}

/** Поля и управляющие кнопки — мемо-блок */
const Controls = React.memo(function Controls({ value, onChange, onClear, onRerenderParent }) {
  const info = useRenderCount("Controls");
  return (
    <div className="t2-controls">
      {/* Поле ввода — САМЫЙ ВЕРХ */}
      <input
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder="Введите текст…"
      />

      {/* Кнопки: зелёная + оранжевая */}
      <div className="t2-actions">
        <button className="form-button btn-green" type="button" onClick={onRerenderParent}>
          Перерендерить родителя
        </button>

        <button className="form-button btn-orange" type="button" onClick={onClear}>
          Очистить значения
        </button>
      </div>

      <div className="t2-hint">{info}</div>
    </div>
  );
});

/** Карточка с результатом — мемо-блок */
const Display = React.memo(function Display({ value }) {
  const info = useRenderCount("Display");
  return (
    <div className="t2-card">
      <div className="t2-card__title">Введённое значение</div>
      <div className="t2-badge">{value || "—"}</div>
      <div className="t2-hint">{info}</div>
    </div>
  );
});

/** Внутренний компонент с локальным состоянием; родительский ремоунт = «перезагрузка страницы» */
function TaskTwoInner({ onFullReset }) {
  const [value, setValue] = useState("");
  const [tick, setTick] = useState(0); // состояние только у родителя

  // стабильные обработчики — мемо-дети не получают новые ссылки без нужды
  const handleChange = useCallback((e) => setValue(e.target.value), []);
  const handleClear = useCallback(() => setValue(""), []);
  const handleRerenderParent = useCallback(() => setTick((x) => x + 1), []);

  // кэшируем «дорогой» расчёт
  const computed = useMemo(() => heavyCalc(value), [value]);

  const parentInfo = useRenderCount("TaskTwo");

  return (
    <div className="form-container">
      <h2 className="task-one__title">Второе задание</h2>

      <Controls
        value={value}
        onChange={handleChange}
        onClear={handleClear}
        onRerenderParent={handleRerenderParent}
      />

      {/* Отдельная панель вывода */}
      <Display value={computed} />

      {/* Нижняя синяя кнопка — ПОЛНАЯ «перезагрузка» через ремоунт */}
      <div className="t2-bottom">
        <button className="form-button btn-blue" type="button" onClick={onFullReset}>
          Перезагрузить страницу
        </button>
      </div>

      <div className="t2-hint t2-center">{parentInfo} (tick={tick})</div>
    </div>
  );
}

/** Внешняя обёртка: смена key => ремоунт всего TaskTwoInner (сброс всего состояния и ref) */
export default function TaskTwo() {
  const [rootKey, setRootKey] = useState(0);
  const fullReset = useCallback(() => setRootKey((k) => k + 1), []);
  return <TaskTwoInner key={rootKey} onFullReset={fullReset} />;
}
