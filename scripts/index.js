// Slash to search
(function() {

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === 'pageLoaded') {
        if (pageHasSearchOrTextInputTypes()) {

          chrome.storage.sync.get(['disabledSites', 'autofocusSites', 'clearPreviousSites', 'configs'], function(sites) {

            var disabledSites = sites.disabledSites || [];
            var autofocusSites = sites.autofocusSites || [];
            var clearPreviousSites = sites.clearPreviousSites || [];

            var searchElement = guessSearchElement(sites);

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

              if (searchElement) {
                searchElement.addEventListener('focus', function(e) {
                  e.target.value = '';
                });
              }
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

      var searchElement = guessSearchElement(savedConfigs);

      if (searchElement) {

        if (
            searchElement.nodeName.toLowerCase() === 'input'
            && (searchElement.type === 'search' || searchElement.type === 'text')
        ) {

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

  function getConfiguredSearchElement(savedConfigs) {

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

  // If you must change this, be very very sure...
  function guessSearchElement(savedConfigs) {

    var configuredElement = getConfiguredSearchElement(savedConfigs);

    if (
      configuredElement
      && configuredElement.nodeName.toLowerCase() === 'input'
    ) {

      return configuredElement;
    }

    var searchElement;
    var hiddenSearchExists;

    var inputs = document.querySelectorAll('input[type=text], input[type=search]');

    for (var i = 0; i < inputs.length; i++) {

      if (
        inputs[i].outerHTML
        // Attempt to see if the selected input element is intended for searching
        && inputs[i].outerHTML.toLowerCase().includes('search')
      ) {
        hiddenSearchExists = pageHasHiddenSearch(inputs, i);

        if (configuredElement && hiddenSearchExists) {

          return configuredElement;
        }

        if (
          inputs[i].offsetWidth > 0
          && inputs[i].offsetHeight > 0
        ) {

          searchElement = inputs[i];
          break;
        }
      }
    }

    return searchElement;

  }

  function getCurrentPath() {

    return window.location.pathname !== '/' ? window.location.pathname : '';
  }

  // You must be very sure before you change this too
  function pageHasHiddenSearch(inputs, i) {
    if (inputs[i].offsetHeight === 0 || inputs[i].offsetWidth === 0) {
      // Some sites have a sort of shadow input at one index, with the real input and the next index
      // Ensure that those sites aren't falsely reported as having hidden searches
      if (
        inputs[i + 1]
        && inputs[i].id === inputs[i + 1].id
        && inputs[i].className === inputs[i + 1].className
      ) {
        if (inputs[i + 1].offsetHeight !== 0 && inputs[i + 1].offsetWidth !== 0) {
          // No hidden search detected
          return false;
        }
      } else {
        // Hidden search detected
        return true;
      }
    }
  }

})();
