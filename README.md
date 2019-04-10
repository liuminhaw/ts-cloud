# TS-Cloud code

## spreadsheet/doorlog
Write doorphone log to specific google spreadsheet  
- Set `SPREADSHEET_ID` in `doorlog.py`  
- Use `doorlog.sh` to run the program

## AppMaker
Some function codes that may be useful in AppMaker

#### copyClipboard.js
`copyTextToClipboard` - Text to be copied to clipboard

    copyTextToClipboard(text)

    @param {string} text - Text to be copied to clipboard

#### Permission.js
`hasRole` - Determines whether the user has a specific role

    hasRole(roleName)

    @param {string} roleName - Name of the role to check
    @return {boolean} - true if user has the role

`isAdmin` - Determines whether the user is admin

    isAdmin()

    @return {boolean} - true if user is an admin

#### printData.js
##### Client side script
`printData` - Make a server call to generate PDF from data records and open new tab of the PDF for printing  

    printData(startDate, endDate)

    @param {Date} startDate - Filter start date
    @param {Date} endDate - Filter end date

##### Server side script
`appendField_` - Append records field as paragraph to google document with specific formatting

    appendField_(body, record)

    @param {Body} body - The active document body section
    @param {Record[]} record - Array of records to append to document 

`exportDataAsPDF` - Generate PDF file from filtered records and return PDF url link

    exportDataAsPDF(startDate, endDate)

    @param {Date} startDate - Filter start date
    @param {Date} endDate - Filter end date
    @return {String} - URL link of the generated PDF

#### sendMail.js
##### Client side script
`setEmailContent` - Define email notification contents

    setEmailContent(record)

    @param {Record} record - Data record (Structure defined by certain model)
    @return {String} - Email content

`sendMessage` - Make a server call to send an email message

    sendMessage(to, subject, msg)

    @param {String} to - Message recipient
    @param {String} subject - Message subject
    @param {String} msg - Body of message

`emailNotify` - Send notification email to administrators

    emailNotify(record)

    @param {Record} record - Data record

##### Server side script
`sendEmailMessage` - Send an email

    sendEmailMessage(to, subject, body)

    @param {String} to - Message recipient
    @param {String} subject - Message subject
    @param {String} body - Message body

#### snackBar.js
`showSnackbar` - Show snackbar with text specified

    showSnackbar(text)

    @param {String} text - Text to display in snackbar

`hideSnackbar` - Hide showing snackbar

    hideSnackbar()

#### transaction.js
- Reference: https://developers.google.com/appmaker/scripting/server#controlling_cloudsql_transactions

`submitOrder` - Using server script to control Cloud SQL transaction

    submitOrder(orderKey)

    @param {Number} orderKey - Key value of a record in database






