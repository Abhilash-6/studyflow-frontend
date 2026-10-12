
import { useState } from "react";
import "./App.css";

import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import TaskManager from "./TaskManager.jsx";
import AcademicPlanner from "./AcademicPlanner.jsx";
import StudySessions from "./StudySessions.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const [activePage, setActivePage] = useState("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "tasks", label: "Task Manager", icon: "▤" },
    { id: "planner", label: "Academic Planner", icon: "▦" },
    { id: "sessions", label: "Study Sessions", icon: "◷" },
  ];

  function handleLogin() {
    setIsLoggedIn(true);
    setActivePage("tasks");
  }

  function handleSignup(details) {
    // Registration is not connected to the backend yet.
    // Do not save or store the password in the browser.
    console.log("Signup form submitted for:", details.email);
    alert(
      "The signup form is ready, but account creation is not connected yet. Please connect the backend before creating real accounts."
    );
    setAuthPage("login");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setAuthPage("login");
    setSidebarOpen(false);
  }

  function navigateTo(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  if (!isLoggedIn) {
    if (authPage === "signup") {
      return (
        <Signup
          onSignup={handleSignup}
          onShowLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onShowSignup={() => setAuthPage("signup")}
      />
    );
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">S</div>
          <div className="brand-text">
            <h2>StudyFlow</h2>
            <p>STUDENT WORKSPACE</p>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                activePage === item.id ? "nav-item-active" : ""
              }`}
              onClick={() => navigateTo(item.id)}
              aria-current={activePage === item.id ? "page" : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.id && (
                <span className="nav-active-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">✦</div>
            <h3>Stay focused</h3>
            <p>Small progress every day leads to big results.</p>
          </div>

          <div className="sidebar-footer">
            <div className="footer-avatar">S</div>
            <div className="footer-user">
              <strong>My Workspace</strong>
              <span>Student account</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>

            <div className="breadcrumb">
              <span>StudyFlow</span>
              <span className="breadcrumb-divider">/</span>
              <strong>
                {navigation.find((item) => item.id === activePage)?.label}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="status-dot" />
            <span className="workspace-status">Workspace</span>
            <div className="topbar-avatar">S</div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="app-content">
          {activePage === "tasks" && <TaskManager />}
          {activePage === "planner" && <AcademicPlanner />}
          {activePage === "sessions" && <StudySessions />}
        </main>

        <footer className="app-footer">
          <span>StudyFlow</span>
          <span>Plan your work. Track your progress.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
