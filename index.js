// Slash to search
document.addEventListener('keyup', e => {
  if (e.key === '/') {
    document.querySelector('input[type=text]').focus();
  }
});
