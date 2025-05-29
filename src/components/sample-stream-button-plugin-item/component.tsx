import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  pluginLogger,
  NavBarButton,
  NavBarInfo,
  NavBarItemPosition,
} from "bigbluebutton-html-plugin-sdk";
import * as React from "react";
import * as ReactModal from "react-modal";
import { useEffect, useState } from "react";
import { SampleStreamButtonPluginItemProps } from "./types";
import { startStream } from "./../../api/startStream";
import { useTwitchChat } from "./useTwitchChat";
import {
  fetchStreamEndpoints,
  StreamEndpointsRes,
} from "./../../api/streamEndpoints";
import { fetchMeetingDetails, MeetingDetailsRes } from "./../../api/meetingDetails";
import "./style.css";

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
  const { data: currentUser } = pluginApi.useCurrentUser();
  const { data: meetingInfo } = pluginApi.useMeeting();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetailsRes | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [streamEndpoints, setStreamEndpoints] = useState<StreamEndpointsRes[]>([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [processedMessages, setProcessedMessages] = useState<string[]>([]);
  const [lastProcessedMessageIds, setLastProcessedMessageIds] = useState<
    Set<string>
  >(new Set());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const { messages, sendMessage } = useTwitchChat(
    "ws://localhost:8000/ws/chat/"
  );

  const handleStartStreamButtonClick = () => {
    setShowModal(true);
    loadStreamData();
    pluginLogger.info("Start Stream button clicked");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const loadStreamData = async () => {
    setIsLoading(true);
    try {
      // Get the internal meeting ID from BBB
      const internalMeetingId = Array.isArray(meetingInfo) 
        ? meetingInfo[0]?.meetingId 
        : (meetingInfo as any)?.meetingId;


      if (!internalMeetingId) {
        throw new Error("Meeting ID not available");
      }

      console.log("Loading data for meeting:", internalMeetingId);

      // Fetch both meeting details and stream endpoints concurrently
      const [meetingDetailsResponse, endpointsResponse] = await Promise.all([
        fetchMeetingDetails(internalMeetingId),
        fetchStreamEndpoints()
      ]);

      setMeetingDetails(meetingDetailsResponse);
      setStreamEndpoints(endpointsResponse);
      
      if (endpointsResponse.length > 0) {
        setSelectedEndpointId(endpointsResponse[0].id);
      }

      setStatusMessage("Stream data loaded successfully");
      setIsLoading(false);
    } catch (error) {
      setStatusMessage(`Error loading stream data: ${error.message}`);
      pluginLogger.error("Error loading stream data:", error);
      console.error("Error loading stream data:", error);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedEndpointId) {
      setStatusMessage("Please select a stream endpoint");
      return;
    }

    if (!meetingDetails) {
      setStatusMessage("Meeting details not loaded");
      return;
    }

    const selectedEndpoint = streamEndpoints.find(
      (endpoint) => endpoint.id === selectedEndpointId
    );

    if (!selectedEndpoint) {
      setStatusMessage("Invalid stream endpoint selected");
      return;
    }

    try {
      const payload = {
        meeting_id: meetingDetails.meeting_id,
        rtmp_url: selectedEndpoint.rtmp_url,
        stream_key: selectedEndpoint.stream_key,
        password: meetingDetails.moderator_pw,
      };
      
      console.log("Starting stream with payload:", payload);
      await startStream(payload);
      setStatusMessage("Stream started successfully");
      pluginLogger.info("Stream started successfully");
    } catch (error) {
      setStatusMessage("Error starting stream");
      pluginLogger.error("Error starting stream:", error);
    }
  };

  useEffect(() => {
    if (currentUser?.presenter) {
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
    }
  }, [currentUser]);

  const loadedChatMessages = pluginApi.useLoadedChatMessages();

  // Helper to save processed message IDs to localStorage
  const saveProcessedIds = (ids: Set<string>) => {
    localStorage.setItem(
      "processedMessageIds",
      JSON.stringify(Array.from(ids))
    );
  };

  // Helper to load processed message IDs from localStorage
  const loadProcessedIds = (): Set<string> => {
    try {
      const savedIds = localStorage.getItem("processedMessageIds");
      return savedIds ? new Set(JSON.parse(savedIds)) : new Set();
    } catch (e) {
      console.error("Error loading processed IDs from localStorage:", e);
      return new Set();
    }
  };

  // Initialize on component mount
  useEffect(() => {
    if (!isInitialized && loadedChatMessages?.data) {
      // Load already processed message IDs from localStorage
      const storedIds = loadProcessedIds();

      // Mark all existing messages as processed on first load
      const currentIds = new Set(storedIds);
      loadedChatMessages.data.forEach((msg) => {
        if (msg.messageId) currentIds.add(msg.messageId);
      });

      setLastProcessedMessageIds(currentIds);
      saveProcessedIds(currentIds);
      setIsInitialized(true);

      console.log(`Initialized with ${currentIds.size} processed message IDs`);
    }
  }, [loadedChatMessages, isInitialized]);

  // Process only new messages
  useEffect(() => {
    // Skip if we haven't initialized
    if (!isInitialized || !loadedChatMessages?.data) return;

    const newMessages = loadedChatMessages.data.filter(
      (msg) => msg.messageId && !lastProcessedMessageIds.has(msg.messageId)
    );

    if (newMessages.length > 0) {
      console.log(`Processing ${newMessages.length} new messages`);

      // Create new set with existing IDs
      const updatedProcessedIds = new Set(lastProcessedMessageIds);

      for (const chatMessage of newMessages) {
        // Skip if no ID or already processed
        if (!chatMessage.messageId) continue;

        // Skip Twitch messages to avoid loops
        if (chatMessage.message?.includes(`**🟢 [Twitch]**`)) {
          updatedProcessedIds.add(chatMessage.messageId);
          continue;
        }

        // Process BBB -> Twitch messages
        if (chatMessage.message?.includes("/twitch")) {
          const message = chatMessage.message.trim();
          if (message) {
            try {
              sendMessage(message);
              console.log("Message sent to Twitch:", message);
              pluginLogger.info("Message sent to Twitch:", message);
            } catch (error) {
              console.error("Error sending message:", error);
            }
          }
        }

        // Mark as processed
        updatedProcessedIds.add(chatMessage.messageId);
      }

      // Update our processed IDs and localStorage
      setLastProcessedMessageIds(updatedProcessedIds);
      saveProcessedIds(updatedProcessedIds);
    }
  }, [loadedChatMessages, lastProcessedMessageIds, sendMessage, isInitialized]);

  // Optional: Periodic cleanup for localStorage to prevent it from growing too large
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const ids = loadProcessedIds();
      // Keep only the most recent 1000 message IDs
      if (ids.size > 1000) {
        const recentIds = new Set(Array.from(ids).slice(-1000));
        saveProcessedIds(recentIds);
        setLastProcessedMessageIds(recentIds);
        console.log(
          "Cleaned up message ID history, keeping recent 1000 entries"
        );
      }
    }, 1000 * 60 * 60); // Run once per hour

    return () => clearInterval(cleanupInterval);
  }, []);

  // Process incoming twitch chat messages
  useEffect(() => {
    // only process messages if there's something new
    if (!messages.length) return;

    // Find the last message that hasn't been processed
    const newMessages = messages
      .filter((msg) => !processedMessages.includes(msg))
      .map(parseTwitchMessage)
      .filter((msg) => msg !== null);

    // If we have new messages, send them to BBB chat
    if (newMessages.length > 0) {
      const formattedMessages = newMessages.map(
        (msg) => `**🟢 [Twitch]**\n**${msg?.user}**: ${msg?.text}`
      );

      pluginApi.serverCommands.chat.sendPublicChatMessage({
        textMessageInMarkdownFormat: formattedMessages.join("\n"),
      });

      // Update our processed messages list
      setProcessedMessages((prev) => [...prev, ...messages]);
    }
  }, [messages, processedMessages]);

  return (
    <ReactModal
      className="plugin-modal"
      overlayClassName="modal-overlay"
      isOpen={showModal}
      onRequestClose={handleCloseModal}
    >
      <div>
        <h2>Start Stream</h2>
        {isLoading ? (
          <p>Loading stream data...</p>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div>
              <label>Stream Destination:</label>
              <select
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                required
              >
                <option value="">Select a destination</option>
                {streamEndpoints.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!meetingDetails || !selectedEndpointId}>
              Start Stream
            </button>
          </form>
        )}
        {statusMessage && <p>{statusMessage}</p>}
        <button onClick={handleCloseModal}>Close</button>
      </div>
    </ReactModal>
  );
}

export default SampleStreamButtonPluginItem;
