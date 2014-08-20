#!/bin/bash

HOST='http://localhost:3001'
TID='026c408a7f2f98760318e860d38a519d79fedc18'

DBHOST='http://localhost:5984'
DBUSER='jacobian'
DBPASS='asdf'
DBNAME='pleni_site_test'
SITE_URL='http://www.cs.umss.edu.bo/'

REQUEST=$HOST/$TID/_run
BODY=$(cat << EOF
{"host":"$DBHOST","dbuser":"$DBUSER","dbpass":"$DBPASS","dbname":"$DBNAME","site_url":"$SITE_URL"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

