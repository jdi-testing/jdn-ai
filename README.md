# JDN plugin

[JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg) is a Google Chrome extension. It helps Test Automation Engineers to create Page Objects in the test automation framework and speed up test development in test environments such as Eclipse IDE or IntelliJ IDEA.

The plugin allows generating Page Objects with the following restrictions:
-	is applicable to the JDI framework;
-	creates xPath locators’ type;
-	works with Material UI and HTML5 websites.

:warning: Before using this plugin, you will have to [launch the backend server locally](#server-setup) unless you are an EPAM employee.

**Video instructions**

You can find the video instructions on YouTube in [English](https://www.youtube.com/watch?v=b2o6R98icRU) or in [Russian](https://www.youtube.com/watch?v=FJWJjxmJUMw).

**Contents**

- [JDN plugin](#jdn-plugin)
  - [Plugin setup](#plugin-setup)
    - [Frontend setup](#frontend-setup)
    - [Server setup](#server-setup)
  - [Working with JDN plugin](#working-with-jdn-plugin)
    - [Launch JDN plugin](#launch-jdn-plugin)
    - [Generate page objects](#generate-page-objects)
    - [Download page objects](#download-page-objects)
    - [Manage locators](#manage-locators)
  - [FAQ](#faq)
  - [Support](#support)

## Plugin setup
The current JDN version is available in the Chrome Web Store or can be downloaded as a client-server application.

### Frontend setup

1.	Install [JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg) from the Store;
2.	If you are an EPAM employee, turn on EPAM VPN to enable connection to a server. In other cases, please proceed to the **Server setup** section. (below)

If the plugin does not work after downloading from the Chrome Web Store, you can install it manually.

<details>
  <summary>Instructions to set up manually</summary>
  
*It is recommended to use the version from [Chrome Web store](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg).*  
1. [Download](https://github.com/jdi-testing/jdn-ai/releases?q=release) the latest release of the plugin.
   *  For the developer team only: [Download](https://github.com/jdi-testing/jdn-ai/releases) the latest build (you need a .zip file named like the needed JDN version).
2. Unpack the content to a local folder (the result folder name is `dist`).
3. Open Chrome Settings → choose the option “More tools” → choose the option Extensions → turn on the Developer mode → click “Load unpacked”.
4. Select the `dist` folder with the plugin on the subfolder's level.
5. Open Chrome developer tools via F12 (fn+f12) hotkey. The JDN tab is added as the last tab of DevTools.
</details>

### Server setup

If you are an EPAM employee, skip this section. Turn on EPAM VPN to enable connection to the server and :warning: make sure the VPN connection is established. In other cases, please use the instructions below.

1. Set up [Docker Desktop](https://www.docker.com/products/docker-desktop) or [Docker CLI](https://www.docker.com/products/cli)
2. Run Docker Daemon   
3. On _Windows 10_, use the command line; on _macOS_ and _Linux_, use the native terminal.

**Windows**
```shell
set SELENOID_PARALLEL_SESSIONS_COUNT=%NUMBER_OF_PROCESSORS%&& docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:rc --force && curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/docker-compose-rc.yaml && curl.exe --output browsers.json --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/browsers.json && docker compose up
```
**macOS**
```shell
export SELENOID_PARALLEL_SESSIONS_COUNT=$(sysctl -n hw.ncpu) && docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:rc --force && curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/docker-compose-rc.yaml && curl --output browsers.json https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/browsers.json && docker-compose up
```
**Linux**
```shell
export SELENOID_PARALLEL_SESSIONS_COUNT=$(nproc) && docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:rc --force && curl --output docker-compose.yaml https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/docker-compose-rc.yaml && curl --output browsers.json https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc/browsers.json && docker compose up
```

<details>
  <summary>Commands to install the development version</summary>
  
**Windows**
```shell
set SELENOID_PARALLEL_SESSIONS_COUNT=%NUMBER_OF_PROCESSORS%&& docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:latest --force && curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && curl.exe --output browsers.json --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/browsers.json && docker compose up
```
**macOS**
```shell
export SELENOID_PARALLEL_SESSIONS_COUNT=$(sysctl -n hw.ncpu) && docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:latest --force && curl --output docker-compose.yaml https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && curl --output browsers.json https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/browsers.json && docker-compose up
```
**Linux**
```shell
export SELENOID_PARALLEL_SESSIONS_COUNT=$(nproc) && docker rm --force jdi-qasp-ml-api && docker image rm ghcr.io/jdi-testing/jdi-qasp-ml:latest --force && curl --output docker-compose.yaml https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && curl --output browsers.json https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/browsers.json && docker compose up
```

</details>

:warning: It can take time to build the docker image, please, wait till the end of the installation.

## Working with JDN plugin

**Prerequisites**: check that the backend part is running. *The current version of the backend should be displayed in the JDN plugin tab near the front-end version: it is the easiest way to check that back-end is installed properly and connected.*

**Note**: You can launch JDN plugin in only one tab. Incognito mode is not supported yet.

### Launch JDN plugin

1. Open the page to create page objects in Chrome.
2. Navigate to DevTools by pressing Control+Shift+J (Windows, Linux, ChromeOS) or Command+Option+J (Mac).
3. Make sure DevTools has a dockside view. If not, click the vertical dots **⋮** icon at the top right and choose **Dock to left** or **Dock to right**.
4. In the top menu, click the more **»** icon and choose **JDN**.

![alt text](https://user-images.githubusercontent.com/53625116/192780907-6fdd41f4-cbbf-4335-b1fe-9db2da2f10af.png)


### Generate page objects
1. Click on the **+Page object** button.
2. Choose the library.
3. Click on the **Generate** button in the new section. 
The generation process may take some time. The locators will be generated for the website page in the active tab.
4. Edit or delete locators, if needed.
5. Check one, several, or all locators.
6. Click the **Save** button. Now, you can delete or download page objects.

### Download page objects

<img width="414" alt="jdn-download" src="https://user-images.githubusercontent.com/92522442/220601858-2c9b7f7c-c8f8-4b98-ac6e-907fb54fc0a3.png">

To download a single Page object:
1. Call the Page Object Actions Menu by clicking the three dots icon.
2. Choose the download option. Page Object will be downloaded to your computer as a Java file.

You can also copy a Page object to the clipboard.

To download all generated page objects as a project template, click the download icon at the top of the list. The project template will be downloaded as an archive.

### Manage locators

<img width="413" alt="jdn-locators" src="https://user-images.githubusercontent.com/92522442/220602083-76c1c4e1-5104-4f02-8724-c10328c5284f.png">

To manage a locator, click the three dots button next to it and choose an action:

- **Edit** - change the block type, variable name or xPath of the locator;
- **Copy** - copy to clipboard in various formats;
- **Advanced calculation** - allow more time for processing the locator. The default period is 1 second.
- **Delete** / **Restore** - delete a locator or a bunch of locators;
- **Stop**/ **Rerun** generating - stop processing if a locator is generating;
-	**Change the priority** – change the priority of a locator generating.

## FAQ
[Frequently asked questions](https://jdi-family.atlassian.net/l/cp/cV133esQ)
## Support
Support chat in [Skype](https://join.skype.com/clvyVvnZvWqc)

