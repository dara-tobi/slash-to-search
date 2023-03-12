(function(){

  var optionEnabled = document.querySelector('#optionEnabled');
  var optionAutofocus = document.querySelector('#optionAutofocus');
  var optionClearPrevious = document.querySelector('#optionClearPrevious');


  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tab) {
    var url = tab[0].url;
    var domain = url.split('//')[1].split('/')[0];

    chrome.storage.sync.get(['disabledSites', 'autofocusSites', 'clearPreviousSites', 'configs'], function(sites) {
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

        if (sites.configs && sites.configs[domain]) {
          console.log('sites.configs[domain]', sites.configs[domain]);
          appendClearSettingsButton(domain);
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

      chrome.storage.sync.get([updatedList], function(sites) {
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


        chrome.storage.sync.set({
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

  function appendClearSettingsButton(domain) {
    var clearSettingsButton = document.querySelector('#clear-settings-button');

    if (!clearSettingsButton) {
      clearSettingsButton = document.createElement('button');
      clearSettingsButton.textContent = 'Delete configured searches for this site';
      clearSettingsButton.id = 'clear-settings-button';
      clearSettingsButton.addEventListener('click', function() {
        chrome.storage.sync.get(['configs'], function(configs) {
          delete configs.configs[domain];

          chrome.storage.sync.set({
            configs: configs.configs
          }, function() {

          });
        });
        chrome.tabs.reload();
        window.close();
      });

      var containerDiv = document.querySelector('.container');
      containerDiv.appendChild(clearSettingsButton);
    }
  }
})();
