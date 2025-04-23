import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  pluginLogger,
  ChatFormUiDataNames,
} from "bigbluebutton-html-plugin-sdk";
import * as React from "react";
import * as ReactModal from "react-modal";
import { useEffect, useState, useRef } from "react";
import { SampleStreamButtonPluginItemProps } from "./types";
import { startStream } from "./../../api/startStream";
import { useTwitchChat } from "./useTwitchChat";
import "./style.css";
import { text } from "stream/consumers";

// Parse a single message in the format `:username!username@username.tmi.twitch.tv PRIVMSG #channel :message`
const parseTwitchMessage = (msg: string) => {
  try {
    if (!msg.includes("PRIVMSG")) return null;
    
    // Extract username (everything between : and !)
    const user = msg.split("!")[0].substring(1);
    
    // Extract message (everything after the second :)
    const msgParts = msg.split(":");
    const text = msgParts.length >= 3 ? msgParts[2] : "";
    
    return { user, text };
  } catch (error) {
    console.error("Error parsing Twitch message:", error);
    return null;
  }
};

function SampleStreamButtonPluginItem({
  pluginUuid: uuid,
}: SampleStreamButtonPluginItemProps): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [meetingId, setMeetingId] = useState<string>("");
  const [rtmpUrl, setRtmpUrl] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const [processedMessages, setProcessedMessages] = useState<string[]>([]);

  // Monitor BBB chat input using useUiData
  const currentChatInputText = pluginApi.useUiData(ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT, {
    text: "",
  });
  
  const chatInputIsFocused = pluginApi.useUiData(ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
    value: false,
  });
  
  // Ref to store the last chat input value
  const lastChatInputRef = useRef("");
  
  // Track chat input focus state
  const wasFocusedRef = useRef(false);

  const { messages, sendMessage } = useTwitchChat("ws://localhost:8000/ws/chat/");
  const [input, setInput] = useState<string>("");


  const handleStartStreamButtonClick = () => {
    setShowModal(true);
    pluginLogger.info("Start Stream button clicked");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        meeting_id: meetingId,
        rtmp_url: rtmpUrl,
        stream_key: streamKey,
        password: password,
      };
      await startStream(payload);
        setStatusMessage("Stream started successfully");
        pluginLogger.info("Stream started successfully");
    } catch (error) {
      setStatusMessage("Error starting stream");
      pluginLogger.error("Error starting stream:", error);
    }
  };

  useEffect(() => {
    pluginApi.setActionButtonDropdownItems([
      new ActionButtonDropdownSeparator(),
      new ActionButtonDropdownOption({
        label: "Start Stream",
        icon: "play",
        tooltip: "Start Stream",
        allowed: true,
        onClick: () => {
          handleStartStreamButtonClick();
        },
      }),
    ]);
  }, []);

  // This effect attempts to detect when a user has sent a message
  // by monitoring focus changes and input text
  useEffect(() => {
    // Keep track of whether we should watch for an Enter key
    let shouldWatchForEnter = false;
    let messageToSend = "";
    
    // Monitor changes to the chat input text
    const checkForChanges = () => {
      const currentInputText = currentChatInputText.text;
      const isFocused = chatInputIsFocused.value;
      
      // console.log("Chat input state:", { 
      //   currentInputText, 
      //   isFocused, 
      //   lastInput: lastChatInputRef.current, 
      //   wasFocused: wasFocusedRef.current,
      //   shouldWatch: shouldWatchForEnter
      // });
      
      // We should watch for Enter key if:
      // 1. The input is focused AND
      // 2. There is text in the input
      if (isFocused && currentInputText && currentInputText.trim() !== "") {
        shouldWatchForEnter = true;
        messageToSend = currentInputText;
      } else {
        // If input becomes empty while focused, a message might have been sent
        if (isFocused && !currentInputText && shouldWatchForEnter) {
          console.log("Message detected (input cleared):", messageToSend);
          try {
            sendMessage(messageToSend);
            pluginLogger.info("Message sent to Twitch:", messageToSend);
          } catch (error) {
            console.error("Error sending message:", error);
          }
          shouldWatchForEnter = false;
        }
      }
      
      // Remember current state for next comparison
      lastChatInputRef.current = currentInputText;
      wasFocusedRef.current = isFocused;
    };
    
    // Handle keyboard events globally
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only process if we're watching for Enter key
      if (!shouldWatchForEnter) return;
      
      // Check if Enter was pressed and not with modifiers
      if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        console.log("Enter key detected with message:", messageToSend);
        try {
          sendMessage(messageToSend);
          pluginLogger.info("Message sent to Twitch (Enter key):", messageToSend);
        } catch (error) {
          console.error("Error sending message:", error);
        }
        shouldWatchForEnter = false;
      }
    };
    
    // Set up the event listeners
    document.addEventListener("keydown", handleKeyDown);
    
    // Set up an interval to regularly check the input state
    // This helps catch changes even when key events are missed
    const intervalId = setInterval(checkForChanges, 200);
    
    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(intervalId);
    };
  }, [currentChatInputText, chatInputIsFocused, sendMessage]);


  // Process incoming twitch chat messages
  useEffect(() => {
    // only process messages if there's something new
    if (!messages.length) return;

    // Find the last message that hasn't been processed
    const newMessages = messages
      .filter(msg => !processedMessages.includes(msg))
      .map(parseTwitchMessage)
      .filter(msg => msg !== null);

    // If we have new messages, send them to BBB chat
    if (newMessages.length > 0) {
      const formattedMessages = newMessages.map(
        msg => `**🟢 [Twitch]**\n**${msg?.user}**: ${msg?.text}`
      );
      
      pluginApi.serverCommands.chat.sendPublicChatMessage({
        textMessageInMarkdownFormat: formattedMessages.join("\n"),
      });
      
      // Update our processed messages list
      setProcessedMessages(prev => [...prev, ...messages]);
    }
  }, [messages, processedMessages]);


  // const handleSend = () => {
  //   if (input.trim()) {
  //     sendMessage(input);
  //     setInput("");
  //   }
  // };

  return (
    <ReactModal
      className="plugin-modal"
      overlayClassName="modal-overlay"
      isOpen={showModal}
      onRequestClose={handleCloseModal}
    >
      <div>
        <h2>Start Stream</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Meeting ID:</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
            />
          </div>
          <div>
            <label>RTMP URL:</label>
            <input
              type="text"
              value={rtmpUrl}
              onChange={(e) => setRtmpUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Stream Key:</label>
            <input
              type="text"
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Start Stream</button>
        </form>
        {statusMessage && <p>{statusMessage}</p>}
        <button onClick={handleCloseModal}>Close</button>
      </div>
      
      {/* <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border px-2 py-1 rounded shadow"
          placeholder="Type /twitch Hello..."
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div> */}
    </ReactModal>
  );
}

export default SampleStreamButtonPluginItem;
