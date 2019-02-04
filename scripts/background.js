chrome.runtime.onInstalled.addListener(function (info) {
  if (info.reason === 'install') {
    chrome.storage.local.set({
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
    chrome.tabs.sendMessage(tabId, {
      message: 'pageLoaded',
    });
  }
});


chrome.menus.create({
  contexts: ['editable'],
  title: 'Add this search box',
  onclick: sendClickedMessage
});

chrome.menus.create({
  contexts: ["link", "page", "image"],
  title: "Add this search box trigger",
  onclick: sendClickedMessage
});


function sendClickedMessage(info, tab) {
  chrome.tabs.sendMessage(tab.id, {
    message: 'configureActiveElement',
    targetElementId: info.targetElementId,
  });
}
