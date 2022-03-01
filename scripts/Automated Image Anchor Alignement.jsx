//  Automated image anchor alignement after effect script
// Made by Loïc Durand
// Script V 1.3
// UI V 1

CreateUI(this);

function CreateUI(thisObj)
{
    $.write("\n\n\nNEW INSTANCE\n\n");
    var mainWindow = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Automated Image Anchor Alignement", undefined, {resizeable:true, closeButton: false}); // creat new window in the scriptUI instance
    
    // content of the window
    // orientation "column" put the groups below the others | orientation "row" put the groups next to each others
    content = "group{orientation:'column',\
                        folderInformation : Group{orientation:'row',\
                        folderSelectionText: StaticText{text:'Image folder'},\
                        },\
                        folderSelection : Group{orientation:'row',\
                        folderSelectionButton : Button{text:'...'},\
                        folderName : StaticText{text:''},\
                        },\
                        descripteurInformation : Group{orientation:'row',\
                        descripteurSelectionText: StaticText{text:'Descripteur file'},\
                        },\
                        descripteurSelection : Group{orientation:'row',\
                        descripteurSelectionButton: Button{text:'...'},\
                        desripteurName : StaticText{text:''},\
                        },\
                        timingInformation : Group{orientation:'row',\
                        timingSelectionText: StaticText{text:'Image duration (base 25)'},\
                        },\
                        timingSelection : Group{orientation:'row',\
                        timingTcBox : EditText{text:'00:00:00:05'},\
                        },\
                        launchScript : Group{orientation:'row',\
                        launchScriptButton: Button{text:'LAUNCH'},\
                        },\
                    }";
    mainWindow.grp = mainWindow.add(content);
    
    // resize buttons
    mainWindow.grp.folderSelection.folderSelectionButton.size = [20, 20];
    mainWindow.grp.descripteurSelection.descripteurSelectionButton.size = [20, 20];
    
    
    var imageFolder;
    var descripteurFilePath;
    var imageDuration = 0.2;
    
    mainWindow.grp.folderSelection.folderSelectionButton.onClick = function() {
        imageFolder = FolderSelection();        
        }
    
    mainWindow.grp.descripteurSelection.descripteurSelectionButton.onClick = function() {
        descripteurFilePath = DescripteurSelection();
        }

    mainWindow.grp.timingSelection.timingTcBox.onChange = function() {
        imageDuration = TimeCalculator(mainWindow.grp.timingSelection.timingTcBox.text);
        }
    
    mainWindow.grp.launchScript.launchScriptButton.onClick = function () {
        $.write("imageFolder = ", imageFolder, "\n");
        $.write("descripteurFilePath = ", descripteurFilePath, "\n");
        $.write("imageDuration = ", imageDuration, "\n");
        AnchorAlignment (imageFolder, descripteurFilePath, imageDuration);
        }
    
    
    mainWindow.layout.layout(true);
    return mainWindow;
}

function TimeCalculator(tcprompt)
{
    if (tcprompt[2] != ":" || tcprompt[5] != ":" || tcprompt[8] != ":" || tcprompt[11] != null || (tcprompt[9]+tcprompt[10]) > 25) // check TC format
        return null;   
    // get TC in second
    var timeimg = parseFloat((tcprompt[0]+tcprompt[1])*3600) + parseFloat((tcprompt[3]+tcprompt[4])*60) + parseFloat(tcprompt[6]+tcprompt[7]) + parseFloat((tcprompt[9]+tcprompt[10])*0.04);
    return timeimg;
}

function FolderSelection()
{
    // ask the user for the image folder
    var newfolder;
    if ((newfolder = Folder.selectDialog("Select your image folder")) == null)
        return null;
    return newfolder;
}

function DescripteurSelection()
{
    // ask the user for the descripteur file
    var descripteurFile;
    if ((descripteurFile = File.openDialog("Select a descripteur file","descripteurs"+"*"+".txt")) == null)
        return null;
    return descripteurFile;
}

    function AnchorAlignment(imageFolder, descripteurFilePath, imageDuration)
	{
        // if no project open, create a new project to import the files into.
        if (!app.project) 
            app.newProject();  
        var aeImageFolder = app.project.items.addFolder(imageFolder.displayName); // create new folder with select folder name
        var aeMainComp = app.project.items.addComp(imageFolder.displayName, 1920, 1080, 1, imageDuration, 25);  // create new comp with select folder name  
        
        // get descripteur file data
        var descripteurFile = File(descripteurFilePath);
        descripteurFile.open("r");
        var descripteurFileContent = descripteurFile.read();
        
        var i = 0;
        var ligne = 0;
        var logFileExist = false;
        while (descripteurFileContent[i] != null)
        {
            // get image name
            var imageName = [];      
            while(descripteurFileContent[i] != "|")
            {
                imageName[i] = descripteurFileContent[i];
                i++;
            }
            var image;
            if ((image= ImportFile(imageFolder.fullName+"/"+imageName.join(""))) != null)  // get image
            {
                image.parentFolder = aeImageFolder; // move image to folder
                var imageInComp = aeMainComp.layers.add(image); // add image to comp
            
                var anchorpoint_x = [];
                var anchorpoint_y = [];
                i++;
                var x = 0;
                var y = 0;
                // get anchor point coordinate
                while (descripteurFileContent[i] != ",")
                {
                    anchorpoint_x[x] = descripteurFileContent[i];
                    i++;
                    x++;
                }
                i++;
                while (descripteurFileContent[i] != "\n" && i <= descripteurFileContent.length)
                {
                    anchorpoint_y[y] = descripteurFileContent[i];
                    i++;
                    y++;
                }
                i++;   
                imageInComp.inPoint = imageDuration*ligne; // set image in point
                imageInComp.outPoint = imageInComp.inPoint + imageDuration; // set image out point
                imageInComp.anchorPoint.setValue([parseFloat(anchorpoint_x.join("")), parseFloat(anchorpoint_y.join(""))]); //set image anchor point
                ligne++;
            }
            else
            {
                if (logFileExist == false)
                {
                        var logFile = new File(imageFolder.fullName+encodeURI("/log.txt"));
                        logFile.open("w");
                        logFileExist = true;
                }
                logFile.write("Missing file : "+imageName.join("")+"\n");          
                while (descripteurFileContent[i] != "\n" && i <= descripteurFileContent.length) // go to next image if previous one do not exist
                    i++;
                i++;
            }
        }
        aeMainComp.duration = imageInComp.outPoint; // set comp duration
        aeMainComp.openInViewer();  // open comp in viewer
        if (logFileExist == true)
        {
            logFile.close();
            if (confirm("One or many files are missing.\nA log file with the missing image has been created in the image folder.\n\nDo you want to open it ?", true, "Missing files") == true)
                logFile.execute();
        }
        return null;        
    } 



    function ImportFile(location) 
    {
        var myImageFile = File(location);
        if (myImageFile.exists == false) // check if image exist
            return null;
        var importOptions = new ImportOptions(myImageFile);
        var footageItem = app.project.importFile(importOptions);
        return footageItem;
    }

    function canWriteFiles()
    {
    if (isSecurityPrefSet()) return true;   
    alert("The anchor alignement script requires access to write files.\n" + "Go to the \"General\" panel of the application preferences and make sure " + "\"Allow Scripts to Write Files and Access Network\" is checked.");
    app.executeCommand(2359); // show the General preference parameter window
    return isSecurityPrefSet();
    }

    function isSecurityPrefSet()
    {
        return (app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY") === 1); //check if "Allow scripts to write files and access network" is chekced
    }