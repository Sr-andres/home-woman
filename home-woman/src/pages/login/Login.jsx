import { useState } from "react";
import { auth, db } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor ingresa correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        alert("No existe información del usuario en Firestore.");
        setLoading(false);
        return;
      }

      const userData = snap.data();

      // 💥 Aquí redirigimos según el rol
      if (userData.role === "customer") {
        navigate("/customer/home");
      } else if (userData.role === "seller") {
        navigate("/seller/home");
      } else {
        alert("Rol no válido.");
      }
    } catch (error) {
      console.log(error);
      alert("Error al iniciar sesión: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Iniciar Sesión</h2>

      <input
        type="email"
        placeholder="Correo"
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Cargando..." : "Ingresar"}
      </button>

      {/* 🔥 Botón para ir al registro */}
      <p style={{ marginTop: "20px" }}>¿No tienes cuenta?</p>
      <button onClick={() => navigate("/register")}>
        Crear una cuenta
      </button>
    </div>
  );
}
