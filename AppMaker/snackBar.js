// Snack

/**
 * Shows snackbar with text specified.
 * @param {string} text Text to display.
 */
function showSnackbar(text) {
    var snack = app.popups.Snackbar;
  
    snack.properties.Text = text;
    snack.visible = true;
  }
  
  function hideSnackbar() {
    var snack = app.popups.Snackbar;
    snack.visible = false;
  }
  