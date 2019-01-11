chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {
      message: 'pageLoaded',
    });
  }
});


chrome.contextMenus.create({
  contexts: ['editable'],
  title: 'Add this search box',
});


chrome.contextMenus.onClicked.addListener(function (info, tab) {

  chrome.tabs.sendMessage(tab.id, {
    message: 'configureActiveInput'
  }, function() {
    if (chrome.runtime.lastError) {
      // log chrome.runtime.lastError if ever necessary
    }
  });

})
