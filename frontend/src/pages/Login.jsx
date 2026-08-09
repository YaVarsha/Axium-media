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

      /*
       * If Login is reached after Register/Reset Password,
       * preserve the actual Cognito username returned earlier.
       */
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
       * First login with temporary password.
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
       * Normal successful login with permanent password.
       * Go directly to Dashboard.
       */
      navigate("/dashboard", {
        replace: true
      });
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

        <form className="reference-form" onSubmit={submit}>
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
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label="Password"
            name="password"
            onChange={change}
            required
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
    </main>
  );
}

export default Login;
