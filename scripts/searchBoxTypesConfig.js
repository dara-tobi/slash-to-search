/*
  For websites where the search box isn't the first text input type,
  indicate the type (<input type = 'text'> or <input type = 'search'>) of input
  and the index location (document.querySelectoryAll()[1] or document.querySelectoryAll()[2] or [3] etc)
  of the input, where the search box can be found.

  Index here isn't zero-based, i.e. if querySelector returns 0 as the index, the index indicated here is 1.

  Indicate the search box type and index in the format ${type}Input${index}.

  A single type-index combo can be found on multiple websites. A type-index combo is the object
  key for an array of all the websites where that combo can be found...
*/
var searchBoxTypesConfig = {

  searchInput1: ['medium.com', 'developer.mozilla.org'],
  textInput2: ['mail.google.com', 'www.konga.com']

};

var domainsControlledByDelegate = ['www.tunefind.com', 'www.w3schools.com'];


/*
  Similar to searchBoxTypesConfig...

  For websites where the search box is activated by clicking another element (referred to here as 'delegate'),
  indicate the delegate the type and index of the delegate
*/
var delegateTypesConfig = {

  buttonDelegate4: ['www.tunefind.com'],
  aDelegate9: ['www.w3schools.com']

};
