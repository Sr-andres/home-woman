import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav style={{
      background: "#313131",
      color: "white",
      padding: "12px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h2>Marketplace</h2>

      {/* MENÚ DISTINTO PARA CADA ROL */}
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/" style={{ color:"white" }}>Inicio</Link>

        {role === "seller" && (
          <Link to="/seller/new-product" style={{ color:"white" }}>
            Publicar Producto
          </Link>
        )}

        <button onClick={handleLogout} style={{ background:"red", color:"white" }}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
