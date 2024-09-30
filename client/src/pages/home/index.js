import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ChatArea from "../../components/ChatArea/ChatArea";
import UserSearch from "../../components/UserSearch/UserSearch";
import UsersList from "../../components/UsersList/UsersList";
import styles from "./index.module.css";

function Home({ socket }) {
  const [searchKey, setSearchKey] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("came-online", user._id);

      socket.on("online-users-updated", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [user, socket]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
        <UsersList
          searchKey={searchKey}
          socket={socket}
          onlineUsers={onlineUsers}
        />
      </div>

      {selectedChat ? (
        <div className={styles.chatArea}>
          <ChatArea socket={socket} />
        </div>
      ) : (
        <div className={styles.emptyChat}>
          <img
            src="/chat-icon.png"
            alt="chat icon"
            className={styles.chatIcon}
          />
          <h1 className={styles.emptyChatText}>Select a user to chat</h1>
        </div>
      )}
    </div>
  );
}

export default Home;
