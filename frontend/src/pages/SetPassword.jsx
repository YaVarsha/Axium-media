import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLogo from "../components/AuthLogo";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

const readStoredChallenge = () => {
  try {
    return (
      JSON.parse(
        sessionStorage.getItem("newPasswordChallenge") || "null"
      ) || {}
    );
  } catch {
    return {};
  }
};

function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, setPassword } = useAuth();

  /*
   * Prefer router state but fall back to sessionStorage.
   *
   * sessionStorage is useful if the reset-password page refreshes before the
   * challenge is completed.
   */
  const challenge = useMemo(
    () => ({
      ...readStoredChallenge(),
      ...(location.state || {})
    }),
    [location.state]
  );

  const [form, setForm] = useState({
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

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    /*
     * NEW_PASSWORD_REQUIRED must have both the original Cognito username and
     * Cognito Session.
     *
     * This is NOT the Forgot Password confirmation-code flow.
     */
    if (!challenge.username || !challenge.session) {
      setFormError(
        "Your temporary-password session has expired. Please sign in again."
      );

      return;
    }

    try {
      await setPassword({
        username: challenge.username,
        session: challenge.session,
        newPassword: form.password
      });

      sessionStorage.removeItem("newPasswordChallenge");

      /*
       * Preserve the Cognito username when returning to Login.
       *
       * The UI still displays the email. Login can use the internal Cognito
       * username behind the scenes.
       */
      navigate("/login", {
        replace: true,
        state: {
          email: challenge.email || challenge.username,
          username: challenge.username
        }
      });
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Unable to update password."
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Reset your password">
        <AuthLogo />

        <div className="auth-header">
          <h1 className="auth-title">Reset your password</h1>

          <p className="auth-description">
            Create a new password to continue.
          </p>
        </div>

        <form className="reference-form" onSubmit={submit}>
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

          {formError && <p className="form-error">{formError}</p>}

          <Button loading={loading} type="submit">
            Reset password
          </Button>
        </form>

        <p className="auth-footer">
          Back to <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default SetPassword;
