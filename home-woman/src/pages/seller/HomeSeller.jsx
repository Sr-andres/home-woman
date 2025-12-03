import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import "../seller/HomeSeller.css";

const icon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// ✅ Mover LocationPicker fuera del componente
function LocationPicker({ onLocationSelect, canAddMore }) {
  useMapEvents({
    click(e) {
      if (!canAddMore) {
        alert("Solo puedes tener 2 puntos. Elimina uno para agregar otro.");
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

  // ✅ Hooks antes de cualquier return
  useEffect(() => {
    if (!user?.uid) return;

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
        alert("Error al cargar los puntos");
      } finally {
        setIsLoading(false);
      }
    };

    loadMyPoints();
  }, [user]);

  const savePoint = async () => {
    if (!selectedPos) return alert("Selecciona una ubicación en el mapa.");
    if (!user?.uid) return alert("No hay usuario autenticado");

    try {
      setIsLoading(true);
      await addDoc(collection(db, "points"), {
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        owner: user.uid,
        title: "Punto del vendedor",
        description: "Editable luego"
      });

      // ✅ Actualizar estado en lugar de recargar
      const newPoint = {
        id: Date.now().toString(), // temporal
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        owner: user.uid,
        title: "Punto del vendedor",
        description: "Editable luego"
      };
      
      setMyPoints([...myPoints, newPoint]);
      setSelectedPos(null);
      alert("Punto guardado!");
    } catch (error) {
      console.error("Error guardando punto:", error);
      alert("Error al guardar el punto");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePoint = async (id) => {
    if (!window.confirm("¿Eliminar este punto?")) return;

    try {
      setIsLoading(true);
      await deleteDoc(doc(db, "points", id));
      
      // ✅ Actualizar estado en lugar de recargar
      setMyPoints(myPoints.filter(p => p.id !== id));
      alert("Punto eliminado");
    } catch (error) {
      console.error("Error eliminando punto:", error);
      alert("Error al eliminar el punto");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Returns condicionales al final
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
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 15,
            background: "white",
            padding: "10px",
            zIndex: 1000,
            borderRadius: "5px"
          }}
        >
          <p>Puntos subidos: {myPoints.length} / 2</p>

          {selectedPos && (
            <button
              onClick={savePoint}
              disabled={isLoading}
              style={{ background: "green", color: "#fff", padding: "5px 10px" }}
            >
              {isLoading ? "Guardando..." : "Guardar ubicación"}
            </button>
          )}
        </div>

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

          {myPoints.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>
                <b>{p.title}</b>
                <br />
                {p.description}
                <br />
                <br />
                <button
                  style={{ background: "red", color: "white" }}
                  onClick={() => deletePoint(p.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Eliminar"}
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="div3">[x]</div>
    </div>
  );
}