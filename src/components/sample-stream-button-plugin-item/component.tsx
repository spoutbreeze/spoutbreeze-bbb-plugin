import {
  BbbPluginSdk,
  PluginApi,
  ActionButtonDropdownSeparator,
  ActionButtonDropdownOption,
  pluginLogger
} from "bigbluebutton-html-plugin-sdk";
import * as React from "react";
import { useEffect, useState } from "react";
import { SampleStreamButtonPluginItemProps } from "./types";

function SampleStreamButtonPluginItem({ pluginUuid: uuid}: SampleStreamButtonPluginItemProps): React.ReactElement {
    BbbPluginSdk.initialize(uuid);
    const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

    const handleStartStreamButtonClick = () => {
        pluginLogger.info("Start Stream button clicked");
        // Add your logic to start the stream here
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

    return null;
}

export default SampleStreamButtonPluginItem;