import { axiosInstance } from ".";

export const LoginUser = async (user) => {
  try {
    const response = await axiosInstance.post("/api/users/login", user);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    return error.response?.data || "An error occurred while logging in.";
  }
};

export const RegisterUser = async (user) => {
  try {
    const response = await axiosInstance.post("/api/users/register", user);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    return error.response?.data || "An error occurred while registering.";
  }
};

export const GetCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-current-user");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return (
      error.response?.data ||
      "An error occurred while fetching the current user."
    );
  }
};

export const GetAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-all-users");
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return error.response?.data || "An error occurred while fetching users.";
  }
};

export const UpdateProfilePicture = async (image) => {
  try {
    const response = await axiosInstance.post(
      "/api/users/update-profile-picture",
      { image }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return (
      error.response?.data ||
      "An error occurred while updating profile picture."
    );
  }
};
