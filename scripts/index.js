// Slash to search
(function() {

  var activeElement = null;
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // set focus on search box when page loads
      if (request.message === 'pageLoaded') {
        if (pageHasSearchOrTextInputTypes()) {
          // page has search or text input types, setting focus
          setFocusOnPageLoad();
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
                chrome.storage.sync.get(['disabledSites', 'autofocusSites', 'clearPreviousSites', 'configs'], function(sites) {

                  var disabledSites = sites.disabledSites || [];
                  var autofocusSites = sites.autofocusSites || [];
                  var clearPreviousSites = sites.clearPreviousSites || [];

                  var searchElements = guessSearchElements(sites);
                  // console.log('searchElements guess', searchElements);
                  var domain = getDomain();

                  if (disabledSites.includes(domain)) {
                    // slash is disabled for this domain
                    return null;
                  } else {
                    // slash is enabled for this domain
                  }

                  if (autofocusSites.includes(domain) && isDomainHomepage()) {
                    // console.log('autofocusSites', autofocusSites);
                    // auto is on for this domain, setting focus
                    setFocus(searchElements);
                  }
                  var shouldClearPreviousText = clearPreviousSites.includes(domain);

                  setFocus(searchElements, shouldClearPreviousText);
                })
                // '/' clicked, setting focus

              }
            }
          });
        };

        document.addEventListener('mousedown', function (e) {
          if (e.button === 2) {
            activeElement = e.target;
          }
        });

      }
    }
  );


  chrome.runtime.onMessage.addListener(function (request) {

    if (request.message === 'configureActiveElement') {

      var activeElementName = activeElement.nodeName.toLowerCase();

      var matchingElements = Array.from(document.querySelectorAll(activeElementName));
      var elementIndex = matchingElements.indexOf(activeElement);

      var searchConfigText = `${activeElementName}Element${elementIndex}`;
      var domain = getDomain();
      chrome.storage.sync.get('configs', function (res) {

        var configs = res.configs;

        if (!configs) {
          configs = {};
        }

        if (!configs[domain]) {
          configs[domain] = [searchConfigText];
        } else {
          // remove from array if already exists
          configs[domain] = configs[domain].filter(function (item) {
            return item !== searchConfigText;
          });

          // insert at beginning of array
          configs[domain].unshift(searchConfigText);
        }

        chrome.storage.sync.set({configs: configs}, function() {});

      });
    }
  });

  function setFocusOnPageLoad() {
    chrome.storage.sync.get(['disabledSites', 'autofocusSites', 'configs'], function(sites) {
      var disabledSites = sites.disabledSites || [];
      var autofocusSites = sites.autofocusSites || [];
      var searchElements = guessSearchElements(sites);
      var domain = getDomain();

      if (disabledSites.includes(domain)) {
        // slash is disabled for this domain
        return null;
      }

      if (autofocusSites.includes(domain) && isDomainHomepage()) {
        // auto is on for this domain, setting focus
        setFocus(searchElements);
      }
    })
  }

  function setFocus(searchElements, shouldClearPreviousText = null) {
    if (!searchElements) {
      // console.log('no search elements found');
      return null;
    }
    // console.log('setFocus', searchElements, shouldClearPreviousText);
    if (searchElements) {
      for (var i = 0; i < searchElements.length; i++) {
        var searchElement = searchElements[i];
        // console.log('searchElement', searchElement);
        if (searchElement.nodeName.toLowerCase() === 'path') {
          searchElement = searchElement.parentElement.parentElement;
          // console.log('using grandparent of searchElement', searchElement);
        }
        if (searchElement.nodeName.toLowerCase() === 'svg') {
          searchElement = searchElement.parentElement;
          // console.log('using parent of searchElement', searchElement);
        }

        if (searchElement.nodeName.toLowerCase() === 'input') {
          searchElement.focus();
        } else {
          searchElement.click();
        }

        if (shouldClearPreviousText) {
          searchElement.value = '';
        }
        // console.log('active element', document.activeElement);
        // break;
        // console.log('clicked searchElement', searchElement);
        // check if focused element is editable or is a text input or text area
        let focusedElement = document.activeElement;
        let nodeName = focusedElement.nodeName.toLowerCase();
        // console.log('focusedElement', focusedElement);
        // console.log('nodeName', nodeName);
        if (
          nodeName === 'textarea'
          || nodeName === 'input'
          || focusedElement.contentEditable === true
          || focusedElement.contentEditable === 'true'
        ) {
          // if input is out of view, scroll to it
          if (focusedElement.getBoundingClientRect().top < 0) {
            window.scrollTo({left: 0, top: focusedElement.getBoundingClientRect().top, behavior: 'smooth'});
          }
          // console.log('focused element is editable', focusedElement);
          return;
        }
      }
    }
    console.log('Slash to search is not yet configured for this site');
  }

  function pageHasSearchOrTextInputTypes() {

    if (
      document.querySelector(
        `[class*=search i],
        [id*=search i],
        input[type=text],
        input[type=search]`
      )
    ) {
      return true;
    }

    return false;
  }

  function getConfiguredSearchElements(savedConfigs) {

    var domain = getDomain();

    if (savedConfigs.configs) {
      // console.log('savedConfigs.configs', savedConfigs.configs);

      // if path is configured, and we're currently on the path, use path config
      // if not, use domain config
      if (savedConfigs.configs[domain]) {
        var config = savedConfigs.configs[domain];
      }

      if (config) {
        let output = [];
        if (typeof config === 'string') {
          // this is a string config from the previous version
          // convert to array
          config = [config];
          // save new array config format back to storage
          savedConfigs.configs[domain] = config;
          chrome.storage.sync.set({configs: savedConfigs.configs}, function() {});
        }
        // for each config, return the elemment name and index
        config.forEach(function (config) {
          var configParts = config.split('Element');
          var elementName = configParts[0];
          var elementIndex = configParts[1];

          output.push(document.querySelectorAll(elementName)[ elementIndex ]);
        });

        return output;
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
  function guessSearchElements(savedConfigs) {

    var configuredElements = getConfiguredSearchElements(savedConfigs);

    var searchElement;

    var inputs = document.querySelectorAll('input[type=text], input[type=search]');

    for (var i = 0; i < inputs.length; i++) {

      if (
        inputs[i].outerHTML
        // Attempt to see if the selected input element is intended for searching
        && inputs[i].outerHTML.toLowerCase().includes('search')
      ) {
        if (
          inputs[i].offsetWidth > 0
          && inputs[i].offsetHeight > 0
        ) {

          searchElement = inputs[i];
          break;
        }
      }
    }
    if (!searchElement && configuredElements) {
      return configuredElements;
    }

    if (!configuredElements && searchElement) {

      return [searchElement];
    }

    if (configuredElements && searchElement) {
      return [...configuredElements, searchElement];
    }

    return null;
  }

  function getCurrentPath() {
    return window.location.pathname !== '/' ? window.location.pathname : '';
  }

})();
