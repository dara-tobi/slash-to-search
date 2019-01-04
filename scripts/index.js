// Slash to search
(function() {


  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === 'pageLoaded') {

        chrome.storage.sync.get(['disabledSites', 'autofocusSites'], function(sites) {
          var disabledSites = sites.disabledSites || [];
          var autofocusSites = sites.autofocusSites || [];
          var url = window.location.href;
          var domain = url.split('//')[1].split('/')[0];
          

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
          document.addEventListener('keyup', e => {
            if (e.key === '/') {
              // '/' clicked, setting focus
              setFocus();
            }
          });
        });
      }
  });


  function setFocus() {
    document.querySelector('input[type=text]').focus();
  }  
})();
