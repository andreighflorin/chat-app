import { axiosInstance } from ".";

export const GetAllChats = async () => {
  try {
    const response = await axiosInstance.get("/api/chats/get-all-chats");
    return response.data;
  } catch (error) {
    console.error("Error fetching all chats:", error);
    throw error.response?.data || "An error occurred while fetching chats.";
  }
};

export const CreateNewChat = async (members) => {
  try {
    const response = await axiosInstance.post("/api/chats/create-new-chat", {
      members,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw (
      error.response?.data || "An error occurred while creating a new chat."
    );
  }
};

export const ClearChatMessages = async (chatId) => {
  try {
    const response = await axiosInstance.post(
      "/api/chats/clear-unread-messages",
      { chat: chatId }
    );
    return response.data;
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    throw error.response?.data || "An error occurred while clearing messages.";
  }
};
