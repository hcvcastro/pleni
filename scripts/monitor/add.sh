#!/bin/bash

HOST='http://localhost:3004/planners'
PORT=3001

REQUEST=$HOST/
BODY=$(cat << EOF
{"planner":"http://localhost:$PORT"}
EOF
)

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

