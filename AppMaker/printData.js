// Client side script
/**
 * Makes a server call to generate PDF from questionnaire record and send a
 * link to it in an email.
 * @param {Widget} sendButton Button that triggers the action.
 */
function printData(startDate, endDate) {
    showSnackbar("Preparing to print...");
    
    var startDateFormat = startDate.getFullYear() + "-" + ("0" + (startDate.getMonth()+1)).slice(-2) + "-" + ("0" + startDate.getDate()).slice(-2) + "T00:00:00";
    var endDateFormat = endDate.getFullYear() + "-" + ("0" + (endDate.getMonth()+1)).slice(-2) + "-" + ("0" + endDate.getDate()).slice(-2) + "T23:59:59";
    console.log("Start Date: " + startDateFormat);
    console.log("End Date: " + endDateFormat);
    
    google.script.run
      .withSuccessHandler(function(pdfURL) {
        hideSnackbar();
        app.popups.ModalLoadingIndicator.visible = false;
        var win = window.open(pdfURL, '_blank');
        win.focus();
      })
      .withFailureHandler(function() {
        showSnackbar('Error occurred');
      })
      .exportDataAsPDF(startDateFormat, endDateFormat);
}


// Server side script
/**
 * Default name for temporary Docs file and actual PDF export output.
 */
var FILE_NAME = "Print database test " + Date.now();


/**
 * Default text to denote missing value.
 */
var NA_TEXT = 'N/A';


/**
 * Appends record's field as paragraph to the doc with specific formatting.
 */
function appendField_(body, record) {
  var paragraph = body.appendParagraph('');

  paragraph.appendText("Id: " + record.Id + "\n");
  paragraph.appendText("Order Date: " + record.orderDate + "\n");
  paragraph.appendText("Saleman: " + record.saleman + "\n");
  paragraph.appendText("Shop: " + record.shop + "\n");
  paragraph.appendText("State: " + record.state + "\n");
}


/**
 * Generates PDF file from the questionnaire record and return pdf link url
 */
function exportDataAsPDF(startDate, endDate) {
//   if (app.getActiveUserRoles().indexOf(app.roles.Admins) === -1) {
//     throw new Error('You don\'t have permissions to perform this operation');
//   }

  var query = app.models.Orders.newQuery();
  
  var startDateFormat = new Date(startDate);
  var endDateFormat = new Date(endDate);
  
  // Fileter data
  query.filters.orderDate._greaterThanOrEquals = startDateFormat;
  query.filters.orderDate._lessThanOrEquals = endDateFormat;
  query.sorting.orderDate._ascending();
  
  var records = query.run();
  
  var tmpDoc = DocumentApp.create(FILE_NAME + " " + Date.now());
  var body = tmpDoc.getBody();
  var title = "Boring Title";
  
  body.insertParagraph(0, title).setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  for (var i = 0; i < records.length; i++) {
    console.log("Record ID: " + records[i].Id + " Saleman: " + records[i].saleman);
    appendField_(body, records[i]);
  }
  
  tmpDoc.saveAndClose();
  
  var blob = tmpDoc.getAs(MimeType.PDF);
  var pdfFile = DriveApp.createFile(blob);
  
  Drive.Files.remove(tmpDoc.getId());
  pdfFile.setName(FILE_NAME);
  
  console.log("Create PDF success");
  
  return pdfFile.getUrl();
}