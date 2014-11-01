# pleni tool

Fullstack application for deploy a servers for automatic activities.

## How run

```sh
git clone https://github.com/ccaballero/pleni.git
cd pleni
npm install
bower install
PORT=3000 node planner/planner.js
PORT=3001 node master/app.js
```

## How test
If you want to run the tests, you need mocha.

```sh
cd pleni
grunt test:dumb
PORT=3001 node planners/planner.js
grunt test:planner
grunt test:master
```

# more details
Pleni consists of two separate servers:

- Planner server.
- Master server.

## How use the planner
For use the planner server, you should start the server:

```sh
PORT=3001 node planners/planner.js
```

to make sure the server is started, you can make the REST request:

```sh
curl -X GET http://localhost:3001
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

### Planner api
Gives a definition of the tasks available in the planner.

```sh
curl -X GET http://localhost:3001/_api
[{"name":"exclusive","scheme":{}},{"name":"site_creator","scheme":{"host":
{"type":"string"},"dbuser":{"type":"string"},"dbpass":{"type":"string"},
"dbname":{"type":"string"},"site_url":{"type":"string"}}},{"name":
"site_fetcher","scheme":{"host":{"type":"string"},"dbuser":{"type":"string"},
"dbpass":{"type":"string"},"dbname":{"type":"string"}}}]
```

## Available tasks
The planner have a different available tasks:

### exclusive
For hegemonize the planner, can be used as shown in the example:

```sh
cd pleni
# set the task in planner
sh planner/exclusive/set.sh
{"ok":true,"tid":"604"}
# run the task in planner
sh planner/exclusive/run.sh 604
{"status":"running"}
# stop the task in planner
sh planner/exclusive/stop.sh 604
{"status":"stopped"}
# release control of the planner
sh planner/exclusive/delete.sh 604
{"ok":true}
```

### site_create
For creation of repository in couchdb server, can be used as shown in the
example:

```sh
cd pleni
# set the task in planner
sh planner/create/set.sh
{"ok":true,"tid":"672"}
# run the task in planner
sh planner/create/run.sh 672 google http://www.google.com.bo
{"status":"running"}
# release control of the planner
sh planner/create/delete.sh 604
{"ok":true}
```

### site_fetch
For fetch the pages to couchdb repository, can be used as shown in the example:

```sh
cd pleni
# set the task in planner
sh planner/fetch/set.sh
{"ok":true,"tid":"198"}
# run the task in planner
sh planner/fetch/run.sh 198 google
{"status":"running"}
# stop the task in planner
sh planner/fetch/stop.sh 198
{"status":"stopped"}
# release control of the planner
sh planner/fetch/delete.sh 198
{"ok":true}
```

