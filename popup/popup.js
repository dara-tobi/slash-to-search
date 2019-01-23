(function(){

  var optionEnabled = document.querySelector('#optionEnabled');
  var optionAutofocus = document.querySelector('#optionAutofocus');
  var optionClearPrevious = document.querySelector('#optionClearPrevious');


  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tab) {
    var url = tab[0].url;
    var domain = url.split('//')[1].split('/')[0];


    chrome.storage.local.get(['disabledSites', 'autofocusSites', 'clearPreviousSites'], function(sites) {

      if (sites) {
        if (sites.disabledSites && sites.disabledSites.includes(domain)) {
          optionEnabled.checked = false;
        } else {
          optionEnabled.checked = true;
        }

        if (sites.autofocusSites && sites.autofocusSites.includes(domain)) {
          optionAutofocus.checked = true;
        }

        if (sites.clearPreviousSites && sites.clearPreviousSites.includes(domain)) {
          optionClearPrevious.checked = true;
        }
      }
    });
  });



  if (optionAutofocus) {
    optionAutofocus.addEventListener('change', updateOptions);
  }

  if (optionEnabled) {
    optionEnabled.addEventListener('change', updateOptions);
  }

  if (optionClearPrevious) {
    optionClearPrevious.addEventListener('change', updateOptions);
  }

  function updateOptions(e) {

    var updatedList;
    var shouldAdd;

    switch (e.target.id) {
      case 'optionEnabled':
        updatedList = 'disabledSites';
        break;
      case 'optionAutofocus':
        updatedList = 'autofocusSites';
        break;
      case 'optionClearPrevious':
        updatedList = 'clearPreviousSites';
        break;
    }


    chrome.tabs.query({'active': true, 'currentWindow': true}, function(tab) {
      var url = tab[0].url;
      var domain = url.split('//')[1].split('/')[0];

      chrome.storage.local.get([updatedList], function(sites) {
        var list = sites[updatedList];

        if (!list) {
          list = [];
        }

        if (updatedList === 'disabledSites') {
          shouldAdd = !e.target.checked;

        } else {
          shouldAdd = e.target.checked;
        }

        if (shouldAdd) {
          if (!list.includes(domain)) {
            list.push(domain);
          }
        } else {
          if (list.includes(domain)) {
            var domainIndex = list.indexOf(domain);
            list.splice(domainIndex, 1);
          }
        }


        chrome.storage.local.set({
          [updatedList]: list
        }, function() {

        });
      });
    });

    appendReloadButton();
  }

  function appendReloadButton() {

    var reloadButton = document.querySelector('#reload-button');

    if (!reloadButton) {

      reloadButton = document.createElement('button');
      reloadButton.textContent = 'Reload to apply changes';
      reloadButton.id = 'reload-button';
      reloadButton.addEventListener('click', function() {

        chrome.tabs.reload();

        window.close();
      });


      var containerDiv = document.querySelector('.container');
      containerDiv.appendChild(reloadButton);
    }

  }
})();
