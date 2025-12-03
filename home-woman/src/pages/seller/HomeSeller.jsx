import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import EditPointModal from "../../components/EditPointModal";
import { getCategoryById, getCategoryIcon } from "../../utils/categories"; // 🆕 Importar helpers
import "./HomeSeller.css";

const icon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
// ℹ️ Este ícono ya no se usa directamente, los íconos ahora vienen de las categorías

// Componente para seleccionar ubicación en el mapa
function LocationPicker({ onLocationSelect, canAddMore }) {
  useMapEvents({
    click(e) {
      if (!canAddMore) {
        alert("⚠️ Solo puedes tener 2 puntos. Elimina uno para agregar otro.");
        return;
      }
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function HomeSeller() {
  const { user, loading } = useAuth();
  const [myPoints, setMyPoints] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🆕 Estado para el modal de edición
  const [editingPoint, setEditingPoint] = useState(null);

  // Cargar puntos del vendedor
  useEffect(() => {
    if (!user?.uid) return;
    loadMyPoints();
  }, [user]);

  // 🆕 Función para cargar puntos (reutilizable)
  const loadMyPoints = async () => {
    try {
      setIsLoading(true);
      const ref = collection(db, "points");
      const data = await getDocs(ref);
      const filter = data.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.owner === user.uid);

      setMyPoints(filter);
    } catch (error) {
      console.error("Error cargando puntos:", error);
      alert("❌ Error al cargar los puntos");
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar nuevo punto
  const savePoint = async () => {
    if (!selectedPos) return alert("⚠️ Selecciona una ubicación en el mapa.");
    if (!user?.uid) return alert("⚠️ No hay usuario autenticado");

    try {
      setIsLoading(true);
      await addDoc(collection(db, "points"), {
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        owner: user.uid,
        title: "Nuevo punto",
        description: "Haz clic en 'Editar' para agregar descripción",
        category: "other", // 🆕 Categoría por defecto
        createdAt: new Date()
      });

      // Recargar puntos
      await loadMyPoints();
      setSelectedPos(null);
      alert("✅ Punto guardado! Ahora puedes editarlo.");
    } catch (error) {
      console.error("Error guardando punto:", error);
      alert("❌ Error al guardar el punto");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar punto
  const deletePoint = async (id) => {
    if (!window.confirm("⚠️ ¿Eliminar este punto?")) return;

    try {
      setIsLoading(true);
      await deleteDoc(doc(db, "points", id));
      await loadMyPoints();
      alert("✅ Punto eliminado");
    } catch (error) {
      console.error("Error eliminando punto:", error);
      alert("❌ Error al eliminar el punto");
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Abrir modal de edición
  const openEditModal = (point) => {
    setEditingPoint(point);
  };

  // 🆕 Cerrar modal
  const closeEditModal = () => {
    setEditingPoint(null);
  };

  // 🆕 Actualizar después de editar
  const handleUpdate = () => {
    loadMyPoints();
  };

  // Returns condicionales
  if (loading) return <h2>Cargando usuario...</h2>;
  if (!user) return <h2>No hay sesión activa</h2>;

  return (
    <div className="parent">
      <div className="div1">
        <Navbar role="seller" />
        <h1>📢 Panel del Vendedor</h1>
        <p>Administra tus puntos en el mapa</p>
      </div>

      <div className="div2">
        {/* Panel de información */}
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 15,
            background: "white",
            padding: "15px",
            zIndex: 1000,
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#333" }}>
            📍 Puntos subidos: {myPoints.length} / 2
          </p>

          {selectedPos && (
            <div>
              <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                📌 Ubicación seleccionada:<br />
                {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
              </p>
              <button
                onClick={savePoint}
                disabled={isLoading}
                style={{ 
                  background: "green", 
                  color: "#fff", 
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  width: "100%"
                }}
              >
                {isLoading ? "Guardando..." : "💾 Guardar ubicación"}
              </button>
            </div>
          )}
        </div>

        {/* Mapa */}
        <MapContainer
          center={[6.2442, -75.5812]}
          zoom={13}
          style={{ width: "90%", height: "90%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker 
            onLocationSelect={setSelectedPos}
            canAddMore={myPoints.length < 2}
          />

          {/* Marcadores de puntos */}
          {myPoints.map((p) => {
            // 🆕 Obtener ícono según categoría
            const categoryData = getCategoryById(p.category || "other");
            const icon = L.icon(getCategoryIcon(p.category || "other"));
            
            return (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
                <Popup maxWidth={300}>
                  <div style={{ minWidth: "250px" }}>
                    {/* 🆕 Imagen si existe */}
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "10px"
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
                    <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                      {p.description}
                    </p>
                    
                    {/* Mostrar teléfono si existe */}
                    {p.phone && (
                      <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#28a745" }}>
                        📞 <strong>{p.phone}</strong>
                      </p>
                    )}
                    
                    <div style={{ display: "flex", gap: "5px" }}>
                      {/* Botón Editar */}
                      <button
                        style={{ 
                          background: "#007bff", 
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          flex: 1
                        }}
                        onClick={() => openEditModal(p)}
                        disabled={isLoading}
                      >
                        ✏️ Editar
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        style={{ 
                          background: "red", 
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          flex: 1
                        }}
                        onClick={() => deletePoint(p.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? "..." : "🗑️ Eliminar"}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="div3">[x]</div>

      {/* 🆕 Modal de edición */}
      {editingPoint && (
        <EditPointModal
          point={editingPoint}
          onClose={closeEditModal}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}