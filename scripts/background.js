chrome.runtime.onInstalled.addListener(function (info) {
  if (info.reason === 'install') {
    chrome.storage.sync.set({
      'autofocusSites': [
        'www.youtube.com',
        'www.aliexpress.com',
        'www.amazon.com',
        'www.jumia.com.ng',
        'www.konga.com',
        'best.aliexpress.com',
        'www.ebay.com',
        'www.olx.com.ng'
      ]
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  // if (changeInfo.status === 'complete') {
  //   chrome.runtime.sendMessage(tabId, {
  //     message: 'pageLoaded',
  //   });
  // }
  (async () => {
    try {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      const response = await chrome.tabs.sendMessage(tab.id, {message: "pageLoaded"});
    } catch (error) {
      console.log('error', error);
    }
  })();
});

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    id: "add-search-box",
    contexts: ['editable'],
    title: 'Add this search box',
  });

  chrome.contextMenus.create({
    id: "add-search-box-trigger",
    contexts: ['link', 'page', 'image'],
    title: 'Add this search box trigger',
  });

});



chrome.contextMenus.onClicked.addListener(function (info, tab) {
  (async () => {
    try {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      const response = await chrome.tabs.sendMessage(tab.id, {message: "configureActiveElement"});
    } catch (error) {
      console.log('error', error);
    }

  })();

  // chrome.runtime.sendMessage(tab.id, {
  //   message: 'configureActiveElement'
  // }, function() {
  //   if (chrome.runtime.lastError) {
  //     // log chrome.runtime.lastError if ever necessary
  //   }
  // });
})
