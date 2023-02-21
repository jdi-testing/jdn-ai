# JDN plugin

[JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg) is a Google Chrome extension. It helps Test Automation Engineers to create Page Objects in the test automation framework and speed up test development in test environments such as Eclipse IDE or ItelleJ IDEA.

The plugin allows generating Page Objects with the following restrictions:
-	is applicable to the JDI framework;
-	creates xPath locators’ type;
-	works with Material UI and HTML5 websites.

:warning: Before using this plugin, you will have to launch locally the backend server unless your are an EPAM employee.

**Video instructions**

You can find the video instructions on Youtube in [English](https://www.youtube.com/watch?v=b2o6R98icRU) or in [Russian](https://www.youtube.com/watch?v=FJWJjxmJUMw).

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

*If you are an EPAM employee, skip this section. Turn on EPAM VPN to enable connection to the server. In other cases, please use the instructions below.*  

1. Set up [Docker](https://www.docker.com/products/docker-desktop)  
2. Download the latest Docker Compose file from the `develop` branch and run `docker compose`  
3. On _Windows 10_, use command line; on _macOS_, use the native terminal.

**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```

<details>
  <summary>Commands to install Development version</summary>
  **macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```

</details>

![alt text](https://img.icons8.com/emoji/16/000000/warning-emoji.png) Attention! It can take time to build the docker image, please, wait till the end of the installation.

## Working with JDN plugin

**Prerequisites**: check that the backend part is running. *The current version of backend should be displayed in the JDN plugin tab near the front-end version: it is the easiest way to check that back-end is installed properly and connected.*

**Note**: You can launch JDN plugin in only one tab. Incognito mode is not supported.

### Launching JDN plugin

1. Open the page to create page objects in Chrome.
2. Navigate to DevTools by pressing Command+Option+J (Mac) or Control+Shift+J (Windows, Linux, ChromeOS).
3. Make sure DevTools has a dockside view. If not, click the vertical dots **⋮** icon at the top right and choose **Dock to left** or **Dock to right**.
4. In the top menu, click the more **»** icon and choose **JDN**.

![alt text](https://user-images.githubusercontent.com/53625116/192780907-6fdd41f4-cbbf-4335-b1fe-9db2da2f10af.png)


### Generating page objects
1. Click on the **+Page object** button.
2. Choose the library.
3. Click on the **Generate** button in the new section. 
The generation process may take some time. The locators will be generated for the website page in the active tab.
4. Edit or delete locators, if needed.
5. Check one, several or all locators.
6. Click the **Save** button. Now, you can delete or download page objects.

### Manipulating Page Objects
![alt text](https://user-images.githubusercontent.com/53625116/192288508-5a9c5760-04eb-4048-82ff-5118b007f6dc.png)


#### Download Page Objects
To download a single Page object:
1. Call the Page Object Actions Menu by clicking the three dots icon.
2. Choose the download option. Page Object will be downloaded to your computer in Java format.

To download all generated page objects, click the download icon at the top of the list. Page objects will be downloaded as an archive.

#### Delete Page Objects
To delete a Page object with locators in it:
1. Call the Page Object Actions Menu by clicking the three dots icon.
2. Choose the delete option and click on the Confirm button.  Page Object, including all locators, will be deleted from the Page Objects list.

To delete all Page objects, click the delete icon at the top of the list.

### Manupulating Locators List
![alt text](https://user-images.githubusercontent.com/53625116/192290963-aab9c701-522e-4161-a7d2-68884dd389ed.png)

#### Managing locators

* **Locator Context menu**
  * Left Button Mouse Click - selects an object
  * Right Button Mouse Click - opens the context menu

* **Locator Actions menu**
  * actions with a specific locator - click on the menu button next to the locator or hover locator and click the Copy icon;
  * actions with a group of locators - select the required locators using checkboxes and use the control buttons that appeared at the top of the table.

*	**Locator List Quick Actions menu**

#### Available actions with locators

- **Edit** -  you can change the block type, variable name or xPath of the locator;
- **Delete** / **Restore** - you can delete a locator or a bunch of locators;
- **Stop**/ **Rerun** generating - if a locator is generating, you can stop the process;
-	**Change the priority** – you can change the priority of a locator generating.

*Actions that are available only from the context menu:*
-	**Bring to front/back** – if you want to manage overlapped elements.

## [FAQ](https://jdi-family.atlassian.net/l/cp/cV133esQ)
Frequently asked questions
## Support
Support chat in [Skype](https://join.skype.com/clvyVvnZvWqc)

