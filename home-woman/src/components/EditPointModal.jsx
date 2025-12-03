import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { CATEGORIES } from "../utils/categories";
import ImageUploader from "./ImageUploader"; // 🆕 Importar ImageUploader

export default function EditPointModal({ point, onClose, onUpdate }) {
  // Estados para los campos editables
  const [title, setTitle] = useState(point.title);
  const [description, setDescription] = useState(point.description);
  const [phone, setPhone] = useState(point.phone || "");
  const [category, setCategory] = useState(point.category || "other");
  const [imageUrl, setImageUrl] = useState(point.imageUrl || null); // 🆕 URL de la imagen
  const [loading, setLoading] = useState(false);

  // Función para guardar los cambios
  const handleSave = async () => {
    if (!title.trim()) {
      alert("El título no puede estar vacío");
      return;
    }

    try {
      setLoading(true);

      // Actualizar en Firestore
      const pointRef = doc(db, "points", point.id);
      await updateDoc(pointRef, {
        title: title.trim(),
        description: description.trim(),
        phone: phone.trim(),
        category: category,
        imageUrl: imageUrl, // 🆕 Guardar URL de imagen
        updatedAt: new Date()
      });

      alert("✅ Punto actualizado correctamente");
      
      // Notificar al componente padre que hubo cambios
      onUpdate();
      
      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ Error al actualizar el punto");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fondo oscuro del modal
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      overflow: "auto", // 🆕 Permitir scroll en el fondo
      padding: "20px 0" // 🆕 Espacio arriba y abajo
    }}>
      {/* Contenedor del modal */}
      <div style={{
        background: "white",
        padding: "20px", // 🆕 Reducido de 30px a 20px
        borderRadius: "10px",
        maxWidth: "500px",
        width: "90%",
        color: "#333",
        maxHeight: "90vh",
        overflowY: "auto",
        margin: "auto"
      }}>
        <h2 style={{ marginTop: 0 }}>✏️ Editar Punto</h2>

        {/* 🆕 Uploader de imagen */}
        <ImageUploader
          currentImageUrl={imageUrl}
          onImageUploaded={setImageUrl}
          pointId={point.id}
        />

        {/* Campo de Título */}
        <div style={{ marginBottom: "15px" }}> {/* 🆕 Reducido de 20px a 15px */}
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Título:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Mi Restaurante"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px"
            }}
          />
        </div>

        {/* 🆕 Campo de Categoría */}
        <div style={{ marginBottom: "15px" }}> {/* 🆕 Reducido */}
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Categoría:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campo de Descripción */}
        <div style={{ marginBottom: "15px" }}> {/* 🆕 Reducido */}
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Descripción:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Comida típica colombiana"
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "vertical"
            }}
          />
        </div>

        {/* 🆕 Campo de Teléfono */}
        <div style={{ marginBottom: "15px" }}> {/* 🆕 Reducido */}
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Teléfono/WhatsApp:
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: +57 300 123 4567"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px"
            }}
          />
        </div>

        {/* Mostrar coordenadas (solo lectura) */}
        <div style={{ 
          marginBottom: "15px", /* 🆕 Reducido */
          padding: "10px", 
          background: "#f0f0f0", 
          borderRadius: "5px",
          fontSize: "14px"
        }}>
          <strong>📍 Ubicación:</strong><br />
          Latitud: {point.lat.toFixed(6)}<br />
          Longitud: {point.lng.toFixed(6)}
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Guardando..." : "💾 Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}