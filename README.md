# JDN plugin

[JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg) is a Google Chrome extension. It helps Test Automation Engineers to create Page Objects in the test automation framework and speed up test development in test environments such as Eclipse IDE or IntelleJ IDEA.

The plugin allows generating Page Objects with the following restrictions:
-	is applicable to the JDI framework;
-	creates xPath locators’ type;
-	works with Material UI and HTML5 websites.

:warning: Before using this plugin, you will have to launch locally the backend server unless your are an EPAM employee.

**Video instructions**

You can find the video instructions on Youtube in [English](https://www.youtube.com/watch?v=b2o6R98icRU) or in [Russian](https://www.youtube.com/watch?v=FJWJjxmJUMw).

**Contents**

* [Plugin setup](#plugin-setup)
  * [Frontend setup](#frontend-setup)
  * [Server setup](#server-setup)
* [Working with JDN plugin](#working-with-jdn-plugin)
  * [Launch JDN plugin](#launch-jdn-plugin)
  * [Generate page objects](#generate-page-objects)
  * [Download page objects](#download-page-objects)
  * [Manage locators](#manage-locators)
* [FAQ](#faq)
* [Support](#support)

## Plugin setup
The current JDN version is available both in Chrome Web Store and can be downloaded as a client-server application.

### Frontend setup

1.	Install from the Store [JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg);
2.	If you are an EPAM employee, turn on EPAM VPN to enable connection to a server. In other cases, please proceed to the **Server setup** section. (below)

If the plugin does not work after downloading from Chrome Web Store, you can istall it manually.

<details>
  <summary>Instructions to set up manually</summary>
  
*It is recommended to use the version from [Chrome Web store](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg).*  
1. [Download](https://github.com/jdi-testing/jdn-ai/releases?q=release) the latest release of plugin.
   *  For the developers team only: [Download](https://github.com/jdi-testing/jdn-ai/releases) the latest build (you need a .zip file named like the needed JDN version).
2. Unpack the content to a local folder (the result folder name is `dist`).
3. Open Chrome Settings → choose option “More tools” → choose option Extensions → turn on the Developer mode → click “Load unpacked”.
4. Select the `dist` folder with the plugin on subfolders level.
5. Open Chrome developer tools via F12 (fn+f12) hotkey. The JDN tab is added as the last tab of Devtools.
</details>

### Server setup

*If you are an EPAM employee, skip this section. Turn on EPAM VPN to enable connection to the server and make sure the connection is established. In other cases, please use the instructions below.*  

1. Set up [Docker](https://www.docker.com/products/docker-desktop)  
2. Download the latest Docker Compose file from the `develop` branch and run `docker compose`  
3. On _Windows 10_, use command line; on _macOS_, use the native terminal.

**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```

<details>
  <summary>Commands to install Development version</summary>
  
**Windows**

```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```

**macOS/Linux**

```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```

</details>

![alt text](https://img.icons8.com/emoji/16/000000/warning-emoji.png) Attention! It can take time to build the docker image, please, wait till the end of the installation.

## Working with JDN plugin

**Prerequisites**: check that the backend part is running. *The current version of backend should be displayed in the JDN plugin tab near the front-end version: it is the easiest way to check that back-end is installed properly and connected.*

**Note**: You can launch JDN plugin in only one tab. Incognito mode is not supported yet.

### Launch JDN plugin

1. Open the page to create page objects in Chrome.
2. Navigate to DevTools by pressing Command+Option+J (Mac) or Control+Shift+J (Windows, Linux, ChromeOS).
3. Make sure DevTools has a dockside view. If not, click the vertical dots **⋮** icon at the top right and choose **Dock to left** or **Dock to right**.
4. In the top menu, click the more **»** icon and choose **JDN**.

![alt text](https://user-images.githubusercontent.com/53625116/192780907-6fdd41f4-cbbf-4335-b1fe-9db2da2f10af.png)


### Generate page objects
1. Click on the **+Page object** button.
2. Choose the library.
3. Click on the **Generate** button in the new section. 
The generation process may take some time. The locators will be generated for the website page in the active tab.
4. Edit or delete locators, if needed.
5. Check one, several or all locators.
6. Click the **Save** button. Now, you can delete or download page objects.

### Download page objects

<img width="414" alt="jdn-download" src="https://user-images.githubusercontent.com/92522442/220601858-2c9b7f7c-c8f8-4b98-ac6e-907fb54fc0a3.png">

To download a single Page object:
1. Call the Page Object Actions Menu by clicking the three dots icon.
2. Choose the download option. Page Object will be downloaded to your computer as a Java file.

You can also copy a Page object to clipboard.

To download all generated page objects as a project template, click the download icon at the top of the list. The project template will be downloaded as an archive.

### Manage locators

<img width="413" alt="jdn-locators" src="https://user-images.githubusercontent.com/92522442/220602083-76c1c4e1-5104-4f02-8724-c10328c5284f.png">

To manage a locator, click the thee dots button next to it and choose an action:

- **Edit** - change the block type, variable name or xPath of the locator;
- **Copy** - copy to clipboard in various formats;
- **Advanced calculation** - allow more time for processing the locator. The default period is 1 second.
- **Delete** / **Restore** - delete a locator or a bunch of locators;
- **Stop**/ **Rerun** generating - stop processing, if a locator is generating;
-	**Change the priority** – change the priority of a locator generating.

*Actions that are available only from the context menu:*
-	**Bring to front/back** – if you want to manage overlapped elements.

## FAQ
[Frequently asked questions](https://jdi-family.atlassian.net/l/cp/cV133esQ)
## Support
Support chat in [Skype](https://join.skype.com/clvyVvnZvWqc)

