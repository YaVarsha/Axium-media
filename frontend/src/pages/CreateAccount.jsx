import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLogo from "../components/AuthLogo";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

const messageFor = (error) =>
  error.response?.data?.message || "Unable to create your account. Please try again.";

function CreateAccount() {
  const navigate = useNavigate();
  const { loading, register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: ""
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

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.company.trim()) {
      nextErrors.company = "Company name is required";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      const response = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        phone: form.phone.trim()
      });

      const registeredUser = response.data || {};

      navigate("/login", {
        replace: true,
        state: {
          email: registeredUser.email || form.email.trim(),
          username: registeredUser.username || ""
        }
      });
    } catch (error) {
      setFormError(messageFor(error));
    }
  };

  return (
    <main className="auth-page">
      <section
        className="auth-shell auth-shell-register"
        aria-label="Create your account"
      >
        <AuthLogo />

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>

          <p className="auth-description">
            Get started with Axium. You&apos;ll receive a temporary password by
            email.
          </p>
        </div>

        <form className="reference-form" noValidate onSubmit={submit}>
          <div className="grid-two">
            <Input
              autoComplete="given-name"
              error={errors.firstName}
              id="firstName"
              label="First name"
              name="firstName"
              onChange={change}
              placeholder="Jane"
              value={form.firstName}
            />

            <Input
              autoComplete="family-name"
              error={errors.lastName}
              id="lastName"
              label="Last name"
              name="lastName"
              onChange={change}
              placeholder="Smith"
              value={form.lastName}
            />
          </div>

          <Input
            autoComplete="email"
            error={errors.email}
            id="email"
            label="Work email"
            name="email"
            onChange={change}
            placeholder="you@company.com"
            type="email"
            value={form.email}
          />

          <Input
            autoComplete="organization"
            error={errors.company}
            id="company"
            label="Company name"
            name="company"
            onChange={change}
            placeholder="Acme Corp"
            value={form.company}
          />

          <Input
            autoComplete="tel"
            error={errors.phone}
            id="phone"
            label="Phone number"
            name="phone"
            onChange={change}
            placeholder="+1 (555) 000-0000"
            type="tel"
            value={form.phone}
          />

          {formError && <p className="form-error">{formError}</p>}

          <Button loading={loading} type="submit">
            Create account
          </Button>

          <p className="agreement">
            By creating an account you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default CreateAccount;