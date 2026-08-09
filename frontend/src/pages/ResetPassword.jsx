import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLogo from "../components/AuthLogo";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

function getFirstLoginChallenge(locationState) {
  if (locationState?.session) {
    return locationState;
  }

  try {
    const saved = sessionStorage.getItem("newPasswordChallenge");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const challenge = getFirstLoginChallenge(location.state);
  const isFirstLogin = Boolean(challenge?.session);

  const { loading, setPassword, resetPassword } = useAuth();

  const [form, setForm] = useState({
    email: challenge?.email || location.state?.username || "",
    code: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

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

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!isFirstLogin) {
      if (!form.email.trim()) {
        nextErrors.email = "Email address is required";
      }

      if (!form.code.trim()) {
        nextErrors.code = "Verification code is required";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      if (isFirstLogin) {
        // Temp-password / NEW_PASSWORD_REQUIRED flow
        await setPassword({
          username: challenge.username,
          session: challenge.session,
          newPassword: form.password
        });

        sessionStorage.removeItem("newPasswordChallenge");

        navigate("/login", {
          replace: true,
          state: {
            email: challenge.email
          }
        });

        return;
      }

      // Normal Forgot Password flow
      await resetPassword({
        username: form.email.trim(),
        code: form.code.trim(),
        password: form.password
      });

      navigate("/login", {
        replace: true,
        state: {
          email: form.email.trim()
        }
      });

    } catch (error) {
      setFormError(
        error.response?.data?.message ||
        "Unable to reset password."
      );
    }
  };

  return (
    <main className="auth-page">
      <section
        className="auth-shell"
        aria-label="Reset your password"
      >
        <AuthLogo />

        <div className="auth-header">
          <h1 className="auth-title">
            Reset your password
          </h1>

          <p className="auth-description">
            {isFirstLogin
              ? "Create a new password for your account."
              : "Enter your verification code and create a new password."}
          </p>
        </div>

        <form
          className="reference-form"
          onSubmit={submit}
        >
          {!isFirstLogin && (
            <>
              <Input
                autoComplete="email"
                error={errors.email}
                id="email"
                label="Email address"
                name="email"
                onChange={change}
                placeholder="you@company.com"
                required
                type="email"
                value={form.email}
              />

              <Input
                autoComplete="one-time-code"
                error={errors.code}
                id="code"
                label="Verification code"
                name="code"
                onChange={change}
                placeholder="Enter verification code"
                required
                value={form.code}
              />
            </>
          )}

          <Input
            autoComplete="new-password"
            error={errors.password}
            id="password"
            label="New password"
            name="password"
            onChange={change}
            required
            placeholder="••••••••"
            type="password"
            value={form.password}
          />

          <Input
            autoComplete="new-password"
            error={errors.confirmPassword}
            id="confirmPassword"
            label="Confirm password"
            name="confirmPassword"
            onChange={change}
            required
            placeholder="••••••••"
            type="password"
            value={form.confirmPassword}
          />

          {formError && (
            <p className="form-error">
              {formError}
            </p>
          )}

          <Button
            loading={loading}
            type="submit"
          >
            Reset password
          </Button>
        </form>

        <p className="auth-footer">
          Remember your password?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
