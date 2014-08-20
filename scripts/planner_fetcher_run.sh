#!/bin/bash

HOST='http://localhost:3001'
TID='a24e6cdcdc67c317f9ce567a0bf3d7040066af48'

DBHOST='http://localhost:5984'
DBUSER='jacobian'
DBPASS='asdf'
DBNAME='pleni_site_test'

REQUEST=$HOST/$TID/_run
BODY=$(cat << EOF
{"host":"$DBHOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

