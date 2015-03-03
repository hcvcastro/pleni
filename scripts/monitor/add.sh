#!/bin/bash

HELP="$(basename "$0") [-h] [-p planner]

script for add planner in pleni monitor
where:
    -h          show this help text
    -p planner  the planner location (host:port)"

HOST='http://localhost:3003'

while getopts 'hp:' OPTION; do
    case "$OPTION" in
        h) echo "$HELP"
            exit
            ;;
        p) PLANNER=$OPTARG
            ;;
    esac
done

if [[ -z $PLANNER ]]; then
    echo "$HELP"
    exit
fi

REQUEST=$HOST/planners
BODY=$(cat << EOF
{"planner":"$PLANNER"}
EOF
)

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

