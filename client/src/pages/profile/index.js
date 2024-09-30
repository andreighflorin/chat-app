import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetUser } from "../../redux/userSlice";
import { UpdateProfilePicture } from "../../apicalls/users";
import toast from "react-hot-toast";
import moment from "moment";
import styles from "./index.module.css";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image = "", setImage] = useState("");
  const dispatch = useDispatch();
  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      console.log(reader.result);
      setImage(reader.result);
    };
  };

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  const updateProfilePic = async () => {
    try {
      dispatch(ShowLoader());
      const response = await UpdateProfilePicture(image);
      dispatch(HideLoader());
      if (response.success) {
        toast.success("Profile Pic Updated");
        dispatch(SetUser(response.data));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  return (
    user && (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>
            Username: <span>{user.name}</span>
          </p>
          <p>
            Email: <span>{user.email}</span>
          </p>
          <p>
            Created at:{" "}
            <span>
              {moment(user.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
            </span>
          </p>

          {image && (
            <img src={image} alt="profile pic" className={styles.profilePic} />
          )}

          <div className={styles.inputWrapper}>
            <label htmlFor="file-input" className={styles.label}>
              Update profile image
            </label>
            <input
              type="file"
              onChange={onFileSelect}
              className={styles.fileInput}
              id="file-input"
            />
            <button className={styles.containedBtn} onClick={updateProfilePic}>
              Update
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default Profile;
