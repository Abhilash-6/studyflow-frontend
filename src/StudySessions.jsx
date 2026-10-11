
import { useEffect, useMemo, useState } from "react";
import "./StudySessions.css";

const SESSION_KEY = "studyflow_study_sessions";
const GOAL_KEY = "studyflow_daily_goals";

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(minutes) {
  const value = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

function StudySessions() {
  const [sessions, setSessions] = useState(() =>
    readData(SESSION_KEY, [])
  );

  const [goals, setGoals] = useState(() =>
    readData(GOAL_KEY, {})
  );

  const [selectedDate, setSelectedDate] = useState(localDate);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [goalInput, setGoalInput] = useState("180");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    setGoalInput(String(goals[selectedDate] ?? 180));
    setMessage("");
  }, [selectedDate, goals]);

  const dailySessions = useMemo(
    () => sessions.filter((s) => s.date === selectedDate),
    [sessions, selectedDate]
  );

  const dailyMinutes = dailySessions.reduce(
    (sum, s) => sum + Number(s.duration || 0),
    0
  );

  const dailyGoal = Number(goals[selectedDate] ?? 180);
  const remaining = Math.max(0, dailyGoal - dailyMinutes);

  const progress =
    dailyGoal > 0
      ? Math.min(100, Math.round((dailyMinutes / dailyGoal) * 100))
      : 0;

  const weeklyMinutes = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    const day = date.getDay();
    const offset = day === 0 ? -6 : 1 - day;

    const monday = new Date(date);
    monday.setDate(date.getDate() + offset);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = localDate(monday);
    const end = localDate(sunday);

    return sessions
      .filter((s) => s.date >= start && s.date <= end)
      .reduce((sum, s) => sum + Number(s.duration || 0), 0);
  }, [sessions, selectedDate]);

  function saveGoal(event) {
    event.preventDefault();

    const value = Number(goalInput);

    if (!Number.isFinite(value) || value < 1 || value > 1440) {
      setMessage("Enter a goal between 1 and 1440 minutes.");
      return;
    }

    setGoals((old) => ({
      ...old,
      [selectedDate]: Math.round(value),
    }));

    setMessage("Daily study goal saved in this browser.");
  }

  function addSession(event) {
    event.preventDefault();

    const cleanSubject = subject.trim();
    const mins = Number(duration);

    if (!cleanSubject) {
      setMessage("Please enter a subject.");
      return;
    }

    if (!Number.isFinite(mins) || mins < 1 || mins > 1440) {
      setMessage("Enter a duration between 1 and 1440 minutes.");
      return;
    }

    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subject: cleanSubject,
      duration: Math.round(mins),
      notes: notes.trim(),
      date: selectedDate,
    };

    setSessions((old) => [newSession, ...old]);
    setSubject("");
    setDuration("60");
    setNotes("");
    setMessage("Study session recorded successfully.");
  }

  function deleteSession(id) {
    setSessions((old) => old.filter((s) => s.id !== id));
    setMessage("Study session deleted.");
  }

  return (
    <div className="study-page">
      {/* Heading */}
      <header className="study-header">
        <p className="study-eyebrow">STUDYFLOW / PRODUCTIVITY</p>
        <h1>Study Sessions</h1>
        <p>Build a consistent routine and track your study time.</p>
      </header>

      {/* Date selector */}
      <section className="study-date-panel">
        <label htmlFor="study-date">Select study date</label>
        <input
          id="study-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </section>

      {message && (
        <div className="study-message" role="status">
          {message}
        </div>
      )}

      {/* Statistics */}
      <section className="study-stats">
        <article className="study-card">
          <div className="study-card-icon">⏱️</div>
          <h3>Study time today</h3>
          <h2>{formatTime(dailyMinutes)}</h2>
          <p>
            {dailySessions.length}{" "}
            {dailySessions.length === 1 ? "session" : "sessions"} recorded
          </p>
        </article>

        <article className="study-card">
          <div className="study-card-icon">🎯</div>
          <h3>Daily target</h3>
          <h2>{formatTime(dailyGoal)}</h2>
          <p>
            {remaining > 0
              ? `${formatTime(remaining)} remaining`
              : "Daily goal achieved!"}
          </p>

          <div
            className="study-progress"
            role="progressbar"
            aria-label="Daily study goal progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="study-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}% completed</p>
        </article>

        <article className="study-card">
          <div className="study-card-icon">📅</div>
          <h3>Weekly study time</h3>
          <h2>{formatTime(weeklyMinutes)}</h2>
          <p>Monday to Sunday</p>
        </article>
      </section>

      {/* Daily goal */}
      <section className="study-panel">
        <div className="study-panel-heading">
          <div>
            <span className="study-section-label">YOUR TARGET</span>
            <h2>Daily Study Goal</h2>
            <p>Set a target for the selected date.</p>
          </div>
          <span className="study-percentage">{progress}%</span>
        </div>

        <form className="study-form study-goal-form" onSubmit={saveGoal}>
          <label htmlFor="goal-minutes">
            Target minutes per day
            <input
              id="goal-minutes"
              type="number"
              min="1"
              max="1440"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              required
            />
          </label>
          <button type="submit">Save Daily Goal</button>
        </form>
      </section>

      {/* Session form and history */}
      <div className="study-columns">
        <section className="study-panel">
          <span className="study-section-label">ADD ACTIVITY</span>
          <h2>Record a Study Session</h2>
          <p>Record the time you spent learning or practising.</p>

          <form className="study-form" onSubmit={addSession}>
            <label htmlFor="study-subject">
              Subject
              <input
                id="study-subject"
                type="text"
                placeholder="e.g. Java, DSA, COA"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                required
              />
            </label>

            <label htmlFor="study-duration">
              Duration in minutes
              <input
                id="study-duration"
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </label>

            <label htmlFor="study-notes">
              Notes <span className="study-optional">(optional)</span>
              <textarea
                id="study-notes"
                placeholder="What did you learn today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
              />
            </label>

            <button type="submit">+ Record Study Session</button>
          </form>
        </section>

        <section className="study-panel">
          <span className="study-section-label">YOUR ACTIVITY</span>
          <h2>Recorded Sessions</h2>
          <p className="study-selected-date">{selectedDate}</p>

          {dailySessions.length === 0 ? (
            <div className="study-empty">
              <div className="study-empty-icon">📚</div>
              <h3>No sessions yet</h3>
              <p>
                Record your first study session to track your progress.
              </p>
            </div>
          ) : (
            <div className="study-session-list">
              {dailySessions.map((session) => (
                <article
                  className="study-session-item"
                  key={session.id}
                >
                  <div className="study-session-details">
                    <h3>{session.subject}</h3>
                    <span className="study-duration-badge">
                      {formatTime(Number(session.duration))}
                    </span>
                    {session.notes && <p>{session.notes}</p>}
                  </div>

                  <button
                    className="study-delete-button"
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    aria-label={`Delete ${session.subject} session`}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudySessions;
