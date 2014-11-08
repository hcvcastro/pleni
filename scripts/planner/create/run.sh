#!/bin/bash

HELP="$(basename "$0") [-h] [-p planner -t tid -s dbhost -n dbname -u site]

script for run create task in pleni planner
where:
    -h          show this help text
    -p planner  the planner location (host:port)
    -t tid      identifier for task in planner
    -s dbhost   host for couchdb server
    -n dbname   database name for creation
    -u site     site for fetching in pleni planner"

HOST='http://localhost:3001'

while getopts 'hp:t:s:n:u:' OPTION; do
    case "$OPTION" in
        h) echo "$HELP"
            exit
            ;;
        p) HOST=$OPTARG
            ;;
        t) TID=$OPTARG
            ;;
        s) DBHOST=$OPTARG
            ;;
        n) DBNAME=$OPTARG
            ;;
        u) SITE_URL=$OPTARG
            ;;
    esac
done

if [[ -z $TID ]] || [[ -z $DBHOST ]] || [[ -z $DBNAME ]] || [[ -z $SITE_URL ]]
then
    echo "$HELP"
    exit
fi

printf  'database user: '
read DBUSER
printf 'database pass:  '
read -s DBPASS
echo

REQUEST=$HOST/$TID/_run

BODY=$(cat << EOF
{"db":{"host":"$DBHOST","name":"$DBNAME","user":"$DBUSER","pass":"$DBPASS"},"site":{"url":"$SITE_URL"}}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

