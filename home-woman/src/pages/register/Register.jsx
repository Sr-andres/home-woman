import { useState } from "react";
import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // Guardar información en Firestore
      await setDoc(doc(db, "users", uid), {
        email: email,
        role: role,
        createdAt: new Date(),
      });

      alert("Usuario registrado correctamente");
      navigate("/");
    } catch (err) {
      alert("Error al registrar: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Registro</h2>

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

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Cliente</option>
        <option value="seller">Vendedor</option>
      </select>

      <button onClick={handleRegister} style={{ display: "block", marginTop: "20px" }}>
        Registrarse
      </button>
    </div>
  );
}
