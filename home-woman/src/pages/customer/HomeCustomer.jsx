import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

// icono custom (porque Leaflet por defecto no carga bien en React)
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // 🔥 puedes cambiarlo luego
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});


export default function HomeCustomer() {
  const [points, setPoints] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const fetchPoints = async () => {
      const ref = collection(db, "points");
      const data = await getDocs(ref);

      const formatted = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPoints(formatted);
    };

    fetchPoints();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>

      {/* Botón cerrar sesión */}
     

    <div>
      <Navbar role="customer" />

      <h1>🛒 Productos disponibles</h1>
      <p>Aquí mostraremos los productos del marketplace.</p>
    </div>


      {/* Mapa */}
      <MapContainer
        center={[6.2442, -75.5812]} // Medellín por ahora — lo puedes cambiar
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Mostrar puntos */}
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={customIcon}>
            <Popup>
              <h4>{p.title}</h4>
              <p>{p.description}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
