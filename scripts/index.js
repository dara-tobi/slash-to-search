// Slash to search
(function() {

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (request.message === 'pageLoaded') {
        if (pageHasSearchOrTextInputTypes()) {

          chrome.storage.local.get(['disabledSites', 'autofocusSites'], function(sites) {

            var disabledSites = sites.disabledSites || [];
            var autofocusSites = sites.autofocusSites || [];

            var domain = getDomain();

            if (disabledSites.includes(domain)) {
              // slash is disabled for this domain
              return null;
            } else {
              // slash is enabled for this domain
            }

            if (autofocusSites.includes(domain)) {
              // auto is on for this domain, setting focus
              setFocus();
            }

            // add slash key shortcut, regardless of autofocus
            document.addEventListener('keydown', e => {

              if (e.key === '/') {

                if (document.activeElement.nodeName.toLowerCase() !== 'input') {

                  // prevent slash from being added to the search box during the jump
                  e.preventDefault();
                }

                // '/' clicked, setting focus
                setFocus();
              }
            });
          });
        }
      }
  });


  function setFocus() {

    var searchBox = getSearchBox();

    var searchBoxValue = searchBox.value;
    var searchBoxValueLength = searchBoxValue.length || 0;

    // Jump to search box
    searchBox.focus();

    // Ensure the cursor is at the end of the text
    searchBox.setSelectionRange(searchBoxValueLength, searchBoxValueLength);

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

    var url = window.location.href;
    return url.split('//')[1].split('/')[0];

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
})();
