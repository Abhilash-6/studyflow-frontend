
import { useEffect, useState } from "react";
import { taskService } from "./services/taskService";
import "./TaskManager.css";

const emptyTask = {
  title: "",
  subject: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setError("");
      const data = await taskService.getAll();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyTask);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.subject.trim()) {
      setError("Please enter both a task title and subject.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const task = {
        ...form,
        title: form.title.trim(),
        subject: form.subject.trim(),
      };

      if (editingId !== null) {
        await taskService.update(editingId, task);
      } else {
        await taskService.create(task);
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not save the task.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      subject: task.subject || "",
      dueDate: task.dueDate || task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggle(task) {
    const updatedTask = {
      title: task.title,
      subject: task.subject,
      dueDate: task.dueDate || task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status === "Completed" ? "Pending" : "Completed",
    };

    try {
      setError("");
      await taskService.update(task.id, updatedTask);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not update task status.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");
      await taskService.delete(id);
      if (editingId === id) resetForm();
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not delete the task.");
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Pending") return task.status !== "Completed";
    return task.status === "Completed";
  });

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingCount = tasks.length - completedCount;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = tasks.filter((task) => {
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate || task.status === "Completed") return false;

    const date = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date < today;
  }).length;

  function formatDate(value) {
    if (!value) return "No due date";

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isOverdue(task) {
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate || task.status === "Completed") return false;

    const date = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date < today;
  }

  return (
    <main className="tm-page">
      <header className="tm-header">
        <p className="tm-eyebrow">STUDYFLOW / PRODUCTIVITY</p>
        <h1>Task Manager</h1>
        <p>Organize your assignments, track deadlines, and stay on top of your studies.</p>
      </header>

      {error && (
        <div className="tm-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <section className="tm-stats">
        <article className="tm-stat-card">
          <div className="tm-stat-icon purple">▤</div>
          <p>Total tasks</p>
          <strong>{tasks.length}</strong>
          <span>All your study tasks</span>
        </article>

        <article className="tm-stat-card">
          <div className="tm-stat-icon orange">◷</div>
          <p>Pending tasks</p>
          <strong>{pendingCount}</strong>
          <span>Still to be completed</span>
        </article>

        <article className="tm-stat-card">
          <div className="tm-stat-icon green">✓</div>
          <p>Completed</p>
          <strong>{completedCount}</strong>
          <span>Tasks finished</span>
        </article>

        <article className="tm-stat-card">
          <div className="tm-stat-icon red">!</div>
          <p>Overdue</p>
          <strong>{overdueCount}</strong>
          <span>Past their due date</span>
        </article>
      </section>

      <section className="tm-main-grid">
        <article className="tm-panel tm-form-panel">
          <div className="tm-panel-heading">
            <div>
              <h2>{editingId !== null ? "Edit task" : "Create a task"}</h2>
              <p>
                {editingId !== null
                  ? "Update your task details."
                  : "Add a new assignment or study goal."}
              </p>
            </div>
            <span className="tm-heading-icon">＋</span>
          </div>

          <form className="tm-form" onSubmit={handleSubmit}>
            <div className="tm-field">
              <label htmlFor="tm-title">Task title *</label>
              <input
                id="tm-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Complete Java assignment"
                required
              />
            </div>

            <div className="tm-field">
              <label htmlFor="tm-subject">Subject *</label>
              <input
                id="tm-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Java, Mathematics"
                required
              />
            </div>

            <div className="tm-field">
              <label htmlFor="tm-due-date">Due date</label>
              <input
                id="tm-due-date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="tm-form-row">
              <div className="tm-field">
                <label htmlFor="tm-priority">Priority</label>
                <select
                  id="tm-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="tm-field">
                <label htmlFor="tm-status">Status</label>
                <select
                  id="tm-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <button className="tm-primary-btn" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "+ Add task"}
            </button>

            {editingId !== null && (
              <button
                className="tm-secondary-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel editing
              </button>
            )}
          </form>
        </article>

        <article className="tm-panel tm-list-panel">
          <div className="tm-panel-heading tm-list-heading">
            <div>
              <h2>Your tasks</h2>
              <p>Manage your academic workload.</p>
            </div>

            <span className="tm-task-count">{tasks.length} total</span>
          </div>

          <div className="tm-filters" aria-label="Filter tasks">
            {["All", "Pending", "Completed"].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "tm-filter active" : "tm-filter"}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="tm-empty">
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="tm-empty">
              <div className="tm-empty-icon">✓</div>
              <h3>{tasks.length === 0 ? "No tasks yet" : "No matching tasks"}</h3>
              <p>
                {tasks.length === 0
                  ? "Create your first task using the form."
                  : "Choose another filter to see your tasks."}
              </p>
            </div>
          ) : (
            <div className="tm-task-list">
              {filteredTasks.map((task) => (
                <article className="tm-task-item" key={task.id}>
                  <button
                    type="button"
                    className={
                      task.status === "Completed"
                        ? "tm-check completed"
                        : "tm-check"
                    }
                    onClick={() => handleToggle(task)}
                    aria-label={
                      task.status === "Completed"
                        ? "Mark task pending"
                        : "Mark task completed"
                    }
                    title="Toggle completion"
                  >
                    {task.status === "Completed" ? "✓" : ""}
                  </button>

                  <div className="tm-task-details">
                    <h3 className={task.status === "Completed" ? "is-done" : ""}>
                      {task.title}
                    </h3>
                    <p className="tm-task-subject">{task.subject}</p>
                    <div className="tm-task-meta">
                      <span className={isOverdue(task) ? "tm-due overdue" : "tm-due"}>
                        ◷ {formatDate(task.dueDate || task.due_date)}
                      </span>
                      <span className={`tm-priority ${String(task.priority || "Medium").toLowerCase()}`}>
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  </div>

                  <div className="tm-task-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(task)}
                      aria-label={`Edit ${task.title}`}
                      title="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="tm-delete"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete ${task.title}`}
                      title="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <button
            type="button"
            className="tm-refresh-btn"
            onClick={loadTasks}
          >
            ↻ Refresh tasks
          </button>
        </article>
      </section>
    </main>
  );
}

export default TaskManager;
