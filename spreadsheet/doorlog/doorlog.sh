#!/bin/bash

tail -n 100 /var/log/doorphone.log > /var/log/doorphone.tmp

source /root/python-automate/doorlog/venv/bin/activate

cd /root/python-automate/doorlog
/root/python-automate/doorlog/venv/bin/python3.4 /root/python-automate/doorlog/main.py

deactivate

rm /var/log/doorphone.tmp
