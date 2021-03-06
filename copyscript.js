chrome.browserAction.onClicked.addListener(function(tabs) {

    //tab query default
    var tabQueryInfo = new Object();
    tabQueryInfo.highlighted = true;
    //window default
    var windowQueryInfo = new Object();
    windowQueryInfo.populate = true;

    //setting default options
    var snapshot = true;
    var embedTitle = false;
    var title = 'All';
    //pulling the saved options for the user browser
    chrome.storage.sync.get({
        takeSnapshot: true,
        embedTitle: false,
        useTitle: 'All'
    }, function(items) {
        snapshot = items.takeSnapshot;
        embedTitle = items.embedTitle;
        title = items.useTitle;
    });

    //gets the current tabs and runs the apropriate function based on options
    chrome.windows.getCurrent(windowQueryInfo, function(curwindow) {
        tabQueryInfo.windowId = curwindow.id;
        chrome.tabs.query(tabQueryInfo, function(items) {
            //if screenshots are required run the appropriate function. 
            if (snapshot) {
                captureImageFromTabs(items);
            } else {
                copyStringToClipboard(getFormattedLinks(items), "");
            }
        });
    });

    //Creates a string version of the link elements needed to be placed into the clipboard
    function getFormattedLinks(ourTabs) {
        console.log(ourTabs);
        var formatLinks = "";
        var defaultURL = "";
        for (tab in ourTabs) {
            //set default
            defaultURL = ("<a href=\"" + ourTabs[tab].url + "\" target=\"_blank\">" + ourTabs[tab].url + "</a>" + "<br/>");
            //initial br
            formatLinks += "<br>";

            switch (title) {
                case 'All':
                case 'Begin':
                case 'End':
                case "NoBegin":
                    //use the beginning or end of title
                    console.log(embedTitle);
                    if (embedTitle) {
                        formatLinks += ("<a href=\"" + ourTabs[tab].url + "\" target=\"_blank\">" + getFixedTitle(ourTabs[tab].title, title) + "</a>" + "<br/>");
                    } else {
                        formatLinks += (getFixedTitle(ourTabs[tab].title, title) + "<br/>");
                        formatLinks += defaultURL;
                    }
                    break;
                default:
                    formatLinks += defaultURL;
                    break;
            }

        }
        console.log(formatLinks);
        return formatLinks;
    }

    //gets the string version of the image elemnets to be placed in the clipboard
    function getFormattedImages(imgData) {

        var formatLinks = "";
        var defaultURL = "";
        for (img in imgData) {

            defaultURL = ("<img src=\"" + imgData[img] + "\" />" + "<br/>");
            formatLinks += "<br>";
            formatLinks += defaultURL;
        }
        return formatLinks;
    }

    //puts the string formats together and calls the functionality to place into clipboard
    function copyStringToClipboard(str, imgStr) {
        // Create new element
        var el = document.createElement('p');
        // Set value (string to be copied)
        el.innerHTML = (str + "<br>" + imgStr);
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = { position: 'absolute', left: '-9999px' };
        document.body.appendChild(el);
        copyHtmlToClipboard(el, (str + "<br>" + imgStr));
        console.log((str + "<br>" + imgStr));
        // Remove temporary element
        document.body.removeChild(el);
    }

    //sets HTML into the clipboard 
    function copyHtmlToClipboard(clipboardDiv, html) {
        clipboardDiv.innerHTML = html;

        var focused = document.activeElement;
        clipboardDiv.focus();

        window.getSelection().removeAllRanges();
        var range = document.createRange();
        range.setStartBefore(clipboardDiv.firstChild);
        range.setEndAfter(clipboardDiv.lastChild);
        window.getSelection().addRange(range);

        var ok = false;
        try {
            if (document.execCommand('copy')) ok = true;
            else utils.log('execCommand returned false !');
        } catch (err) {
            utils.log('execCommand failed ! exception ' + err);
        }

        focused.focus();
    }

    //used for getting the first point or last point of the title
    function getFixedTitle(oriTitle, section) {
        console.log(section);
        var newTitle = "";
        //possible splitters
        var splitters = ["-", ","];
        var useSplitter = " ";
        //loops through and checks for the splitter in the array order as priority
        for (var iii = 0; iii < splitters.length; iii++) {
            if (oriTitle.indexOf(splitters[iii]) >= 0) {
                useSplitter = splitters[iii];
                break;
            }
        }

        //Splits based on the option provided
        switch (section) {
            case "Begin":
                newTitle = oriTitle.split(useSplitter);
                newTitle = newTitle[0];
                break;
            case "End":
                newTitle = oriTitle.split(useSplitter);
                newTitle = newTitle[newTitle.length - 1];
                break;
            case "NoBegin":
                newTitle = oriTitle.split(useSplitter);
                newTitle.shift();
                newTitle = newTitle.join("-");

                break;
            default:
                //defaults to full title if no match found
                newTitle = oriTitle;
                break;
        }
        return newTitle;
    }

    //runs the reccursion function to pull the screenshots into string elements
    function captureImageFromTabs(ourTabs) {
        var originalTab = 0;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { originalTab = tabs[0]; });
        chrome.tabs.query({ highlighted: true, currentWindow: true }, function(tabs) {
            console.log("capture image info: ", tabs, " original: ", originalTab, ourTabs);
            getImgFromTab(tabs, 0, tabs.length, [], originalTab, ourTabs);
        });
    }

    //recurring function to grab the image of the screenshots and then call the clipboard function
    function getImgFromTab(tabs, curIdx, maxIdx, currentValue, oriTab, ourTabs) {

        var tempVal = currentValue;
        if (curIdx >= maxIdx) {
            copyStringToClipboard(getFormattedLinks(ourTabs), getFormattedImages(currentValue));
            chrome.tabs.update(oriTab.id, { selected: true });
        } else {
            chrome.tabs.update(tabs[curIdx].id, { selected: true });
            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.captureVisibleTab(
                    null, {},
                    function(dataUrl) {
                        console.log({ imgSrc: dataUrl });
                        tempVal.push(dataUrl);
                        console.log(tempVal);
                        return getImgFromTab(tabs, curIdx + 1, maxIdx, tempVal, oriTab, ourTabs);

                    }
                );
            });
        }
    }

});