import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllChats } from "../../apicalls/chats";
import { GetAllUsers, GetCurrentUser } from "../../apicalls/users";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetAllUsers, SetUser, SetAllChats } from "../../redux/userSlice";
import toast from "react-hot-toast";
import styles from "./ProtectedRoute.module.css";

function ProtectedRoute({ children, socket }) {
  const { user } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getCurrentUser = useCallback(async () => {
    try {
      dispatch(ShowLoader());
      const response = await GetCurrentUser();
      const allUsersResponse = await GetAllUsers();
      const allChatsResponse = await GetAllChats();
      dispatch(HideLoader());

      if (response.success) {
        dispatch(SetUser(response.data));
        dispatch(SetAllUsers(allUsersResponse.data));
        dispatch(SetAllChats(allChatsResponse.data));
      } else {
        toast.error(response.message);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getCurrentUser();
    } else {
      navigate("/login");
    }
  }, [navigate, getCurrentUser]);

  const handleLogout = () => {
    if (socket && user) {
      socket.emit("went-offline", user._id);
    }
    localStorage.removeItem("token");
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <img src="/chat-icon.png" alt="chat icon" className={styles.logo} />
          <h1
            className={styles.brand}
            onClick={() => {
              navigate("/");
            }}
          >
            Chat App
          </h1>
        </div>
        <div className={styles.userSection}>
          {user?.profilePic && (
            <img
              src={user?.profilePic}
              alt="profile"
              className={styles.profilePic}
            />
          )}
          {!user?.profilePic && (
            <i className={`${styles.icon} ri-shield-user-line`}></i>
          )}
          <h1
            className={styles.username}
            onClick={() => {
              navigate("/profile");
            }}
          >
            {user?.name}
          </h1>

          <i
            className={`${styles.logoutIcon} ri-logout-circle-r-line`}
            onClick={handleLogout}
          ></i>
        </div>
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default ProtectedRoute;
