#!/bin/bash

HELP="$(basename "$0") [-h] [-p planner]

script for add planner in pleni monitor
where:
    -h          show this help text
    -p planner  the planner location (host:port)
    -m monitor  the monitor location (host:port)"

while getopts 'hp:m:' OPTION; do
    case "$OPTION" in
        h) echo "$HELP"
            exit
            ;;
        p) PLANNER=$OPTARG
            ;;
        m) MONITOR=$OPTARG
            ;;
    esac
done

if [[ -z $PLANNER ]] || [[ -z $MONITOR ]]
then
    echo "$HELP"
    exit
fi

REQUEST=$MONITOR/planners
BODY=$(cat << EOF
{"planner":"$PLANNER"}
EOF
)

curl -H 'Content-type: application/json' \
     -X PUT $REQUEST \
     -d $BODY

