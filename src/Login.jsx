
import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // This is a frontend-only demo login.
    // Connect this to your backend authentication API
    // before using it for real accounts.
    if (onLogin) {
      onLogin({ email: email.trim(), password });
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span className="login-brand-icon">S</span>
          <span>StudyFlow</span>
        </div>

        <div className="login-visual-content">
          <span className="login-tag">YOUR STUDY SPACE</span>
          <h1>Make every study session count.</h1>
          <p>
            Organize your assignments, plan your academic journey,
            and build a routine that helps you achieve more.
          </p>

          <div className="login-benefits">
            <div>
              <span className="benefit-check">✓</span>
              <span>Manage assignments and deadlines</span>
            </div>
            <div>
              <span className="benefit-check">✓</span>
              <span>Plan your academic calendar</span>
            </div>
            <div>
              <span className="benefit-check">✓</span>
              <span>Track your study time and goals</span>
            </div>
          </div>
        </div>

        <p className="login-visual-footer">
          A little progress every day adds up.
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <span className="login-brand-icon">S</span>
            <span>StudyFlow</span>
          </div>

          <div className="login-heading">
            <span className="login-welcome">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue to StudyFlow.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="login-submit" type="submit">
              Sign in <span>→</span>
            </button>
          </form>

          <div className="login-divider">
            <span>YOUR PRODUCTIVITY STARTS HERE</span>
          </div>

          <p className="login-signup">
            Don't have an account?{" "}
            <button type="button" onClick={onShowSignup}>
              Create account
            </button>
          </p>

          <p className="login-privacy">
            By continuing, you agree to use StudyFlow responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
