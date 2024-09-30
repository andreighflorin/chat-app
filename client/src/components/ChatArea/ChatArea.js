import { useState, useEffect } from "react";
import store from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { GetMessages, SendMessage } from "../../apicalls/messages";
import { ClearChatMessages } from "../../apicalls/chats";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetAllChats } from "../../redux/userSlice";
import toast from "react-hot-toast";
import moment from "moment";
import EmojiPicker from "emoji-picker-react";
import styles from "./ChatArea.module.css";

function ChatArea({ socket }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState("");
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer
  );
  const [messages = [], setMessages] = useState([]);
  const receipentUser = selectedChat.members.find(
    (mem) => mem._id !== user._id
  );

  const sendNewMessage = async (image) => {
    try {
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image,
      };
      socket.emit("send-message", {
        ...message,
        members: selectedChat.members.map((mem) => mem._id),
        createdAt: moment().format(),
        read: false,
      });

      const response = await SendMessage(message);

      if (response.success) {
        setNewMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getMessages = async () => {
    try {
      dispatch(ShowLoader());
      const response = await GetMessages(selectedChat._id);
      dispatch(HideLoader());
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chat: selectedChat._id,
        members: selectedChat.members.map((mem) => mem._id),
      });

      const response = await ClearChatMessages(selectedChat._id);

      if (response.success) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDateInRegularFormat = (date) => {
    let result = "";
    const momentDate = moment(date);

    if (momentDate.isSame(moment(), "day")) {
      result = momentDate.format("hh:mm");
    } else if (momentDate.isSame(moment().subtract(1, "day"), "day")) {
      result = `Yesterday ${momentDate.format("hh:mm")}`;
    } else if (momentDate.isSame(moment(), "year")) {
      result = momentDate.format("MMM DD hh:mm");
    } else {
      result = momentDate.format("MMM DD, YYYY hh:mm");
    }

    return result;
  };

  useEffect(() => {
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    socket.on("receive-message", (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat;
      if (tempSelectedChat._id === message.chat) {
        setMessages((messages) => [...messages, message]);
      }

      if (
        tempSelectedChat._id === message.chat &&
        message.sender !== user._id
      ) {
        clearUnreadMessages();
      }
    });

    socket.on("unread-messages-cleared", (data) => {
      const tempAllChats = store.getState().userReducer.allChats;
      const tempSelectedChat = store.getState().userReducer.selectedChat;

      if (data.chat === tempSelectedChat._id) {
        const updatedChats = tempAllChats.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            };
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));

        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            return {
              ...message,
              read: true,
            };
          });
        });
      }
    });
  }, [selectedChat]);

  useEffect(() => {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages]);

  const onUploadImageClick = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      sendNewMessage(reader.result);
    };
  };

  return (
    <div className={styles.chatContainer}>
      <div>
        <div className={styles.recipientInfo}>
          {receipentUser.profilePic ? (
            <img
              src={receipentUser.profilePic}
              alt="profile pic"
              className={styles.profilePic}
            />
          ) : (
            <div className={styles.placeholderPic}>
              <h1 className={styles.placeholderText}>
                {receipentUser.name[0]}
              </h1>
            </div>
          )}
          <h1 className={styles.recipientName}>{receipentUser.name}</h1>
        </div>
        <hr />
      </div>

      <div className={styles.messagesContainer} id="messages">
        <div className={styles.messagesList}>
          {messages.map((message, index) => {
            const isSender = message.sender === user._id;
            return (
              <div
                className={`${styles.messageWrapper} ${
                  isSender ? styles.alignEnd : ""
                }`}
                key={message._id || index}
              >
                <div className={styles.messageContent}>
                  {message.text && (
                    <h1
                      className={`${styles.messageText} ${
                        isSender
                          ? styles.senderMessage
                          : styles.recipientMessage
                      }`}
                    >
                      {message.text}
                    </h1>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="sent"
                      className={styles.sentImage}
                    />
                  )}
                  <h1 className={styles.messageDate}>
                    {getDateInRegularFormat(message.createdAt)}
                  </h1>
                </div>
                {isSender && message.read && (
                  <div className={styles.readStatus}>
                    {receipentUser.profilePic ? (
                      <img
                        src={receipentUser.profilePic}
                        alt="profile pic"
                        className={styles.smallProfilePic}
                      />
                    ) : (
                      <div className={styles.placeholderStatus}>
                        <h1 className={styles.placeholderTextSmall}>
                          {receipentUser.name[0]}
                        </h1>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.chatInput}>
        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <EmojiPicker
              height={350}
              onEmojiClick={(e) => {
                setNewMessage((prev) => prev + e.emoji);
              }}
            />
          </div>
        )}

        <div className={styles.inputControls}>
          <label htmlFor="file">
            <i className={`${styles.icon} ri-link`}></i>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              accept="image/gif,image/jpeg,image/jpg,image/png"
              onChange={onUploadImageClick}
            />
          </label>
          <i
            className={`${styles.icon} ri-emotion-line`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          ></i>
        </div>

        <input
          type="text"
          placeholder="Type a message"
          className={styles.messageInput}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className={styles.sendButton}
          onClick={() => sendNewMessage("")}
        >
          <i className={`${styles.sendIcon} ri-send-plane-2-line`}></i>
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
