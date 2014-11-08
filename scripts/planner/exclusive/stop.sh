#!/bin/bash

HELP="$(basename "$0") [-h] [-p planner -t tid]

script for stop a exclusive task in pleni planner
where:
    -h          show this help text
    -p planner  the planner location (host:port)
    -t tid      identifier for task in planner"

HOST='http://localhost:3001'

while getopts 'hp:t:' OPTION; do
    case "$OPTION" in
        h) echo "$HELP"
            exit
            ;;
        p) HOST=$OPTARG
            ;;
        t) TID=$OPTARG
            ;;
    esac
done

if [[ -z $TID ]]
then
    echo "$HELP"
    exit
fi

REQUEST=$HOST/$TID/_stop

BODY=$(cat << EOF
{}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

