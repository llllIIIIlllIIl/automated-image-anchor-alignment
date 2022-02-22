//  Automated image anchor alignement after effect script
// Made by Loïc Durand
// V 1.3

AnchorAlignment();

    function AnchorAlignment()
	{
        // check if the script can write and execute the log file
        if (canWriteFiles() == false)
            return null;
        // ask the user for a folder whose contents are to be imported.
        var newfolder;
        if ((newfolder = Folder.selectDialog("Select your image folder")) == null)
            return null;
        
        // get descripteur file path
        var descripteurfilepath = newfolder.getFiles("descripteurs"+"*"+".txt");
        if (descripteurfilepath[0] == null)
        {
            if ((descripteurfilepath[0] = File.openDialog("Select a descripteur file","descripteurs"+"*"+".txt")) == null)
                return null;
        }
            
        // ask the user for a TC for the image duration
        var tcprompt;
        if ((tcprompt = prompt ("Temps de durée des images (base 25)", "00:00:01:00", "Durée images")) == null)
            return null;
            
        // convert image time in second
        var timeimg;
        while ((timeimg = TimeCalculator(tcprompt)) == null)
        {
            alert("Wrong TC format", "Wrong format", true);
            if ((tcprompt = prompt ("Temps de durée des images (base 25)", "00:00:01:00", "Durée images")) == null)
                return null;
        }    
    
        // if no project open, create a new project to import the files into.
        if (!app.project) 
            app.newProject();  
        var imgfolder = app.project.items.addFolder(newfolder.displayName); // create new folder with select folder name
        var maincomp = app.project.items.addComp(newfolder.displayName, 1920, 1080, 1, timeimg, 25);  // create new comp with select folder name  
        
        // get descripteur file data
        var descripteurfile = File(descripteurfilepath[0]);
        descripteurfile.open("r");
        var descripteurfilecontent = descripteurfile.read();
        
        var i = 0;
        var ligne = 0;
        var logFileExist = false;
        while (descripteurfilecontent[i] != null)
        {
            // get image name
            var imgname = [];      
            while(descripteurfilecontent[i] != "|")
            {
                imgname[i] = descripteurfilecontent[i];
                i++;
            }
            var image;
            if ((image= ImportFile(newfolder.fullName+"/"+imgname.join(""))) != null)  // get image
            {
                image.parentFolder = imgfolder; // move image to folder
                var imgincomp = maincomp.layers.add(image); // add image to comp
            
                var anchorpoint_x = [];
                var anchorpoint_y = [];
                i++;
                var x = 0;
                var y = 0;
                // get anchor point coordinate
                while (descripteurfilecontent[i] != ",")
                {
                    anchorpoint_x[x] = descripteurfilecontent[i];
                    i++;
                    x++;
                }
                i++;
                while (descripteurfilecontent[i] != "\n" && i <= descripteurfilecontent.length)
                {
                    anchorpoint_y[y] = descripteurfilecontent[i];
                    i++;
                    y++;
                }
                i++;   
                imgincomp.inPoint = timeimg*ligne; // set image in point
                imgincomp.outPoint = imgincomp.inPoint + timeimg; // set image out point
                imgincomp.anchorPoint.setValue([parseFloat(anchorpoint_x.join("")), parseFloat(anchorpoint_y.join(""))]); //set image anchor point
                ligne++;
            }
            else
            {
                if (logFileExist == false)
                {
                        var logFile = new File(newfolder.fullName+encodeURI("/log.txt"));
                        logFile.open("w");
                        logFileExist = true;
                }
                logFile.write("Missing file : "+imgname.join("")+"\n");          
                while (descripteurfilecontent[i] != "\n" && i <= descripteurfilecontent.length) // go to next image if previous one do not exist
                    i++;
                i++;
            }
        }
        maincomp.duration = imgincomp.outPoint; // set comp duration
        maincomp.openInViewer();  // open comp in viewer
        if (logFileExist == true)
        {
            logFile.close();
            if (confirm("One or many files are missing.\nA log file with the missing image has been created in the image folder.\n\nDo you want to open it ?", true, "Missing files") == true)
                logFile.execute();
        }
        return null;        
    } 

    function TimeCalculator(tcprompt)
    {
        if (tcprompt[2] != ":" || tcprompt[5] != ":" || tcprompt[8] != ":" || tcprompt[11] != null || (tcprompt[9]+tcprompt[10]) > 25) // check TC format
            return null;   
        // get TC in second
        var timeimg = parseFloat((tcprompt[0]+tcprompt[1])*3600) + parseFloat((tcprompt[3]+tcprompt[4])*60) + parseFloat(tcprompt[6]+tcprompt[7]) + parseFloat((tcprompt[9]+tcprompt[10])*0.04);
        return(timeimg);
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