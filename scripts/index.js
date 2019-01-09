// Slash to search
(function() {

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === 'pageLoaded') {
        if (pageHasSearchOrTextInputTypes()) {

          chrome.storage.local.get(['disabledSites', 'autofocusSites', 'clearPreviousSites'], function(sites) {

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
            document.addEventListener('keydown', e => {

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

                  // prevent slash from being added to the search box during the jump
                  e.preventDefault();

                  // '/' clicked, setting focus
                  setFocus(shouldClearPreviousText);
                }
              }
            });
          });
        }
      }
  });


  function setFocus(shouldClearPreviousText = null) {

    if (isControlledByDelegate()) {

      var searchDelegate = getSearchDelegate();
      searchDelegate.click();

    } else {

      var searchBox = getSearchBox();

      if (searchBox && searchBox.outerHTML
        // Attempt to see if the selected input element is intended for searching
        && searchBox.outerHTML.toLowerCase().includes('search')
        ) {

        if (shouldClearPreviousText) {
          searchBox.value = '';
        }


        var searchBoxValue = searchBox.value;
        var searchBoxValueLength = searchBoxValue.length || 0;

        // Jump to search box
        searchBox.focus();

        // Ensure the cursor is at the end of the text
        searchBox.setSelectionRange(searchBoxValueLength, searchBoxValueLength);
      } else {
        console.log('Slash to search does not yet support this site');
      }
    }

  }

  function pageHasSearchOrTextInputTypes() {

    if (document.querySelector('input[type=text]')
      || document.querySelector('input[type=search]')) {
      return true;
    }

    return false;
  }

  function getSearchBox() {

    var searchBoxType = getSearchBoxType();

    var boxTypeParts = searchBoxType.split('Input');
    var typeName = boxTypeParts[0];
    var typeIndex = boxTypeParts[1];

    return document.querySelectorAll(`input[type=${typeName}]`)[ typeIndex - 1 ];

  }

  function getDomain() {

    return getUrlParts()[0];

  }

  function getSearchBoxType() {

    var domain = getDomain();

    var searchBoxTypes = searchBoxTypesConfig;

    for (boxType in searchBoxTypes) {

      if (searchBoxTypes[boxType].includes(domain)) {

        return boxType;
      }
    }

    return 'textInput1';

  }

  function isDomainHomepage() {

    return !getUrlParts()[1];

  }

  function getUrlParts() {

    var url = window.location.href;
    var urlParts = url.split('//')[1].split('/');

    return urlParts;

  }

  function isControlledByDelegate() {

    return domainsControlledByDelegate.includes(getDomain());

  }

  function getSearchDelegate() {

    var delegateTypeParts = getSearchDelegateType().split('Delegate');

    var delegateType = delegateTypeParts[0];
    var delegateIndex = delegateTypeParts[1];

    return document.querySelectorAll(delegateType)[ delegateIndex - 1 ];

  }

  function getSearchDelegateType() {

    var domain = getDomain();
    var delegateTypes = delegateTypesConfig;

    for (delegateType in delegateTypes) {

      if (delegateTypes[delegateType].includes(domain)) {

        return delegateType;
      }
    }

    return 'buttonDelegate1';
  }

})();
