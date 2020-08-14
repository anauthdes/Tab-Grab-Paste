chrome.browserAction.onClicked.addListener(function(tabs) {

    //tab query default
    var tabQueryInfo = new Object();
    tabQueryInfo.highlighted = true;
    //window default
    var windowQueryInfo = new Object();
    windowQueryInfo.populate = true;
    
    //setting default options
    var snapshot = true;
    var title = 'All';
    //pulling the saved options for the user browser
    chrome.storage.sync.get({
        takeSnapshot: true,
        useTitle: 'All'
    }, function(items) {
        snapshot = items.takeSnapshot;
        title = items.useTitle;
    });
    

    chrome.windows.getCurrent(windowQueryInfo, function(curwindow) {
        console.log(curwindow);
        tabQueryInfo.windowId = curwindow.id;

        chrome.tabs.query(tabQueryInfo, function(items) {
            copyStringToClipboard(getFormattedLinks(items));
        });
    });


    function getFormattedLinks(ourTabs) {
        console.log(ourTabs);
        var formatLinks = "";
        var defaultURL = "";
        for (tab in ourTabs) {
            //set default
            defaultURL = ("<a href=\"" + ourTabs[tab].url + "\" target=\"_blank\">" + ourTabs[tab].url + "</a>" + "<br/>");
            //initial br
            formatLinks += "<br>";

            switch(title){
                case 'All':
                case 'Begin':
                case 'End':
                case "NoBegin":
                //use the beginning or end of title
                formatLinks += (getFixedTitle(ourTabs[tab].title, title) + "<br/>");
                break;
                default:
                //do nothing if no title option is selected
                break;
            }
                //default
                formatLinks += defaultURL;
            
        }
        console.log(formatLinks);
        return formatLinks;
    }

    function copyStringToClipboard(str) {
        // Create new element
        var el = document.createElement('p');
        // Set value (string to be copied)
        el.innerHTML = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = { position: 'absolute', left: '-9999px' };
        document.body.appendChild(el);
        copyHtmlToClipboard(el, str);
        console.log(str);
        // Remove temporary element
        document.body.removeChild(el);
    }

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
    function getFixedTitle(oriTitle, section){
        console.log(section);
        var newTitle = "";
        //possible splitters
        var splitters = ["-", ","];
        var useSplitter = " ";
        //loops through and checks for the splitter in the array order as priority
        for(var iii =0; iii < splitters.length; iii++){
            if(oriTitle.indexOf(splitters[iii]) >= 0){
                useSplitter = splitters[iii];
                break;
            }
        }

        //Splits based on the option provided
        switch(section){
            case "Begin":
                newTitle = oriTitle.split(useSplitter);
                newTitle = newTitle[0];
            break;
            case "End":
                newTitle = oriTitle.split(useSplitter);
                newTitle = newTitle[newTitle.length -1];
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

    function captureImageFromTabs(ourTabs){

    }

});