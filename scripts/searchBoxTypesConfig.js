/*
  For websites where the search box isn't the first text input type,
  indicate the type (<input type = 'text'> or <input type = 'search'>) of input
  and the index location (document.querySelectoryAll()[1] or document.querySelectoryAll()[2] or [3] etc)
  of the input, where the search box can be found.

  Indicate the search box type and index in the format ${type}Input${Index}.

  A single type-index combo can be found on multiple websites. A type-index combo is the object
  key for an array of all the websites where that combo can be found...
*/
var searchBoxTypesConfig = {

  searchInput1: ['medium.com'],
  textInput2: ['mail.google.com', 'www.konga.com']

};
