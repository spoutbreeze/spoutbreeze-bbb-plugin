import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  pluginLogger,
} from "bigbluebutton-html-plugin-sdk";
import * as React from "react";
import * as ReactModal from "react-modal";
import { useEffect, useState } from "react";
import { SampleStreamButtonPluginItemProps } from "./types";
import { startStream } from "./../../api/startStream";
import "./style.css";

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
    </ReactModal>
  );
}

export default SampleStreamButtonPluginItem;
