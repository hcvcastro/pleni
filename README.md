# pleni security tools

Fullstack application for deploy a servers for automatic activities related with
security and http things.

## How run

Pleni is composed of 5 independent servers: master planner, notifier, monitor,
and sites. Of which master and sites have graphic interface.

You must have installed and run the following servers:

- redis
- couchdb

```sh
git clone https://github.com/ccaballero/pleni.git
cd pleni
npm install
bower install
```

For execute master ui.

```sh
# start the sites ui
PORT=3000 node server/master.js &
```

For execute sites ui.

```sh
# start the monitor server
PORT=3003 node server/monitor.js &
# start the planner server
PORT=3001 node server/planner.io.js &
# add planner url to monitor server
sh scripts/monitor/add.sh -p http://localhost:3001
# start the sites ui
PORT=3004 node server/sites.js &
```

## Port asignation

For testing purposes, we defined the default ports for every serve in pleni.

- **3000:** master server.
- **3001:** planner/planner.io/planner.ion server.
- **3002:** notifier.io server.
- **3003:** monitor server.
- **3004:** sites server.

## How test

If you want to run the tests, you need mocha, the test needed a couchdb instance
in localhost, and webserver.

```sh
cd pleni
grunt test:master   # for testing the master ui
grunt test:planner  # for testing the planners
grunt test:notifier # for testing the notifier
grunt test:monitor  # for testing the monitor
grunt test:sites    # for testing the sites ui
grunt test          # for testing all servers
```

# More details

Pleni consists of five separate servers:

- Master server.
- Planner server.
- Notifier server.
- Monitor server.
- Sites server.

## How use the planner

There are a three differents planners.

```sh
PORT=3001 node planners/planner.js
```

or

```sh
PORT=3001 node planners/planner.io.js
```

or

```sh
PORT=3001 node planners/planner.ion.js
```

To make sure the server is started, you can make the REST request:

```sh
curl -X GET http://localhost:3001/id
```

the answer will be:

```sh
{"planner":"ready for action","type":"xxxx"}
```

Additionally, the planner can handle other kind of requests:

### Planner status

Tell us the state of the planner.

```sh
curl -X GET http://localhost:3001/_status
{"status":"stopped"}
```

### Planner API

Gives a definition of the available tasks in the planner.

```sh
curl -X GET http://localhost:3001/_api
[{"name":"exclusive","scheme":{}},{"name":"site_creator","scheme":{"host":
{"type":"string"},"dbuser":{"type":"string"},"dbpass":{"type":"string"},
"dbname":{"type":"string"},"site_url":{"type":"string"}}},{"name":
"site_fetcher","scheme":{"host":{"type":"string"},"dbuser":{"type":"string"},
"dbpass":{"type":"string"},"dbname":{"type":"string"}}}]
```

### Planner get

Gives a set task in the planner.

```sh
# 596 is the tid in planner
curl -X GET http://localhost:3001/596
```

## Available tasks

The planner have a different available tasks:

### exclusive

For hegemonize the planner, can be used as shown in the example:

```sh
cd pleni/scripts
# set the task in planner and return the tid assigned
sh planner/exclusive/set.sh -p http://localhost:3001 -c 1 -i 1000
{"ok":true,"tid":"604"}
# run the task in planner with tid assigned
sh planner/exclusive/run.sh -p http://localhost:3001 -t 604
{"status":"running"}
# stop the task in planner with tid assigned
sh planner/exclusive/stop.sh -p http://localhost:3001 -t 604
{"status":"stopped"}
# release control of the planner with tid assigned
sh planner/exclusive/delete.sh -p http://localhost:3001 -t 604
{"ok":true}
```

For more settings can use -h option in scripts.

### site/create

For creation of repository in couchdb server, can be used as shown in the
example:

```sh
cd pleni/scripts
# set the task in planner
sh planner/create/set.sh -p http://localhost:3001
{"ok":true,"tid":"672"}
# run the task in planner
sh planner/create/run.sh -p http://localhost:3001 -t 672 -s http://localhost:5984 -n google -u http://www.google.com.bo
{"status":"running"}
# release control of the planner
sh planner/create/delete.sh -p http://localhost:3001 -t 604
{"ok":true}
```

For more settings can use -h option in scripts.

### site/fetch

For fetch the pages to couchdb repository, can be used as shown in the example:

```sh
cd pleni
# set the task in planner
sh planner/fetch/set.sh -p http://localhost:3001
{"ok":true,"tid":"198"}
# run the task in planner
sh planner/fetch/run.sh -p http://localhost:3001 -t 198 -s http://localhost:5984 -n google
{"status":"running"}
# stop the task in planner
sh planner/fetch/stop.sh -p http://localhost:3001 -t 198
{"status":"stopped"}
# release control of the planner
sh planner/fetch/delete.sh -p http://localhost:301 -t 198
{"ok":true}
```

For more settings can use -h option in scripts.

