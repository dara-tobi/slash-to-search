addNewOptionClickEventListeners();

chrome.storage.sync.get(['autofocusSites', 'clearPreviousSites', 'disabledSites'], function (sitesConfig) {

  var autofocusSites = sitesConfig.autofocusSites || [];
  var clearPreviousSites = sitesConfig.clearPreviousSites || [];
  var disabledSites = sitesConfig.disabledSites || [];


  for (listType in sitesConfig) {

    var shortName = listType.split('Sites')[0].toLowerCase();
    var newOptionInput = document.querySelector(`.${shortName}-site:last-child`);
    var div = document.querySelector(`div.${shortName}-sites`);


    for (var i = 0; i < sitesConfig[listType].length; i++) {
      createInput(listType, shortName, sitesConfig[listType], div, newOptionInput, i);
    }
  }
});

function createInput(listType, shortName, domainList, div, newOptionInput, index) {

  var input = document.createElement('input');
  var p = document.createElement('p');
  var button = document.createElement('button');


  button.addEventListener('click', removeDomain.bind(null, listType, domainList));
  button.textContent = 'x';
  button.className = 'delete-option-button';

  input.className = `${shortName}-site`;
  input.value = domainList[index];


  p.appendChild(input);
  p.appendChild(button);

  div.insertBefore(p, newOptionInput);
}

function removeDomain(listType, domainList, e) {

  var p = e.target.parentNode;
  var domain = p.children[0].value;
  var domainIndex = domainList.indexOf(domain);

  p.parentNode.removeChild(p);
  
  domainList.splice(domainIndex, 1);


  chrome.storage.sync.set({
    [listType]: domainList
  });
}

function addNewOptionClickEventListeners() {

  var newOptionButtons = document.querySelectorAll('button.new-option');

  for (var i = 0; i < newOptionButtons.length; i++) {
    newOptionButtons[i].addEventListener('click', newOptionClickEventHandler);
    newOptionButtons[i].parentNode.children[0].addEventListener('keyup', submitWithEnterKey);
  }
}

function newOptionClickEventHandler(e) {

  var p = e.target.parentNode;
  var input = p.children[0];
  var newDomain = sanitizeDomain(input.value);


  if (!newDomain) {
    input.hasError = true;
    toggleErrorState(input, 'this can\'t be left empty');

    return null;
  }

  input.hasError = false;
  toggleErrorState(input);


  var listShortName = p.className.split('-')[0];
  var listType = listShortName === 'clearprevious' ? 'clearPreviousSites' : `${listShortName}Sites`;


  chrome.storage.sync.get(listType, function(config) {

    var domainList = config[listType];

    if (!domainList) {
      domainList = [];
    }

    if (!domainList.includes(newDomain)) {

      domainList.push(newDomain);


      chrome.storage.sync.set({
        [listType]: domainList
      });


      createInput(
        listType,
        listShortName,
        domainList,
        document.querySelector(`div.${listShortName}-sites`),
        document.querySelector(`.${listShortName}-site:last-child`),
        domainList.length - 1
      );

      input.value = '';
      input.focus();
    } else {

      input.hasError = true;
      toggleErrorState(input, 'that was a duplicate');

    }
  });
}

function sanitizeDomain(url) {

  if (url.includes('//')) {
    url = url.split('//')[1];
  }

  if (url.includes('/')) {
    url = url.split('/')[0];
  }

  if (!url) {
    return false;
  }

  return url;
}

function toggleErrorState(input, errorMessage) {

  if (!input.hasError) {

    input.placeholder = 'copy and paste url here';
    input.classList.remove('has-error');

    return null;
  }

  input.value = '';
  input.classList.add('has-error');
  input.placeholder = errorMessage;
  input.focus();

}

function submitWithEnterKey(e) {

  if (e.key.toLowerCase() === 'enter') {
    var button = e.target.parentNode.children[1];
    button.click();
  }

}
