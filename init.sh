#! /bin/bash
source .env
clasp login
clasp create --title ${APPNAME}
