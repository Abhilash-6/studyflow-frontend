
import { useState } from "react";
import "./Signup.css";

function Signup({ onSignup, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (onSignup) {
      onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-visual">
        <div className="signup-brand">
          <span className="signup-brand-icon">S</span>
          <span>StudyFlow</span>
        </div>

        <div className="signup-visual-content">
          <span className="signup-tag">START YOUR JOURNEY</span>
          <h1>Build better habits. Achieve more.</h1>
          <p>
            Bring your assignments, academic plans, and study sessions
            together in one simple workspace.
          </p>

          <div className="signup-benefits">
            <div>
              <span className="signup-benefit-check">✓</span>
              <span>Keep all your tasks organized</span>
            </div>
            <div>
              <span className="signup-benefit-check">✓</span>
              <span>Stay ahead of important deadlines</span>
            </div>
            <div>
              <span className="signup-benefit-check">✓</span>
              <span>Build a consistent study routine</span>
            </div>
          </div>
        </div>

        <p className="signup-visual-footer">
          Your goals deserve a plan.
        </p>
      </section>

      <section className="signup-form-section">
        <div className="signup-form-container">
          <div className="signup-mobile-brand">
            <span className="signup-brand-icon">S</span>
            <span>StudyFlow</span>
          </div>

          <div className="signup-heading">
            <span className="signup-welcome">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Join StudyFlow and organize your academic life.</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {error && (
              <div className="signup-error" role="alert">
                {error}
              </div>
            )}

            <div className="signup-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Password</label>
              <div className="signup-password-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="signup-show-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <div className="signup-password-wrapper">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="signup-show-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="signup-submit" type="submit">
              Create account <span>→</span>
            </button>
          </form>

          <div className="signup-divider">
            <span>YOUR PRODUCTIVITY STARTS HERE</span>
          </div>

          <p className="signup-login">
            Already have an account?{" "}
            <button type="button" onClick={onShowLogin}>
              Sign in
            </button>
          </p>

          <p className="signup-privacy">
            Your next step toward a more organized study routine starts here.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
