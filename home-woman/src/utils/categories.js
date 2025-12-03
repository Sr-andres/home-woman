// Configuración de categorías para los negocios
export const CATEGORIES = [
  {
    id: "restaurant",
    name: "Restaurante",
    icon: "🍽️",
    color: "#FF6B6B",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3480/3480822.png"
  },
  {
    id: "store",
    name: "Tienda",
    icon: "🏪",
    color: "#4ECDC4",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2331/2331966.png"
  },
  {
    id: "service",
    name: "Servicio",
    icon: "🔧",
    color: "#95E1D3",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3050/3050155.png"
  },
  {
    id: "health",
    name: "Salud",
    icon: "⚕️",
    color: "#F38181",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2913/2913133.png"
  },
  {
    id: "education",
    name: "Educación",
    icon: "📚",
    color: "#AA96DA",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3976/3976625.png"
  },
  {
    id: "entertainment",
    name: "Entretenimiento",
    icon: "🎭",
    color: "#FCBAD3",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2593/2593549.png"
  },
  {
    id: "hotel",
    name: "Hotel/Hospedaje",
    icon: "🏨",
    color: "#FFFFD2",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2910/2910769.png"
  },
  {
    id: "transport",
    name: "Transporte",
    icon: "🚗",
    color: "#A8DADC",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png"
  },
  {
    id: "other",
    name: "Otro",
    icon: "📍",
    color: "#B4B4B4",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png"
  }
];

// Función helper para obtener una categoría por ID
export const getCategoryById = (categoryId) => {
  return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1]; // "Otro" por defecto
};

// Función para obtener el ícono de Leaflet personalizado
export const getCategoryIcon = (categoryId) => {
  const category = getCategoryById(categoryId);
  return {
    iconUrl: category.iconUrl,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  };
};