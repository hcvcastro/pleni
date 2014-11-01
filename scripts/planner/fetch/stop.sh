#!/bin/bash

HOST='http://localhost:3001'
TID=${1}

REQUEST=$HOST/$TID/_stop
BODY=$(cat << EOF
{}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

