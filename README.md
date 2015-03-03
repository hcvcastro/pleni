# pleni toolkit

Fullstack application for deploy a servers for automatic activities related with
security and http things.

## How run

```sh
git clone https://github.com/ccaballero/pleni.git
cd pleni
npm install
bower install
PORT=3000 node master/app.js
PORT=3001 node planners/planner.io.js
```

## Port asignation
For testing purposes, we defined the default ports for every serve in pleni.

- **3000:** master server.
- **3001:** planner.io server.
- **3002:** notifier.io server.
- **3003:** sites server.
- **3004:** monitor server.
- **3005:** planner server.
- **3006:** planner.ion server.

## How test
If you want to run the tests, you need mocha, the test needed a couchdb instance
in localhost, and webserver.

```sh
cd pleni
grunt test:dumb
PORT=3001 node planners/planner.io.js
grunt test:planner  # for testing the planner
PORT=3002 node notifiers/notifier.io.js
grunt test:notifier # for testing the notifier
grunt test:master   # for testing the master control
```

# more details
Pleni consists of three separate servers:

- Planner server.
- Notifier server.
- Master server.

## How use the planner
For use the planner server, you should start the server, there are a three
differents planners.

```sh
PORT=3001 node planners/planner.js
```
or

```
PORT=3001 node planners/planner.io.js
```

or

```
PORT=3001 node planners/planner.ion.js
```

to make sure the server is started, you can make the REST request:

```sh
curl -X GET http://localhost:3001/id
```

the answer will be:

```sh
{"planner":"ready for action"}
```

additionally, the planner can handle other kind of requests:

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
cd pleni
# set the task in planner
sh planner/exclusive/set.sh -p http://localhost:3001 -c 1 -i 1000
{"ok":true,"tid":"604"}
# run the task in planner
sh planner/exclusive/run.sh -p http://localhost:3001 -t 604
{"status":"running"}
# stop the task in planner
sh planner/exclusive/stop.sh -p http://localhost:3001 -t 604
{"status":"stopped"}
# release control of the planner
sh planner/exclusive/delete.sh -p http://localhost:3001 -t 604
{"ok":true}
```

For more settings can use -h option in scripts.

### site_create
For creation of repository in couchdb server, can be used as shown in the
example:

```sh
cd pleni
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

### site_fetch
For fetch the pages to couchdb repository, can be used as shown in the example:

```sh
cd pleni
# set the task in planner
sh planner/fetch/set.sh -p http://localhost:3001
{"ok":true,"tid":"198"}
# run the task in planner
sh planner/fetch/run.sh -p http://localhost:3001 -t 198 -s http://localhost:5984
-n google
{"status":"running"}
# stop the task in planner
sh planner/fetch/stop.sh -p http://localhost:3001 -t 198
{"status":"stopped"}
# release control of the planner
sh planner/fetch/delete.sh -p http://localhost:301 -t 198
{"ok":true}
```

For more settings can use -h option in scripts.

