#!/bin/bash

PLANNER_HOST='http://localhost:3001'
PLANNER_TASK='site_fetcher'
PLANNER_COUNT=-1
PLANNER_DELAY=10

HOST='http://localhost:5984'
DBUSER=''
DBPASS=''
DBNAME='''

# PUT for site_creator
REQUEST=$PLANNER_HOST/$PLANNER_TASK?count=$PLANNER_COUNT\&delay=$PLANNER_DELAY
BODY=$(cat << EOF
{"host":"$HOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME"}
EOF
)

echo $BODY

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

