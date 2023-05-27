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
                chrome.storage.sync.get(['disabledSites', 'clearPreviousSites', 'configs'], function(sites) {

                  var disabledSites = sites.disabledSites || [];
                  var clearPreviousSites = sites.clearPreviousSites || [];

                  var searchElements = guessSearchElements(sites);
                  var domain = getDomain();

                  if (disabledSites.includes(domain)) {
                    // slash is disabled for this domain
                    return null;
                  } else {
                    // slash is enabled for this domain
                  }

                  var shouldClearPreviousText = clearPreviousSites.includes(domain);

                  setFocus(searchElements, shouldClearPreviousText);
                })
              }
            }
          });
        };

        document.addEventListener('mousedown', function (e) {
          if (e.button === 2) {
            // on right click, set activeElement to the element that was clicked before the context menu appears
            activeElement = e.target;
          }
        });

      }
    }
  );


  chrome.runtime.onMessage.addListener(function (request) {

    if (request.message === 'configureActiveElement') {
      saveDocumentsActiveElementToConfigsForCurrentDomain();
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
      console.log('No search elements found');
      return null;
    }

    if (searchElements) {
      for (var i = 0; i < searchElements.length; i++) {
        var searchElement = searchElements[i];
        if (searchElement.nodeName.toLowerCase() === 'path') {
          searchElement = searchElement.parentElement.parentElement;
        }
        if (searchElement.nodeName.toLowerCase() === 'svg') {
          searchElement = searchElement.parentElement;
        }

        if (searchElement.nodeName.toLowerCase() === 'input') {
          searchElement.focus();
        } else {
          searchElement.click();
        }

        if (shouldClearPreviousText) {
          searchElement.value = '';
        }

        // check if focused element is editable or is a text input or text area
        let focusedElement = document.activeElement;
        let nodeName = focusedElement.nodeName.toLowerCase();

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

          // jump cursor to end of input
          searchElement.setSelectionRange(searchElement.value.length, searchElement.value.length);

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
        input[type=search],
        [action*=search]`
      )
    ) {
      return true;
    }

    return false;
  }

  function getConfiguredSearchElements(savedConfigs) {

    var domain = getDomain();

    if (savedConfigs.configs) {
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

    var inputs = document.querySelectorAll('input');

    for (var i = 0; i < inputs.length; i++) {

      if (
        inputs[i].outerHTML
        // Attempt to see if the selected input element is intended for searching
        && (getPossiblePointersThatInputIsASearchBox(inputs[i])
        )
      ) {
        if (
          inputs[i].offsetWidth > 0
          && inputs[i].offsetHeight > 0
          && inputs[i].type !== 'submit'
          && (inputs[i].contentEditable == 'true' || inputs[i].contentEditable == true || inputs[i].outerHTML.includes('search') || inputs[i].name == "q")
        ) {

          searchElement = inputs[i];
          // console.log('search element is', searchElement.outerHTML);
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

  function saveDocumentsActiveElementToConfigsForCurrentDomain() {
    if (!activeElement || !activeElement.nodeName) {
      console.log('The selected element cannot be configured as a search box');
      return;
    }

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

  function getPossiblePointersThatInputIsASearchBox(input) {

    return (input.outerHTML.toLowerCase().includes('search')
      || input.outerHTML.toLowerCase().includes('query')
      || (input.closest('form') && input.closest('form').outerHTML.toLowerCase().includes('search'))
      || (input.closest('.search')
        || input.closest('#search')
        || input.closest('.query')
        || input.closest('#query')
        || input.closest('[class*=search]')
        || input.closest('[id*=search]')
        || input.closest('[class*=query]')
        || input.closest('[id*=query]')
        || input.closest('#q')
        || input.closest('.q')
      )
    );
  }
})();
