import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { userInfo, selectedChatData, selectedChatType, addMessage } =
    useAppStore();

  useEffect(() => {
    if (userInfo) {
      // Initialize socket connection
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
        
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      // Message handler
      const handleReceiveMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addContactsInDMContacts,
        } = useAppStore.getState();
        if (
          selectedChatType &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          console.log("Message received", message);
          addMessage(message);
        }
        addContactsInDMContacts(message);
      };

      const handleChannelReceiveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage,addChannelInChannelList } = useAppStore.getState();

        if (selectedChatType !== undefined && selectedChatData._id === message.channelId) {
          addMessage(message)
        }
         addChannelInChannelList(message);
      }

      // Listen for incoming messages
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("receive-channel-message",handleChannelReceiveMessage);

      // Cleanup on component unmount or when userInfo changes
      return () => {
        if (socket.current) {
           socket.current.off("receiveMessage", handleReceiveMessage); // Clean up listener
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo, selectedChatData, selectedChatType, addMessage]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
