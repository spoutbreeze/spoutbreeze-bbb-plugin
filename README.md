# Repository of a plugin for BigBlueButton

## Description

A custom BigBlueButton plugin that adds a "Start Stream" button to the session's action dropdown menu.
This plugin provides an intuitive way for moderators to initiate a live stream directly from within an active BigBlueButton conference — streamlining the process and enhancing the user experience during virtual meetings, webinars, and presentations.

🔥 Features

  - "Seamlessly integrates into BigBlueButton’s action dropdown."
  - "Enables moderators to start streaming with a single click. (e.g: Twitch, Youtube, ...)"
  - "Designed to improve workflow for online classes, virtual events, live broadcasts, and streaming to a large audience."

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd $HOME/src/plugin-template
npm ci
npm run build-bundle
```

The above command will generate the `dist` folder, containing the bundled JavaScript file named `<plugin-name>.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the Plugin separated to the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
