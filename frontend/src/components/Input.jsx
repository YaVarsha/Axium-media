import { useState } from "react";

function Input({
  error,
  id,
  label,
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`reference-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="reference-input-wrap">
        <input
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          id={id}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m3 3 18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a18.1 18.1 0 0 1-3.3 4.3" />
                <path d="M6.6 6.6C3.9 8.4 2 12 2 12s3 8 10 8a9.8 9.8 0 0 0 3.4-.6" />
              </svg>
            ) : (
              <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
