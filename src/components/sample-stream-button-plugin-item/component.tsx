import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  pluginLogger,
} from "bigbluebutton-html-plugin-sdk";
import * as React from "react";
import { useEffect, useState } from "react";
import { SampleStreamButtonPluginItemProps } from "./types";
import { useTwitchChat } from "../../hooks/useTwitchChat";
import { useStreamManager } from "../../hooks/useStreamManager";
import { useChatProcessor } from "../../hooks/useChatProcessor";
import { StreamModal } from "./StreamModal";
import "./style.css";

function SampleStreamButtonPluginItem({
  pluginUuid: uuid,
}: SampleStreamButtonPluginItemProps): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const { data: currentUser } = pluginApi.useCurrentUser();
  const { data: meetingInfo } = pluginApi.useMeeting();
  const [showModal, setShowModal] = useState<boolean>(false);
  const WEBSOCKET_URL = process.env.WEBSOCKET_URL;
  const { messages, sendMessage } = useTwitchChat(`${WEBSOCKET_URL}/ws/chat/`);

  const {
    meetingDetails,
    statusMessage,
    streamEndpoints,
    selectedEndpointId,
    isLoading,
    setSelectedEndpointId,
    loadStreamData,
    handleStreamStart,
  } = useStreamManager();

  useChatProcessor(pluginApi, messages, sendMessage);

  const handleStartStreamButtonClick = () => {
    setShowModal(true);
    // Get the internal meeting ID from BBB
    const internalMeetingId = Array.isArray(meetingInfo) 
      ? meetingInfo[0]?.meetingId 
      : (meetingInfo as any)?.meetingId;
    
    if (internalMeetingId) {
      loadStreamData(internalMeetingId);
    }
    pluginLogger.info("Start Stream button clicked");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleStreamStart();
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

  return (
    <StreamModal
      isOpen={showModal}
      onClose={handleCloseModal}
      isLoading={isLoading}
      streamEndpoints={streamEndpoints}
      selectedEndpointId={selectedEndpointId}
      onEndpointChange={setSelectedEndpointId}
      onSubmit={handleFormSubmit}
      meetingDetails={meetingDetails}
      statusMessage={statusMessage}
    />
  );
}

export default SampleStreamButtonPluginItem;
