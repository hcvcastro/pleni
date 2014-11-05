#!/bin/bash

HOST='http://localhost:3001'
TASK='site/remove'
COUNT=${1:-1}
DELAY=1000

REQUEST=$HOST/
BODY=$(cat << EOF
{"task":"$TASK","count":"$COUNT","interval":"$INTERVAL"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

