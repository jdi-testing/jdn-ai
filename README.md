# Setup plugin
The current JDN version is available both in Chrome Web Store and can be installed as a client-server application.
## Download via Chrome Web Store (preferable option)
1.	Download JDN plugin: https://chrome.google.com/webstore/detail/jdn/dldagjdnndapekahhbpeemjifghccldg
2.	Turn on EPAM VPN to enable connection to a server.
3.  Use the extensions panel to open JDN

## Manual setup
It isn’t necessary if the plugin is already working. 
There are 2 independent parts, which must be installed separately

**Plugin part**
1. [Download](https://github.com/jdi-testing/jdn-ai/releases/tag/3.2.252) the latest version of plugin.
   *  For the developers team only: [Download](https://github.com/jdi-testing/jdn-ai/releases) the latest version (you need an archive named like the JDN version) as an archive (.zip file)
2. Unpack the content to any convenient place (the result folder name is “dist”)
3. Open Chrome Settings → choose option “More tools” → choose option Extensions → turn on the Developer mode → click “Load unpacked”
4. Select unpacked folder with the plugin on subfolders level (in the way that the contend as “CSS” and “Images”, don’t do it just for “dist” folder)
5. Open Chrome developer tools via F12 (fn+f12) hotkey → JDN tab should be added as the last tab at the Devtools 
![alt text]((https://user-images.githubusercontent.com/53625116/192277657-0d041d1b-a26b-495d-8ff6-9585c49e7dbf.png)

**Setup server part**
6. Setup [Docker](https://www.docker.com/products/docker-desktop)
7. Download the latest Docker Compose file from the `develop` branch and run `docker compose`
8. In _Windows 10_ can be used both, PowerShell and regular command-line, for _macOS_ native terminal can be used

*Release version*  
**macOS/Linux**
```shell
curl --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-1/docker-compose-rc-1.yaml && docker compose up
```
**Windows**
```shell
curl.exe --output docker-compose.yaml --url https://raw.githubusercontent.com/jdi-testing/jdi-qasp-ml/rc-1/docker-compose-rc-1.yaml && docker compose up
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
![alt text](https://img.icons8.com/emoji/16/000000/warning-emoji.png) Attention! It can take time to build the docker image, please, wait untill the end of the installation.

- [ ] Check that back-end part is running. *The current version of back-end should be displayed in the JDN plugin tab near the front-end version: it’s the simplest way to check that back-end is installed properly and connected.*


# Working with JDN plugin

The plugin allows generating of Page Objects with the following restrictions:
-	is applicable to the JDI framework;
-	creates xPath locators’ type;
-	works with Material UI and HTML5 websites.

![alt text](https://img.icons8.com/ios/16/000000/info--v1.png) The plugin doesn't work properly in the "dock to bottom" view. Please, use the “dockside” view.

## Page Objects
![alt text](https://user-images.githubusercontent.com/53625116/192288508-5a9c5760-04eb-4048-82ff-5118b007f6dc.png)

### Start page object generation
1. Click on the 'New page object' button.
2. Click on the "Generate" button in the new section. 
*The locators will be generated for the website page, which is opened in the active tab.*
3. The process of locators generating should be started.

### Download Page Objects
If you want to download a Page object, you should choose the download option from the Page Object Actions Menu. Page Object will be downloaded to your computer in Java format.
You can also download all generated page objects using the Quick Actions Menu at the top of the list. Page objects will be downloaded as an archive.

### Deleting Page Objects
If you want to delete a Page object with locators in it, you should choose it and click on the 'Confirm' button.  Page Object, including all locators, will be deleted from the Page Objects list.
You can also delete all Page objects using Quick Actions menu.

# Locators List
![alt text](https://user-images.githubusercontent.com/53625116/192290963-aab9c701-522e-4161-a7d2-68884dd389ed.png)


## Managing locators


* **Locator Contex menu**
  * Left Button Mouse Click - selects an object; 
  * Right Button Mouse Click - opens the context menu;

* **Locator Actions menu:**
  * actions with a specific locator - click on the menu button next to the desired locator OR hover locator and click Copy icon;
  * actions with a group of locators - select the required locators using checkboxes and use the control buttons that appeared at the top of the table.

•	Locator List Quick Actions menu.


### Actions that can be performed with locators:

- **Edit** -  you can change the block type, variable name or xPath of the locator;
- **Delete** / **Restore** - you can delete a locator or a bunch of locators;
- **Stop**/ **Rerun** generating - if a locator is generating, you can stop the process;
-	**Change the priority** – you can change the priority of a locator generating.

*Actions that are available only from the context menu:*
-	**Bring to front/back** – if you want to manage overlapped elements.

# [FAQ](https://jdi-family.atlassian.net/l/cp/cV133esQ)
