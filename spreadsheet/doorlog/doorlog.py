"""
Send doorphone logging to google sheet

If your browser is on a different machine then exit and re-run this
application with the command-line parameter
    --noauth_local_webserver
"""

from __future__ import print_function
from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import datetime, csv

# If modifying these scopes, delete the file token.json.
SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

# The ID and range of a sample spreadsheet.
SPREADSHEET_ID = '' # <-- Enter google spreadsheet id
RANGE_FIRST_COL = '!A:A'

# Const define
TEMP_LOG = '/var/log/doorphone.tmp'

# Month number to string mapping
MONTH_MAP = {
    1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN',
    7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'
}


def main():
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    global service

    # Doing authentication
    store = file.Storage('token.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('sheets', 'v4', http=creds.authorize(Http()))

    # Separate data using year
    # Check if sheet of year exist --> if not, create new sheet of year
    today = datetime.date.today()
    try:
        first_cell = '{}!A1:A1'.format(today.year)
        service.spreadsheets().values().get(spreadsheetId=SPREADSHEET_ID, range=first_cell).execute()
    except: 
        _add_new_sheet(SPREADSHEET_ID, str(today.year))

    # Read log file --> /var/log/doorphone.tmp
    values = []
    with open(TEMP_LOG, mode='r', encoding='utf-8') as csvfile:
        rows = csv.reader(csvfile)

        # Todo: Fetch each entries that match todays date
        for row in rows:
            if '{} {}'.format(MONTH_MAP[today.month], str(today.day)).lower() in row[0].lower():
                value = [row[0][:16]]
                for each_col in row[1:]:
                   value.append(each_col) 
                if len(value) > 0:
                    values.append(value)
                
    # Write data to Google Spreadsheet
    last_row = _get_last_row(SPREADSHEET_ID, '{}{}'.format(today.year, RANGE_FIRST_COL))
    write_range = '{}!A{}:E'.format(today.year, last_row+1)
    # values = [[1,2,3,4,5]]

    if values != []:
        _write_values(SPREADSHEET_ID, write_range, values)
        print('Write value success')
    else:
        print('No value to write')

def _get_last_row(spreadsheet_id, def_range):
    """
    Return the last row of spreadsheet from spreadsheet_id in the defined range
    """
    global service

    request = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=def_range)
    response = request.execute()

    return len(response.get('values', []))


def _add_new_sheet(spreadsheet_id, title):
    """
    Add new sheet to spreadsheet
    """
    global service

    # Request define
    requests = []
    requests.append({
        'addSheet': {
            'properties': {
                'title': title
            }
        }
    })

    # Make request
    print(requests)
    body = {
        'requests': requests
    }
    response = service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body=body).execute()

    return response

    
def _write_values(spreadsheet_id, def_range, values):
    """
    Write values to sheet
    """
    batch_update_values_request_body = {
        # How the input data should be interpreted.
        'value_input_option': 'RAW',  
        # The new values to apply to the spreadsheet.
        'data': [
            {'range': def_range, 'values': values}
        ]  
    }

    request = service.spreadsheets().values().batchUpdate(spreadsheetId=spreadsheet_id, body=batch_update_values_request_body)
    response = request.execute()
    return response


if __name__ == '__main__':
    main()
