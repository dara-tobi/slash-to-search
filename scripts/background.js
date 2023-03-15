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
  if (changeInfo.status === 'complete') {
    try {
      chrome.tabs.sendMessage(tabId, {
        message: 'pageLoaded',
      });
    } catch (error) {
      console.log('error', error);
    }
  }
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
  try {
    chrome.tabs.sendMessage(tab.id, {
      message: 'configureActiveElement'
    }, function() {
      if (chrome.runtime.lastError) {
        // log chrome.runtime.lastError if ever necessary
      }
    });
  } catch (error) {
    console.log('error', error);
  }
})
