#!/bin/bash

PLANNER_HOST='http://167.157.28.34:3001'
PLANNER_TASK='site_fetcher'
PLANNER_COUNT=1
PLANNER_DELAY=100

HOST='http://hiperborea.com.bo:5984'
DBUSER='jacobian'
DBPASS='asdf'
DBNAME='/pleni_site_cs'

# PUT for site_creator
REQUEST=$PLANNER_HOST/$PLANNER_TASK?count=$PLANNER_COUNT\&delay=$PLANNER_DELAY
BODY=$(cat << EOF
{"host":"$HOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME","req_headers":{"Cookie":"PHPSESSID=i2s2m2n0ahs6k4fvo7g81hc050"}}
EOF
)

echo $BODY

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

