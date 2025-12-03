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
import { getCategoryById, getCategoryIcon, CATEGORIES } from "../../utils/categories"; // 🆕 Importar categorías

export default function HomeCustomer() {
  const [points, setPoints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all"); // 🆕 Filtro de categoría
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

  // 🆕 Filtrar puntos por categoría
  const filteredPoints = selectedCategory === "all" 
    ? points 
    : points.filter(p => p.category === selectedCategory);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Navbar role="customer" />

      <div style={{ padding: "20px", background: "#f8f9fa" }}>
        <h1 style={{ margin: "0 0 10px 0" }}>🛒 Marketplace - Puntos Disponibles</h1>
        <p style={{ margin: "0 0 20px 0" }}>Explora los negocios en el mapa</p>

        {/* 🆕 Filtro de categorías */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          flexWrap: "wrap",
          marginBottom: "10px"
        }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "8px 16px",
              border: selectedCategory === "all" ? "2px solid #007bff" : "1px solid #ccc",
              background: selectedCategory === "all" ? "#007bff" : "white",
              color: selectedCategory === "all" ? "white" : "#333",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: selectedCategory === "all" ? "bold" : "normal"
            }}
          >
            🌐 Todas ({points.length})
          </button>

          {CATEGORIES.map(cat => {
            const count = points.filter(p => p.category === cat.id).length;
            if (count === 0) return null; // No mostrar si no hay puntos

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  border: selectedCategory === cat.id ? `2px solid ${cat.color}` : "1px solid #ccc",
                  background: selectedCategory === cat.id ? cat.color : "white",
                  color: "#333",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: selectedCategory === cat.id ? "bold" : "normal"
                }}
              >
                {cat.icon} {cat.name} ({count})
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: "14px", color: "#666" }}>
          Mostrando <strong>{filteredPoints.length}</strong> punto(s)
        </p>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[6.2442, -75.5812]}
        zoom={13}
        style={{ width: "100%", height: "calc(100vh - 250px)" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Mostrar puntos filtrados */}
        {filteredPoints.map(p => {
          const categoryData = getCategoryById(p.category || "other");
          const icon = L.icon(getCategoryIcon(p.category || "other"));

          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup maxWidth={300}>
                <div style={{ minWidth: "250px" }}>
                  {/* 🆕 Mostrar imagen si existe */}
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        border: "2px solid " + categoryData.color
                      }}
                    />
                  )}

                  {/* Badge de categoría */}
                  <div style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: categoryData.color,
                    color: "#333",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "10px"
                  }}>
                    {categoryData.icon} {categoryData.name}
                  </div>

                  <h3 style={{ margin: "0 0 10px 0" }}>{p.title}</h3>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
                    {p.description}
                  </p>

                  {/* Mostrar teléfono si existe */}
                  {p.phone && (
                    <div style={{ 
                      margin: "10px 0", 
                      padding: "10px",
                      background: "#f0f8ff",
                      borderRadius: "5px"
                    }}>
                      <p style={{ margin: "0", fontSize: "14px", color: "#28a745" }}>
                        📞 <strong>{p.phone}</strong>
                      </p>
                      {/* 🆕 Botón de WhatsApp */}
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          padding: "6px 12px",
                          background: "#25D366",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "5px",
                          fontSize: "13px",
                          fontWeight: "bold"
                        }}
                      >
                        💬 Contactar por WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Mostrar ubicación */}
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#999", 
                    margin: "10px 0 0 0",
                    borderTop: "1px solid #eee",
                    paddingTop: "8px"
                  }}>
                    📍 {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}