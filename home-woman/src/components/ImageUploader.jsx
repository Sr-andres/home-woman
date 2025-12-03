import { useState, useRef } from "react";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function ImageUploader({ currentImageUrl, onImageUploaded, pointId }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const fileInputRef = useRef(null);

  // Función para manejar la selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert("⚠️ Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      alert("⚠️ La imagen debe ser menor a 5MB");
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    uploadImage(file);
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImage = async (file) => {
    try {
      setUploading(true);

      // Crear referencia única en Storage
      // Formato: points/pointId/timestamp_nombreArchivo
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `points/${pointId}/${fileName}`);

      // Subir archivo
      await uploadBytes(storageRef, file);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      // Notificar al componente padre
      onImageUploaded(downloadURL);

      alert("✅ Imagen subida correctamente");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("❌ Error al subir la imagen: " + error.message);
      setPreview(currentImageUrl); // Restaurar imagen anterior
    } finally {
      setUploading(false);
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = async () => {
    if (!window.confirm("¿Eliminar la imagen?")) return;

    try {
      setUploading(true);

      // Si hay una imagen actual, eliminarla de Storage
      if (currentImageUrl) {
        try {
          const imageRef = ref(storage, currentImageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.log("No se pudo eliminar la imagen anterior:", error);
          // Continuar de todos modos
        }
      }

      setPreview(null);
      onImageUploaded(null);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("✅ Imagen eliminada");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("❌ Error al eliminar la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
        📷 Imagen del negocio:
      </label>

      {/* Vista previa de la imagen */}
      {preview ? (
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #ddd"
            }}
          />
          
          {/* Botón para eliminar imagen */}
          {!uploading && (
            <button
              onClick={handleRemoveImage}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255, 0, 0, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          )}

          {uploading && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px"
            }}>
              <p style={{ color: "white", fontSize: "16px", fontWeight: "bold" }}>
                Subiendo...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "40px",
          textAlign: "center",
          background: "#f9f9f9",
          cursor: "pointer"
        }}
        onClick={() => fileInputRef.current?.click()}
        >
          <p style={{ margin: "0", fontSize: "40px" }}>📷</p>
          <p style={{ margin: "10px 0 0 0", color: "#666" }}>
            Haz clic para seleccionar una imagen
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
            (Máximo 5MB - JPG, PNG, GIF)
          </p>
        </div>
      )}

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: "none" }}
      />

      {/* Botón para cambiar imagen si ya existe una */}
      {preview && !uploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          📁 Cambiar imagen
        </button>
      )}
    </div>
  );
}