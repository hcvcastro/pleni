#!/bin/bash

PLANNER_HOST='http://localhost'
PLANNER_PORT=3001
PLANNER_TASK='dumb'
PLANNER_COUNT=1
PLANNER_DELAY=1000

# PUT for site_creator
REQUEST=$PLANNER_HOST:$PLANNER_PORT
BODY=$(cat << EOF
{}
EOF
)

echo $REQUEST
curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

sleep 4

curl -H 'Content-type: application/json' \
     -X POST $REQUEST/test/_run \
     -d $BODY
