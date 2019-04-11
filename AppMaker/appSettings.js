// Server script

/**
 * Get url of the app, and configure default settings if not already set
 * @return {Record[]} - Database record
 */
function getSettingsRecord_() {
    var newQuery = app.models.AppSettings.newQuery();
    var settingsRecords = newQuery.run();
    
    if (settingsRecords.length === 0) {
      var settingsRecord = app.models.AppSettings.newRecord();
      settingsRecord.AppUrl = ScriptApp.getService().getUrl();
      
      settingsRecord.EmailRecipient = "";
      settingsRecord.EmailSubject = "New Order Submitted";
      settingsRecord.EmailContent = "<p>New order has been sent.</p>" +
        '<p>Click <a href="<?= data.AppUrlApprove ?>" target="_blank">here</a> to view order detail.</p>';
      
      app.saveRecords([settingsRecord]);
      return [settingsRecord];
    } else {
      return settingsRecords;
    }
  }