import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import HomeCustomer from "./pages/customer/HomeCustomer";
import HomeSeller from "./pages/seller/HomeSeller";
import { useAuth } from "./context/AuthContext";
import { db } from "./config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setAllowed(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setAllowed(false);
        return;
      }

      const userRole = snap.data().role;

      setAllowed(userRole === role);
    };

    checkRole();
  }, [user]);

  if (loading || allowed === null) return <p>Cargando...</p>;

  return allowed ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* CUSTOMER HOME */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <HomeCustomer />
            </ProtectedRoute>
          }
        />

        {/* SELLER HOME */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute role="seller">
              <HomeSeller />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT → REDIRIGIR A LOGIN */}
       <Route path="/" element={<Login />} />

        <Route path="/customer/home" element={<HomeCustomer />} />
        <Route path="/seller/home" element={<HomeSeller />} /> 

      </Routes>
    </BrowserRouter>
  );
}

export default App;
