// Client side script
var RECIEVER = "derek@ts-consultancy.com";
var SUBJECT = "請假申請通知";


/**
* Email notification content
**/
function setEmailContent(record) {
  var msg = "<!DOCTYPE html>";
  
  msg += "<html><body>";
  msg += '<p style="background-color: #110754; min-height: 64px; width: 640px; display: flex;">' + 
		   '<span style="color: white; font-size: 16px; font-weight: 600; margin: 24px 16px; width: 440px;">舉發！有人請假了！</span>' +
		   '<span style="color: white; font-size: 16px; font-weight: 500; margin: 24px 16px; width: 140px; text-align: right;">記得拉日曆喲！</span>' +
  	     '</p>';
  msg += '<p>申請人： ' + record.applicant + '</p>';
  msg += '<p>請假類別： ' + record.leavecategory + '</p>';
  msg += '<p>請假原因： ' + record.note + '</p>';
  msg += '<p>起始日： ' + record.startdate.getFullYear() + '-' + record.startdate.getMonth() + '-' + record.startdate.getDate() + record.startperiod + '</p>';
  msg += '<p>結束日： ' + record.enddate.getFullYear() + '-' + record.enddate.getMonth() + '-' + record.enddate.getDate() + record.endperiod + '</p>';
  msg += '<p>職務代理人： ' + record.agent + '</p>';
  msg += "</body></html>";
  
  return msg;
}

/**
* Sends an email message.
* @param {string} to - Message recipient
* @param {string} subject - Message subject
* @param {string} msg - Body of message (HTML from Text Editor)
*/
function sendMessage(to, subject, msg){
  google.script.run
   .withFailureHandler(function(error) {
      // An error occurred, so display an error message.
      // status.text = error.message;
    })
   .withSuccessHandler(function(result) {
     // Report that the email was sent.
     // status.text = 'Email sent...';
     //clearEmailForm();
  })
  .sendEmailMessage(to, subject, msg);
}


/**
* Notification email to admin
**/
function emailNotify(record) {
  var mailBody = setEmailContent(record);
  
  sendMessage(RECIEVER, SUBJECT, mailBody);
//   for (var i = 0; i < RECIEVER.length; i++) {
//     sendMessage(RECIEVER[i], SUBJECT, mailBody);
//   }
}


// Server side script
/**
 * Sends an email.
 * @param {string} to Email address of a recipient.
 * @param {string} subject Subject of email message.
 * @param {string} body Body of email message.
 */
function sendEmailMessage(to, subject, body) {
  var emailObj = {
    to: to,
    subject: subject,
    htmlBody: body,
    noReply: true
  };
  
  MailApp.sendEmail(emailObj);
}



