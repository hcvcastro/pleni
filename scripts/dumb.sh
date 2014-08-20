#!/bin/bash

PLANNER_HOST='http://localhost'
PLANNER_PORT=3001

REQUEST=$PLANNER_HOST:$PLANNER_PORT
BODY=$(cat << EOF
{}
EOF
)

echo $REQUEST
curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

sleep 1

curl -H 'Content-type: application/json' \
     -X POST $REQUEST/test/_run \
     -d $BODY

