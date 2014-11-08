#!/bin/bash

HELP="$(basename "$0") [-h] [-p planner -c count -i interval]

script for create pleni repositories
where:
    -h          show this help text
    -p planner  the planner location (host:port)
    -c count    the number of repetitions for the task
    -i interval the delay between each repetition"

HOST='http://localhost:3001'
TASK='site/remove'
COUNT=-1
INTERVAL=1000

while getopts 'hp:c:i:' OPTION; do
    case "$OPTION" in
        h) echo "$HELP"
            exit
            ;;
        p) HOST=$OPTARG
            ;;
        c) COUNT=$OPTARG
            ;;
        i) INTERVAL=$OPTARG
            ;;
    esac
done

REQUEST=$HOST/
BODY=$(cat << EOF
{"task":"$TASK","count":"$COUNT","interval":"$INTERVAL"}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

