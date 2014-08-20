#!/bin/bash

HOST='http://localhost:3001'
TASK='site_fetcher'
COUNT=-1
DELAY=1000

REQUEST=$HOST
BODY=$(cat << EOF
{"task":"$TASK","count":"$COUNT","interval":"$INTERVAL"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

