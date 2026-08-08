function Button({
  children,
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  ...props
}) {
  return (
    <button
      className={`button ${className}`}
      type={type}
      {...props}
      aria-busy={loading || undefined}
      disabled={loading || disabled}
    >
      {children}
    </button>
  );
}

export default Button;
