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
import os, sys
import datetime, csv

# If modifying these scopes, delete the file token.json.
SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

# The ID and range of a sample spreadsheet.
SPREADSHEET_ID = '' # <-- Enter google spreadsheet id
RANGE_FIRST_COL = '!A:A'

# Const define
FAIL_LOG = '/var/log/doorphone_fail.log'
TEMP_LOG = '/var/log/doorphone.tmp'

# Month number to string mapping
STR_MONTH_MAP = {
    1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN',
    7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'
}

# String to month number mapping
NUM_MONTH_MAP = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
    'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
}


def main():
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    global service
    today = datetime.date.today()

    # Doing authentication
    store = file.Storage('token.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('sheets', 'v4', http=creds.authorize(Http()))

    # Get logging data
    values = []
    # Read fail log if exist --> /var/log/doorphone_fail.log
    if os.path.isfile(FAIL_LOG):
        with open(FAIL_LOG, mode='r', encoding='utf-8') as csvfile:
            rows = csv.reader(csvfile)
            for row in rows:
                value = []
                for each_col in row:
                    value.append(each_col)
                if len(value) > 0:
                    values.append(value)

    # Read log file --> /var/log/doorphone.tmp
    with open(TEMP_LOG, mode='r', encoding='utf-8') as csvfile:
        rows = csv.reader(csvfile)

        for row in rows:
            if '{} {}'.format(STR_MONTH_MAP[today.month], str(today.day)).lower() in row[0].lower() \
              or '{}  {}'.format(STR_MONTH_MAP[today.month], str(today.day)).lower() in row[0].lower():
                value = [_compose_date_format(row[0][:16])]
                for each_col in row[1:-1]:
                   value.append(each_col) 
                if len(value) > 0:
                    values.append(value)

    # Separate data using year
    # Check if sheet of year exist --> if not, create new sheet of year
    try:
        # Todo: Use data to determine which year of sheet to write to
        first_cell = '{}!A1:A1'.format(today.year)
        service.spreadsheets().values().get(spreadsheetId=SPREADSHEET_ID, range=first_cell).execute()
    except Exception as e: 
        state = _add_new_sheet(SPREADSHEET_ID, str(today.year))
        # Add new sheet failed
        if not state:
            _write_fail_log(values, FAIL_LOG)
        sys.exit(11)

                
    # Write data to Google Spreadsheet
    last_row = _get_last_row(SPREADSHEET_ID, '{}{}'.format(today.year, RANGE_FIRST_COL))
    write_range = '{}!A{}:E'.format(today.year, last_row+1)

    try:
        if values != []:
            _write_values(SPREADSHEET_ID, write_range, values)
            print('Write value success')
        else:
            print('No value to write')
    except Exception as e:
        print('Exception: {}'.format(e))
        _write_fail_log(values, FAIL_LOG)
        sys.exit(11)
    else:
        if os.path.isfile(FAIL_LOG):
            os.remove(FAIL_LOG)
        


def _compose_date_format(date_string):
    """
    Change input date string with format 'Jan 7 08:59:21' --> 'YYYY-MM-DDTHH:MM:SS'
    """
    today = datetime.date.today()

    date_split = date_string.split()    # ['Jan', '7', '08:59:21']
    year = today.year
    month = NUM_MONTH_MAP[date_split[0].upper()]
    if len(date_split[1]) == 1:
        date = '0{}'.format(date_split[1])
    else:
        date = '{}'.format(date_split[1])
    record_time = date_split[2]

    ret_str = '{}-{}-{} {}'.format(year, month, date, record_time)  # YYYY-MM-DD hh:mm:ss
    return ret_str


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

    Return:
    False - Failed to add sheet
    True - Add sheet success
    """
    global service

    # Todo: Format sheet column when new sheet is created
    # Column A: Type DATE
    # Column C: Type STRING

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
    try:
        service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body=body).execute()
    except:
        return False
    else:
        return True

    
def _write_values(spreadsheet_id, def_range, values):
    """
    Write values to sheet
    """
    batch_update_values_request_body = {
        # How the input data should be interpreted.
        'value_input_option': 'USER_ENTERED',  
        # The new values to apply to the spreadsheet.
        'data': [
            {'range': def_range, 'values': values}
        ]  
    }

    request = service.spreadsheets().values().batchUpdate(spreadsheetId=spreadsheet_id, body=batch_update_values_request_body)
    response = request.execute()
    return response


def _write_fail_log(contents, filepath):
    """
    Write contents to filepath as csv file
    """
    with open(filepath, mode='w', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        for content in contents:
            writer.writerow(content)


if __name__ == '__main__':
    main()
