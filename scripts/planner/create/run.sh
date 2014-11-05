#!/bin/bash

HOST='http://localhost:3001'
TID=${1}

DBHOST='http://localhost:5984'
DBUSER='jacobian'
DBPASS='asdf'
DBNAME=${2}
SITE_URL=${3}

REQUEST=$HOST/$TID/_run
BODY=$(cat << EOF
{"db":{"host":"$DBHOST","name":$DBNAME,"user":"$DBUSER","pass":"$DBPASS"},"site":{"url":"$SITE_URL"}}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

