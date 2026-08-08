import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLogo from "../components/AuthLogo";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    try {
      await forgotPassword({ username: email.trim() });
      navigate("/confirm-reset-password", { state: { username: email.trim() } });
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Unable to send verification code.");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Forgot your password">
        <AuthLogo />
        <div className="auth-header">
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-description">Enter your email and we&apos;ll send you a verification code to reset it.</p>
        </div>
        <form className="reference-form" noValidate onSubmit={submit}>
          <Input autoComplete="email" error={error} id="email" label="Email address" name="email" onChange={(event) => { setEmail(event.target.value); setError(""); setFormError(""); }} placeholder="you@company.com" type="email" value={email} />
          {formError && <p className="form-error">{formError}</p>}
          <Button loading={loading} type="submit">Send verification code</Button>
        </form>
        <p className="auth-footer">Remember your password? <Link to="/">Sign in</Link></p>
      </section>
    </main>
  );
}

export default ForgotPassword;
