import { axiosInstance } from ".";

export const SendMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/messages/new-message",
      message
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw (
      error.response?.data || "An error occurred while sending the message."
    );
  }
};

export const GetMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(
      `/api/messages/get-all-messages/${chatId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error.response?.data || "An error occurred while fetching messages.";
  }
};
