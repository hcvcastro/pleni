#!/bin/bash

PLANNER_HOST='http://localhost:3001'
PLANNER_TASK='site_creator'
PLANNER_COUNT=1
PLANNER_DELAY=10

HOST='http://localhost:5984'
DBUSER=''
DBPASS=''
DBNAME=''
SITE_TYPE='site'
SITE_URL=''

# PUT for site_creator
REQUEST=$PLANNER_HOST/$PLANNER_TASK?count=$PLANNER_COUNT\&delay=$PLANNER_DELAY
BODY=$(cat << EOF
{"host":"$HOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME","site_type":"$SITE_TYPE","site_url":"$SITE_URL"}
EOF
)

echo $BODY

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

