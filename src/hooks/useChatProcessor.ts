import { useEffect, useState } from "react";
import { PluginApi, pluginLogger } from "bigbluebutton-html-plugin-sdk";
import { parseTwitchMessage, saveProcessedIds, loadProcessedIds } from "../utils/messageProcessor";

export const useChatProcessor = (
  pluginApi: PluginApi,
  messages: string[],
  sendMessage: (message: string) => void
) => {
  const [processedMessages, setProcessedMessages] = useState<string[]>([]);
  const [lastProcessedMessageIds, setLastProcessedMessageIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const loadedChatMessages = pluginApi.useLoadedChatMessages();

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
  }, [messages, processedMessages, pluginApi]);

  return {
    processedMessages,
    lastProcessedMessageIds,
    isInitialized,
  };
};