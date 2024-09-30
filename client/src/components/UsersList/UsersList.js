import { useEffect } from "react";
import store from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { CreateNewChat } from "../../apicalls/chats";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetAllChats, SetSelectedChat } from "../../redux/userSlice";
import toast from "react-hot-toast";
import styles from "./UsersList.module.css";

function UsersList({ searchKey, socket, onlineUsers }) {
  const { allUsers, allChats, user, selectedChat } = useSelector(
    (state) => state.userReducer
  );
  const dispatch = useDispatch();

  const createNewChat = async (receipentUserId) => {
    try {
      dispatch(ShowLoader());
      const response = await CreateNewChat([user._id, receipentUserId]);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChats = [...allChats, newChat];
        dispatch(SetAllChats(updatedChats));
        dispatch(SetSelectedChat(newChat));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const openChat = (receipentUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((mem) => mem._id).includes(user._id) &&
        chat.members.map((mem) => mem._id).includes(receipentUserId)
    );
    if (chat) {
      dispatch(SetSelectedChat(chat));
    }
  };

  const getData = () => {
    try {
      if (searchKey === "") {
        return allUsers;
      }
      return allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchKey.toLowerCase())
      );
    } catch (error) {
      return [];
    }
  };

  const getIsSelectedChatOrNot = (userObj) => {
    if (selectedChat) {
      return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
    }
    return false;
  };

  const getUnreadMessages = (userObj) => {
    const chat = allChats.find((chat) =>
      chat.members.map((mem) => mem._id).includes(userObj._id)
    );
    if (
      chat &&
      chat?.unreadMessages &&
      chat?.lastMessage?.sender !== user._id
    ) {
      return (
        <div className={styles.unreadMessages}>{chat?.unreadMessages}</div>
      );
    }
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat;
      let tempAllChats = store.getState().userReducer.allChats;
      if (tempSelectedChat?._id !== message.chat) {
        const updatedAllChats = tempAllChats.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              unreadMessages: (chat?.unreadMessages || 0) + 1,
              lastMessage: message,
              updatedAt: message.createdAt,
            };
          }
          return chat;
        });
        tempAllChats = updatedAllChats;
      }

      const latestChat = tempAllChats.find((chat) => chat._id === message.chat);
      const otherChats = tempAllChats.filter(
        (chat) => chat._id !== message.chat
      );
      tempAllChats = [latestChat, ...otherChats];
      dispatch(SetAllChats(tempAllChats));
    });
  }, [dispatch, socket]);

  return (
    <div className={styles.chatList}>
      {getData().map((chatObjOrUserObj) => {
        let userObj = chatObjOrUserObj;

        if (chatObjOrUserObj.members) {
          userObj = chatObjOrUserObj.members.find(
            (mem) => mem._id !== user._id
          );
        }

        return (
          <div
            className={`${styles.chatItem} ${
              getIsSelectedChatOrNot(userObj) ? styles.selectedChat : ""
            }`}
            key={userObj._id}
            onClick={() => openChat(userObj._id)}
          >
            <div className={styles.userInfo}>
              {userObj.profilePic ? (
                <img
                  src={userObj.profilePic}
                  alt="profile pic"
                  className={styles.profilePic}
                />
              ) : (
                <div className={styles.defaultProfilePic}>
                  <h1 className={styles.defaultProfileInitial}>
                    {userObj.name[0]}
                  </h1>
                </div>
              )}

              <div className={styles.userDetails}>
                <div className={styles.userHeader}>
                  <div className={styles.userStatus}>
                    <h1>{userObj.name}</h1>
                    {onlineUsers.includes(userObj._id) && (
                      <div className={styles.onlineIndicator}></div>
                    )}
                  </div>
                  {getUnreadMessages(userObj)}
                </div>
              </div>
            </div>

            <div onClick={() => createNewChat(userObj._id)}>
              {!allChats.find((chat) =>
                chat.members.map((mem) => mem._id).includes(userObj._id)
              ) && (
                <button className={styles.createChatBtn}>Create Chat</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UsersList;
