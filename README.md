Current version of JDN plugin is client-server application with to independent parts and both parts should be installed separately.

**Setup plugin to Chrome**
* Download the last version of the plugin: https://github.com/jdi-testing/jdn/tags as archive
* Unpack the content to any convenient place
* Open Chrome Settings -> choose option 'More tools' -> choose option Extensions -> Click 'Load unpacked'
* Select unpacked folder with the plugin on subfolders level (in the way that the contend as 'CSS' and 'Images', don’t do it just for 'dist' folder)
* Open Chrome developer tools by F12 -> JDN tab should be added as the last tab at the Devtools

**Setup server part**
* Account on GitLab is essential: https://gitlab.com/users/sign_in. Register new account if it’s necessary or use existing one
* Send the email of account project data scientist Vyacheslav Fuga (skype: live:.cid.ffcd60dc4c98309 ) to get access
* Setup Docker https://www.docker.com/products/docker-desktop
* Create container using the command 
```
_docker login registry.gitlab.com
docker run -p 127.0.0.1:5000:5000/tcp -ti --rm --name jdi-ml registry.gitlab.com/vfuga/jdi-qasp-ml:latest_
```
* In Windows 10 use PowerShell instead of regular command-line interpreter, for macOS use native terminal.
* After finishing of downloading check that container is created and the number of version is displayed in JDN plugin tab.

**Prediction and pageobject downloading**

Current version of JDN plugin has two possibilities to create pageobject – 
* Using machine learning (ML)
* Using prewritten rules (test site only)
The ML part of plugin presented on its first tab – 'Auto Find Objects' tab.
* Been on 'Auto Find Objects' tab click 'Identify' button. It starts the process of prediction of active elements on the chosen page.
* The end of the process is label 'Successful' in plugin area and the markup of the elements on the page.
* Click 'Generate and Download' button to create the result file containing all predicted locators.
* If some elements were predicted wrong, you can unmark them with just simple clicking or change they type via context menu of those elements. All changes will be transferred to the result file.

**How to update version**

For updating version in package.json and manifest.json you can run 
```
  npm run patch
```
or manualy change version in this files.

Commit and push changes.

When your request has been merged, github actions will create draft of release with current package.json version tag.