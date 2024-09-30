import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../apicalls/users";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import styles from "./index.module.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(user.email)) {
      newErrors.email = "Email is not valid";
      valid = false;
    }

    if (!user.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const login = async () => {
    if (!validate()) return;
    try {
      dispatch(ShowLoader());
      const response = await LoginUser(user);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        localStorage.setItem("token", response.data);
        window.location.href = "/";
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Login</h1>
        </div>
        <hr />
        <input
          type="text"
          value={user.email}
          onChange={(e) => {
            setUser({ ...user, email: e.target.value });
            setErrors({ ...errors, email: "" });
          }}
          placeholder="Enter your email"
          className={`${styles.input} ${errors.email ? styles.error : ""}`}
        />
        {errors.email && (
          <span className={styles.errorText}>{errors.email}</span>
        )}{" "}
        <input
          type="password"
          value={user.password}
          onChange={(e) => {
            setUser({ ...user, password: e.target.value });
            setErrors({ ...errors, password: "" });
          }}
          placeholder="Enter your password"
          className={`${styles.input} ${errors.password ? styles.error : ""}`}
        />
        {errors.password && (
          <span className={styles.errorText}>{errors.password}</span>
        )}{" "}
        <button
          className={
            user.email && user.password
              ? styles.containedBtn
              : styles.disabledBtn
          }
          onClick={login}
          disabled={!user.email || !user.password}
        >
          LOGIN
        </button>
        <Link to="/register" className={styles.link}>
          Don't have an account? Register here
        </Link>
      </div>
    </div>
  );
}

export default Login;
