import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleClose = () => {
    logout();

    navigate("/login", {
      replace: true
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#ffffff",
        padding: "32px 40px"
      }}
    >
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 600,
            color: "#252525"
          }}
        >
          Dashboard
        </h1>

        <button
          type="button"
          aria-label="Close dashboard"
          title="Close"
          onClick={handleClose}
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "34px",
            fontWeight: 300,
            lineHeight: 1,
            color: "#252525"
          }}
        >
          ×
        </button>
      </header>
    </main>
  );
}

export default Dashboard;