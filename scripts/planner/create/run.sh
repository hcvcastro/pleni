#!/bin/bash

HOST='http://localhost:3001'
TID=${1}

DBHOST='http://localhost:5984'
DBUSER='jacobian'
DBPASS='asdf'
DBNAME=${2}
SITE_URL='http://galao.local/'

REQUEST=$HOST/$TID/_run
BODY=$(cat << EOF
{"host":"$DBHOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME","site_url":"$SITE_URL"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

