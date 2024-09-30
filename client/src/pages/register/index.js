import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../../apicalls/users";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import styles from "./index.module.css";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", email: "", password: "" };

    if (!user.name) {
      newErrors.name = "Name is required";
      valid = false;
    } else if (user.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      valid = false;
    }

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
    } else if (user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const register = async () => {
    if (!validate()) return;
    try {
      dispatch(ShowLoader());
      const response = await RegisterUser(user);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        navigate("/login");
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
          <h1 className={styles.title}>Create account</h1>
        </div>
        <hr />
        <input
          type="text"
          value={user.name}
          onChange={(e) => {
            setUser({ ...user, name: e.target.value });
            setErrors({ ...errors, name: "" });
          }}
          placeholder="Enter your name"
          className={`${styles.input} ${errors.name ? styles.error : ""}`}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}{" "}
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
            user.name && user.email && user.password
              ? styles.containedBtn
              : styles.disabledBtn
          }
          onClick={register}
          disabled={!user.name || !user.email || !user.password}
        >
          Register
        </button>
        <Link to="/login" className={styles.link}>
          Already have an account? Login here
        </Link>
      </div>
    </div>
  );
}

export default Register;
