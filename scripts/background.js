chrome.runtime.onInstalled.addListener(function (info) {
  if (info.reason === 'install') {
    chrome.storage.sync.set({
      'autofocusSites': [
        'www.youtube.com',
        'www.aliexpress.com',
        'www.amazon.com',
        'www.jumia.com.ng',
        'www.konga.com',
        'best.aliexpress.com'
      ]
    });
  }
});

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

chrome.contextMenus.create({
  contexts: ['link', 'page'],
  title: 'Add this search box trigger',
});


chrome.contextMenus.onClicked.addListener(function (info, tab) {

  chrome.tabs.sendMessage(tab.id, {
    message: 'configureActiveElement'
  }, function() {
    if (chrome.runtime.lastError) {
      // log chrome.runtime.lastError if ever necessary
    }
  });
})
