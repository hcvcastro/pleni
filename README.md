# pleni tool

Fullstack application for deploy a servers for automatic activities.

## How run

> git clone https://github.com/ccaballero/pleni.git
> cd pleni
> npm install
> bower install
> PORT=3000 node planner/planner.js
> PORT=3001 node master/app.js

## How test
If you want to run the tests, you need mocha.

> cd pleni
> grunt test:dumb
> PORT=3001 node planners/planner.js
> grunt test:planner
> grunt test:master

# more details
Pleni consists of two separate servers:

- Planner server.
- Master server.

## How use the planner
For use the planner server, you should start the server:

> PORT=3001 node planners/planeer.js

to make sure the server is started, you can make the REST request:

> curl -X GET http://localhost:3001

the answer will be:

> {"planner":"ready for action"}

additionally, the planner can handle other kind of requests:

### Planner status
Tell us the state of the planner.

> curl -X GET http://localhost:3001/_status
> {"status":"stopped"}

### Planner api
Gives a definition of the tasks available in the planner.

> curl -X GET http://localhost:3001/_api
> [{"name":"exclusive","scheme":{}},{"name":"site_creator","scheme":{"host":
> {"type":"string"},"dbuser":{"type":"string"},"dbpass":{"type":"string"},
> "dbname":{"type":"string"},"site_url":{"type":"string"}}},{"name":
> "site_fetcher","scheme":{"host":{"type":"string"},"dbuser":{"type":"string"},
> "dbpass":{"type":"string"},"dbname":{"type":"string"}}}]

## Availables tasks
The planner have a different available tasks:

### exclusive
For hegemonize the planner, can be used as shown in the example:

> cd pleni
> # set the task in planner
> sh planner/exclusive/set.sh
> {"ok":true,"tid":"604"}
> # run the task in planner
> sh planner/exclusive/run.sh 604
> {"status":"running"}
> # stop the task in planner
> sh planner/exclusive/stop.sh 604
> {"status":"stopped"}
> # release control of the planner
> sh planner/exclusive/delete.sh 604
> {"ok":true}

