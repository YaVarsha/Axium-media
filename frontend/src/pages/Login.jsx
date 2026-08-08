import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLogo from "../components/AuthLogo";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

const messageFor = (error) =>
  error.response?.data?.message || "Unable to sign in. Please try again.";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, login } = useAuth();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  // Welcome popup
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: ""
    }));

    setFormError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      const email = form.email.trim();
      const stateEmail = location.state?.email?.trim();

      const username =
        location.state?.username &&
        stateEmail &&
        email.toLowerCase() === stateEmail.toLowerCase()
          ? location.state.username
          : email;

      const response = await login({
        username,
        password: form.password
      });

      const authData = response.data || {};

      /*
       * FIRST LOGIN WITH TEMPORARY PASSWORD
       *
       * Do not show welcome popup here.
       * User must first create a permanent password.
       */
      if (authData.challengeName === "NEW_PASSWORD_REQUIRED") {
        const challenge = {
          username: authData.username || username,
          email,
          session: authData.session
        };

        sessionStorage.setItem(
          "newPasswordChallenge",
          JSON.stringify(challenge)
        );

        navigate("/reset-password", {
          replace: true,
          state: challenge
        });

        return;
      }

      /*
       * NORMAL LOGIN SUCCESS
       *
       * This happens after user has set the permanent password.
       */
      setShowWelcomePopup(true);
    } catch (error) {
      setFormError(messageFor(error));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Sign in">
        <AuthLogo />

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>

          <p className="auth-description">
            Sign in to your account to continue
          </p>
        </div>

        <form className="reference-form" noValidate onSubmit={submit}>
          <Input
            autoComplete="email"
            error={errors.email}
            id="email"
            label="Email address"
            name="email"
            onChange={change}
            placeholder="you@company.com"
            type="email"
            value={form.email}
          />

          <Input
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label="Password"
            name="password"
            onChange={change}
            placeholder="••••••••"
            type="password"
            value={form.password}
          />

          <Link className="forgot-link" to="/forgot-password">
            Forgot password?
          </Link>

          {formError && <p className="form-error">{formError}</p>}

          <Button loading={loading} type="submit">
            Sign in
          </Button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </section>

      {/* Welcome popup - shown only after successful normal login */}
      {showWelcomePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)"
            }}
          >
            <h2
              id="welcome-title"
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 600
              }}
            >
              Welcome My Media
            </h2>

            <button
              type="button"
              onClick={() => setShowWelcomePopup(false)}
              style={{
                marginTop: "28px",
                width: "100%",
                minHeight: "46px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 600
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;