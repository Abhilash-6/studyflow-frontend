
import { useEffect, useMemo, useState } from "react";
import "./AcademicPlanner.css";

const API = "http://localhost:8080/api/tasks";

const TASK_TYPES = ["Assignment", "Lab Work", "Project", "Exam", "Study"];

const EMPTY_FORM = {
  title: "",
  subject: "",
  dueDate: "",
  priority: "Medium",
  taskType: "Assignment",
  status: "Pending",
};

const pad = (n) => String(n).padStart(2, "0");

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function AcademicPlanner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [form, setForm] = useState(EMPTY_FORM);

  async function loadTasks() {
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load tasks from the backend.");
      }

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function updateField(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function addTask(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save the task.");
      }

      const created = await response.json();

      setTasks((previous) => [...previous, created]);

      if (form.dueDate) {
        setSelectedDate(form.dueDate);
        const date = new Date(`${form.dueDate}T12:00:00`);
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
      }

      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Could not save the task.");
    }
  }

  async function toggleTask(task) {
    setError("");

    const updated = {
      ...task,
      status: task.status === "Completed" ? "Pending" : "Completed",
    };

    try {
      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error("Could not update the task.");
      }

      const saved = await response.json();

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? saved : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update the task.");
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task permanently?")) return;

    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the task.");
      }

      setTasks((previous) => previous.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete the task.");
    }
  }

  const today = dateKey(new Date());

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pending = tasks.filter(
    (task) => task.status !== "Completed"
  ).length;

  const overdue = tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < today &&
      task.status !== "Completed"
  ).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        `${task.title || ""} ${task.subject || ""} ${
          task.taskType || ""
        }`
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        (filter === "Upcoming"
          ? task.dueDate >= today && task.status !== "Completed"
          : filter === "Overdue"
          ? task.dueDate < today && task.dueDate && task.status !== "Completed"
          : filter === "Completed"
          ? task.status === "Completed"
          : filter === "Pending"
          ? task.status !== "Completed"
          : task.taskType === filter);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter, today]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Monday is the first day of the week.
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewDate]);

  const selectedDateTasks = tasks.filter(
    (task) => task.dueDate === selectedDate
  );

  const upcomingTasks = [...tasks]
    .filter(
      (task) =>
        task.dueDate &&
        task.dueDate >= today &&
        task.status !== "Completed"
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  function changeMonth(amount) {
    setViewDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );
  }

  function selectCalendarDate(date) {
    setSelectedDate(dateKey(date));
  }

  return (
    <main className="planner">
      <header className="planner-header">
        <div>
          <p className="planner-eyebrow">STUDYFLOW / ACADEMICS</p>
          <h1>Academic Planner</h1>
          <p className="planner-subtitle">
            Organize assignments, exams, projects and study goals.
          </p>
        </div>

        <button
          type="button"
          className="planner-refresh"
          onClick={loadTasks}
        >
          ↻ Refresh
        </button>
      </header>

      {error && <div className="planner-error">{error}</div>}

      <section className="planner-stats">
        <article className="planner-stat">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
          <small>All academic activities</small>
        </article>

        <article className="planner-stat">
          <span>Pending</span>
          <strong>{pending}</strong>
          <small>Still to complete</small>
        </article>

        <article className="planner-stat">
          <span>Completed</span>
          <strong>{completed}</strong>
          <small>Tasks finished</small>
        </article>

        <article className="planner-stat">
          <span>Overdue</span>
          <strong>{overdue}</strong>
          <small>Past their deadline</small>
        </article>
      </section>

      <section className="planner-progress">
        <div className="planner-progress-heading">
          <div>
            <h2>Academic Progress</h2>
            <p>Your overall task completion</p>
          </div>
          <strong>{progress}%</strong>
        </div>

        <div className="planner-progress-track">
          <div
            className="planner-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Monthly Calendar */}

      <section className="planner-panel planner-calendar-panel">
        <div className="planner-calendar-header">
          <div>
            <h2>Academic Calendar</h2>
            <p className="planner-muted">
              Select a date to see its assignments and deadlines.
            </p>
          </div>

          <div className="planner-calendar-controls">
            <button
              type="button"
              className="planner-calendar-nav"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>

            <strong>{monthLabel(viewDate)}</strong>

            <button
              type="button"
              className="planner-calendar-nav"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="planner-calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day) => (
              <div className="planner-calendar-weekday" key={day}>
                {day}
              </div>
            )
          )}

          {calendarCells.map((date, index) => {
            if (!date) {
              return (
                <div
                  className="planner-calendar-cell empty"
                  key={`empty-${index}`}
                />
              );
            }

            const key = dateKey(date);
            const dayTasks = tasks.filter(
              (task) => task.dueDate === key
            );

            const isSelected = selectedDate === key;
            const isToday = today === key;

            return (
              <button
                type="button"
                key={key}
                className={[
                  "planner-calendar-cell",
                  isSelected ? "selected" : "",
                  isToday ? "today" : "",
                  dayTasks.length ? "has-tasks" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectCalendarDate(date)}
                aria-label={`${key}, ${dayTasks.length} tasks`}
                aria-pressed={isSelected}
              >
                <span className="planner-calendar-day">
                  {date.getDate()}
                </span>

                {dayTasks.length > 0 && (
                  <span className="planner-calendar-dots">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`planner-calendar-dot ${
                          task.status === "Completed" ? "completed" : ""
                        }`}
                      />
                    ))}
                  </span>
                )}

                {dayTasks.length > 0 && (
                  <span className="planner-calendar-count">
                    {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="planner-selected-date">
          <h3>
            Tasks for{" "}
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </h3>

          {selectedDateTasks.length === 0 ? (
            <p className="planner-empty">
              No tasks due on this date.
            </p>
          ) : (
            <div className="planner-task-list">
              {selectedDateTasks.map((task) => (
                <article className="planner-task" key={task.id}>
                  <button
                    type="button"
                    className={`planner-check ${
                      task.status === "Completed" ? "is-complete" : ""
                    }`}
                    onClick={() => toggleTask(task)}
                    aria-label="Toggle task completion"
                  >
                    {task.status === "Completed" ? "✓" : ""}
                  </button>

                  <div className="planner-task-info">
                    <h3
                      className={
                        task.status === "Completed" ? "is-done" : ""
                      }
                    >
                      {task.title}
                    </h3>
                    <p>
                      {task.subject} · {task.taskType || "Assignment"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="planner-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Task and Task List */}

      <div className="planner-columns">
        <section className="planner-panel">
          <h2>Add Academic Task</h2>
          <p className="planner-muted">
            Keep your next deadline organized.
          </p>

          <form onSubmit={addTask} className="planner-form">
            <label>
              Task title
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Java assignment"
                maxLength={150}
                required
              />
            </label>

            <label>
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={updateField}
                placeholder="e.g. Java"
                required
              />
            </label>

            <label>
              Task type
              <select
                name="taskType"
                value={form.taskType}
                onChange={updateField}
              >
                {TASK_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Due date
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={updateField}
              />
            </label>

            <label>
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={updateField}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <button className="planner-add-button" type="submit">
              + Add Task
            </button>
          </form>
        </section>

        <section className="planner-panel planner-task-panel">
          <div className="planner-task-heading">
            <div>
              <h2>Your Tasks</h2>
              <p className="planner-muted">
                Track and manage your academic work.
              </p>
            </div>
          </div>

          <input
            className="planner-search"
            placeholder="Search tasks or subjects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="planner-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Upcoming</option>
            <option>Overdue</option>
            {TASK_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          {loading ? (
            <p className="planner-empty">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="planner-empty">
              No tasks found. Add your first academic task!
            </p>
          ) : (
            <div className="planner-task-list">
              {filteredTasks.map((task) => (
                <article className="planner-task" key={task.id}>
                  <button
                    type="button"
                    className={`planner-check ${
                      task.status === "Completed" ? "is-complete" : ""
                    }`}
                    onClick={() => toggleTask(task)}
                    aria-label="Toggle task completion"
                  >
                    {task.status === "Completed" ? "✓" : ""}
                  </button>

                  <div className="planner-task-info">
                    <h3
                      className={
                        task.status === "Completed" ? "is-done" : ""
                      }
                    >
                      {task.title}
                    </h3>

                    <p>
                      {task.subject} · {task.taskType || "Assignment"}
                    </p>

                    <div className="planner-task-meta">
                      <span
                        className={`priority-${(
                          task.priority || "Medium"
                        ).toLowerCase()}`}
                      >
                        {task.priority || "Medium"} priority
                      </span>

                      <span>
                        {task.dueDate
                          ? `Due ${task.dueDate}`
                          : "No deadline"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="planner-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Upcoming deadlines */}

      <section className="planner-panel planner-upcoming">
        <h2>Upcoming Deadlines</h2>
        <p className="planner-muted">
          Your next five pending tasks with deadlines.
        </p>

        {upcomingTasks.length === 0 ? (
          <p className="planner-empty">
            No upcoming deadlines. You're all caught up!
          </p>
        ) : (
          <div className="planner-task-list">
            {upcomingTasks.map((task) => (
              <article className="planner-task" key={task.id}>
                <div className="planner-task-info">
                  <h3>{task.title}</h3>
                  <p>
                    {task.subject} · {task.taskType || "Assignment"}
                  </p>
                </div>

                <span className="planner-deadline">
                  {task.dueDate}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AcademicPlanner;
