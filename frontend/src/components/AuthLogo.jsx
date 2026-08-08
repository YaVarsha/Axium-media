import { Link } from "react-router-dom";

function AuthLogo() {
  return (
    <Link aria-label="Axium" className="auth-logo" to="/">
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .5C10.2.5 9 1.8 9 3.3c0 1.2.8 2.2 2 2.5V7h2V5.8c1.2-.3 2-1.3 2-2.5C15 1.8 13.8.5 12 .5Zm0 1.5c.7 0 1.2.6 1.2 1.3S12.7 4.5 12 4.5s-1.2-.5-1.2-1.2S11.3 2 12 2Z" />
        <circle cx="12" cy="8.5" r="2" />
        <path d="M10.2 10 2 23.5h2.5l6.7-12ZM13.8 10l8.2 13.5h-2.5l-6.7-12Z" />
        <rect height="1.8" rx=".9" width="12" x="6" y="15.5" />
        <circle cx="20.8" cy="23" r="1.5" />
      </svg>
      <span>Axium</span>
    </Link>
  );
}

export default AuthLogo;
