// Snackbar - A kind of popup that shows from the bottom of the page

/**
 * Show snackbar with text specified.
 * @param {string} text - Text to display in snackbar
 */
function showSnackbar(text) {
  var snack = app.popups.Snackbar;

  snack.properties.Text = text;
  snack.visible = true;
}
  

/** 
 * Hide showing snackbar 
 */
function hideSnackbar() {
  var snack = app.popups.Snackbar;
  snack.visible = false;
}
  