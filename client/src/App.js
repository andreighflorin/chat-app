import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Loader from "./components/Loader/Loader";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";

function App() {
  const socket = io("http://localhost:5000");
  const { loader } = useSelector((state) => state.loaderReducer);
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {loader && <Loader />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute socket={socket}>
              <Home socket={socket} />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute socket={socket}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
