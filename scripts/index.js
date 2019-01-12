// Slash to search
(function() {

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === 'pageLoaded') {
        if (pageHasSearchOrTextInputTypes()) {

          chrome.storage.sync.get(['disabledSites', 'autofocusSites', 'clearPreviousSites'], function(sites) {

            var disabledSites = sites.disabledSites || [];
            var autofocusSites = sites.autofocusSites || [];
            var clearPreviousSites = sites.clearPreviousSites || [];

            var domain = getDomain();

            if (disabledSites.includes(domain)) {
              // slash is disabled for this domain
              return null;
            } else {
              // slash is enabled for this domain
            }

            if (autofocusSites.includes(domain) && isDomainHomepage()) {
              // auto is on for this domain, setting focus
              setFocus();
            }

            if (clearPreviousSites.includes(domain)) {
              var shouldClearPreviousText = true;
            }

            // add slash key shortcut, regardless of autofocus
            document.addEventListener('keyup', e => {

              var activeElement = document.activeElement;
              var nodeName = activeElement.nodeName.toLowerCase();


              // Only set focus if the user isn't already inputting text
              if (
                nodeName !== 'textarea'
                && nodeName !== 'input'
                && activeElement.contentEditable !== true
                && activeElement.contentEditable !== 'true'
              ) {

                if (e.key === '/') {

                  // '/' clicked, setting focus
                  setFocus(shouldClearPreviousText);
                }
              }
            });
          });
        }
      }
  });


  chrome.runtime.onMessage.addListener(function (request) {

    if (request.message === 'configureActiveElement') {

      var activeElement = document.activeElement;
      var activeElementName = activeElement.nodeName.toLowerCase();

      var matchingElements = Array.from(document.querySelectorAll(activeElementName));
      var elementIndex = matchingElements.indexOf(activeElement);

      var searchConfigText = `${activeElementName}Element${elementIndex}`;
      var domain = getDomain();

      var currentPath = getCurrentPath();
      var pathConfig = domain + currentPath;


      chrome.storage.sync.get('configs', function (res) {

        var configs = res.configs;

        if (!configs) {
          configs = {};
        }

        if (!configs[pathConfig] || configs[pathConfig] !== searchConfigText) {
          configs[pathConfig] = searchConfigText;
        }

        chrome.storage.sync.set({configs: configs}, function() {});

      });
    }
  });


  function setFocus(shouldClearPreviousText = null) {

    chrome.storage.sync.get('configs', function (savedConfigs) {

      var searchElement = getSearchElement(savedConfigs);

      if (!searchElement) {
        var searchElement = guessSearchElement();
      }

      if (
        searchElement && searchElement.outerHTML
        // Attempt to see if the selected input element is intended for searching
        && searchElement.outerHTML.toLowerCase().includes('search')
      ) {

        if (searchElement.nodeName.toLowerCase() === 'input') {

          if (shouldClearPreviousText) {
            searchElement.value = '';
          }


          var searchBoxValue = searchElement.value;
          var searchBoxValueLength = searchBoxValue.length || 0;

          // Jump to search box
          searchElement.focus();

          // Ensure the cursor is at the end of the text
          searchElement.setSelectionRange(searchBoxValueLength, searchBoxValueLength);

        } else {
          searchElement.click();
        }

      } else {
        console.log('Slash to search is not yet configured for this site');
      }

    });

  }

  function pageHasSearchOrTextInputTypes() {

    if (document.querySelector('input[type=text]')
      || document.querySelector('input[type=search]')) {
      return true;
    }

    return false;
  }

  function getSearchElement(savedConfigs) {

    var domain = getDomain();
    var currentPath = domain + getCurrentPath();

    if (savedConfigs.configs) {

      // if path is configured, and we're currently on the path, use path config
      // if not, use domain config
      if (savedConfigs.configs[currentPath]) {
        var config = savedConfigs.configs[currentPath];

      } else if (savedConfigs.configs[domain]) {
        var config = savedConfigs.configs[domain];
      }

      if (config) {

        var configParts = config.split('Element');
        var elementName = configParts[0];
        var elementIndex = configParts[1];

        return document.querySelectorAll(elementName)[ elementIndex ];
      }
    }

  }

  function getDomain() {

    return getUrlParts()[0];

  }

  function isDomainHomepage() {

    return !getUrlParts()[1];

  }

  function getUrlParts() {

    var url = window.location.href;
    var urlParts = url.split('//')[1].split('/');

    return urlParts;

  }

  function guessSearchElement() {

    var searchElement = document.querySelector('input[type=search]');

    if (!searchElement) {
      searchElement = document.querySelector('input[type=text]');
    }

    return searchElement;

  }

  function getCurrentPath() {

    return window.location.pathname !== '/' ? window.location.pathname : '';
  }

})();
