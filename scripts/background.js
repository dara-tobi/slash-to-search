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
  contexts: ["link", "page"],
  title: "Add this search box trigger",
  onclick: sendClickedMessage
});


function sendClickedMessage(info, tab) {
  chrome.tabs.sendMessage(tab.id, {
    message: 'configureActiveElement',
    targetElementId: info.targetElementId,
  });
}
