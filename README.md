# JDN plugin

[JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg) is a Google Chrome extension. It helps Test Automation Engineers to create Page Objects in the test automation framework and speed up test development. 

The plugin allows generating Page Objects with the following restrictions:
-	is applicable to the JDI framework;
-	creates xPath locators’ type;
-	works with Material UI and HTML5 websites.

:warning: Before using this plugin, you will have to launch locally the backend server unless your are an EPAM employee.

**Video instructions**

You can find the video instructions on Youtube in [English](https://www.youtube.com/watch?v=b2o6R98icRU) or in [Russian](https://www.youtube.com/watch?v=FJWJjxmJUMw).



## Working with JDN plugin

Prerequisites: check that the backend part is running. *The current version of backend should be displayed in the JDN plugin tab near the front-end version: it’s the simplest way to check that back-end is installed properly and connected.*

### Launching JDN plugin

1. Open the page to create page objects in Chrome.
2. Navigate to DevTools by pressing Command+Option+J (Mac) or Control+Shift+J (Windows, Linux, ChromeOS).
3. Make sure DevTools has a dockside view. If not, click the vertical dots **⋮** icon at the top right and choose **Dock to left** or **Dock to right**.
4. In the top menu, click the more **»** icon and choose **JDN**.

### Generating page objects
1. Click on the 'New page object' button.
2. Click on the "Generate" button in the new section. 
*The locators will be generated for the website page, which is opened in the active tab.*
3. The process of locators generating should be started.

### Manipulating Page Objects
![alt text](https://user-images.githubusercontent.com/53625116/192288508-5a9c5760-04eb-4048-82ff-5118b007f6dc.png)


#### Download Page Objects
If you want to download a Page object, you should choose the download option from the Page Object Actions Menu. Page Object will be downloaded to your computer in Java format.
You can also download all generated page objects using the Quick Actions Menu at the top of the list. Page objects will be downloaded as an archive.

#### Deleting Page Objects
If you want to delete a Page object with locators in it, you should choose it and click on the 'Confirm' button.  Page Object, including all locators, will be deleted from the Page Objects list.
You can also delete all Page objects using Quick Actions menu.

### Manupulating Locators List
![alt text](https://user-images.githubusercontent.com/53625116/192290963-aab9c701-522e-4161-a7d2-68884dd389ed.png)

#### Managing locators

* **Locator Context menu**
  * Left Button Mouse Click - selects an object; 
  * Right Button Mouse Click - opens the context menu;

* **Locator Actions menu**
  * actions with a specific locator - click on the menu button next to the desired locator OR hover locator and click Copy icon;
  * actions with a group of locators - select the required locators using checkboxes and use the control buttons that appeared at the top of the table.

*	**Locator List Quick Actions menu.**

#### Available actions with locators:

- **Edit** -  you can change the block type, variable name or xPath of the locator;
- **Delete** / **Restore** - you can delete a locator or a bunch of locators;
- **Stop**/ **Rerun** generating - if a locator is generating, you can stop the process;
-	**Change the priority** – you can change the priority of a locator generating.

*Actions that are available only from the context menu:*
-	**Bring to front/back** – if you want to manage overlapped elements.

## Setup plugin
The current JDN version is available both in Chrome Web Store and can be downloaded as a client-server application.
## Download via Chrome Web Store (preferable option)
1.	Install from the Store [JDN plugin](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg);
2.	If you are an EPAM employee, turn on EPAM VPN to enable connection to a server. In other cases, or If it doesn't work, please, move to the section **Manual Setup / Server part** (below)
3.  Open Chrome developer tools via *F12 (fn + F12)* hotkey → JDN tab should be added as the last tab at the Devtools   
![alt text](https://user-images.githubusercontent.com/53625116/192780907-6fdd41f4-cbbf-4335-b1fe-9db2da2f10af.png)

### Manual setup
It isn’t necessary if the plugin is working after downloading from Chrome Web Store. 
There are 2 independent parts, which must be installed separately

#### **Plugin part**
*It is recommended to use the version from [Chrome Web store](https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg).*  
1. [Download](https://github.com/jdi-testing/jdn-ai/releases?q=release) the latest release of plugin.
   *  For the developers team only: [Download](https://github.com/jdi-testing/jdn-ai/releases) the latest build (you need a .zip file named like the needed JDN version)
2. Unpack the content to any convenient place (the result folder name is “dist”)
3. Open Chrome Settings → choose option “More tools” → choose option Extensions → turn on the Developer mode → click “Load unpacked”
4. Select unpacked folder with the plugin on subfolders level (in the way that the contend as “CSS” and “Images”, don’t do it just for “dist” folder)
5. Open Chrome developer tools via F12 (fn+f12) hotkey → JDN tab should be added as the last tab at the Devtools 

#### **Server part**  
*If you are an EPAM employee, turn on EPAM VPN to enable connection to a server. In other cases, or If it doesn't work, please, use the instruction below.*  

6. Setup [Docker](https://www.docker.com/products/docker-desktop)  
7. Download the latest Docker Compose file from the `develop` branch and run `docker compose`  
8. In _Windows 10_ can be used both, PowerShell and regular command-line, for _macOS_ native terminal can be used  

*Release version*  
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-2/docker-compose-rc.yaml && docker compose up
```
*Development version*  
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/develop/docker-compose.yaml && docker compose up
```
![alt text](https://img.icons8.com/emoji/16/000000/warning-emoji.png) Attention! It can take time to build the docker image, please, wait till the end of the installation.

## [FAQ](https://jdi-family.atlassian.net/l/cp/cV133esQ)
Frequently asked questions
## Support
Support chat in [Skype](https://join.skype.com/clvyVvnZvWqc)

