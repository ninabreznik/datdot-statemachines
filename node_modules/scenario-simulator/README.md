# scenario-simulator
start multiple `<appfile>.js` processes based on a `<scenario>.json` file

# define
`npm install scenario-simulator`

for example make a new project folder
```js
// <project>/package.json
{
  "private": true,
  "name": "example",
  "version": "0.0.0",
  "description": "scenario-simulator demo",
  "dependencies": {
    "scenario-simulator": "^0.0.0"
  },
  "scripts": {
    "start": "simulate"
  }
}

```

with `<project>/app/node_modules/_start.js`
```js
const firestarter = 5
module.exports = function start (index) {
  if (index === firestarter) { // e.g. to choose init logic
    console.log(`
      i am the fire starter <node ${firestarter}>
      edit logic to kick off the scenario if you want :-)`)
  }
}
```

with `<project>/app/app1.js`

```js
const start = require('_start')
const simulate = require('scenario-simulator')
const { pid, list } = simulate(chunk => {
  console.log({ message: chunk.toString() }) // e.g. { message: 'asdf' }
})
console.log({ pid, list })
// e.g.
// { pid: 'app1:34955', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }
start(list.indexOf(pid))
```

and `<project>/app/app2.js`
```js
const start = require('_start')
const simulate = require('scenario-simulator')
const { pid, list } = simulate(chunk => console.log('hello'))
start(list.indexOf(pid))
```
and a first scenario file

```js
// <project>/scenario/1.json
{
  "app1.js": 5, // amount of instances of `app1.js`
  "app2.js": 3, // amount of instances of `app2.js`
  // ...
}
```

# use
**usage** `simulate <scenario-name> [<port>]`

The following describes how to start the simulator, which launches multiple process instances according to the scenario file.
It then shows how to send messages to individual processes, which they can listen and react to.
The purpose of sending messages is to simulate local user input in one particular process. 
```bash
npm start
# [ROOT] ERROR:
#  missing `scenario_name` argument
npm start foo
# [ROOT] ERROR:
#  Error: Cannot find module '<project>/scenario/foo.json'
# Require stack:
# - <project>/node_modules/scenario-simulator/src/scenario-simulator.js
# ...
npm start 1
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app1:36659",
#         "1": "app1:36660",
#         "2": "app1:36661",
#         "3": "app1:36662",
#         "4": "app1:36663",
#         "5": "app2:36664",
#         "6": "app2:36665",
#         "7": "app2:36666"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }

# [ROOT] ----------------------------------------
# [app1:34955] { pid: 'app1:34955', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }
# [app1:34957] { pid: 'app1:34957', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }
# [app1:34956] { pid: 'app1:34956', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }
# [app1:34958] { pid: 'app1:34958', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }
# [app1:34959] { pid: 'app1:34959', list: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }

<ctrl-c>

npm start 1 foo
# [ROOT] ERROR:
#  optional `port` argument must be a number

npm start 1 999111
# [ROOT] ERROR:
#  try: 0 < port < 65534

npm start 1 9000
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app1:9000",
#         "1": "app1:9001",
#         "2": "app1:9002",
#         "3": "app1:9003",
#         "4": "app1:9004",
#         "5": "app2:9005",
#         "6": "app2:9006",
#         "7": "app2:9007"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }

# [ROOT] ----------------------------------------
# [app1:9000] { pid: 'app1:9000', list: ['app1:9000','app1:9001','app1:9002','app1:9003','app1:9004','app2:9005','app2:9006','app2:9007'] }
# [app1:9002] { pid: 'app1:9002', list: ['app1:9000','app1:9001','app1:9002','app1:9003','app1:9004','app2:9005','app2:9006','app2:9007'] }
# [app1:9001] { pid: 'app1:9001', list: ['app1:9000','app1:9001','app1:9002','app1:9003','app1:9004','app2:9005','app2:9006','app2:9007'] }
# [app1:9003] { pid: 'app1:9003', list: ['app1:9000','app1:9001','app1:9002','app1:9003','app1:9004','app2:9005','app2:9006','app2:9007'] }
# [app1:9004] { pid: 'app1:9004', list: ['app1:9000','app1:9001','app1:9002','app1:9003','app1:9004','app2:9005','app2:9006','app2:9007'] }
# [app2:45450] i am the fire starter <node 5>, edit logic to kick off the scenario if you want :-)


asdf
# [ROOT] type: `/help`

/help
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app1:9000",
#         "1": "app1:9001",
#         "2": "app1:9002",
#         "3": "app1:9003",
#         "4": "app1:9004",
#         "5": "app2:9005",
#         "6": "app2:9006",
#         "7": "app2:9007"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }

/10 asdf
# [ROOT] not a valid <node> number: /10

/0 asdf
# [app1:9000] { message: 'asdf' }

<ctrl-c>
```

# contribute
```bash
git clone https://github.com/serapath/scenario-simulator.git
cd scenario-simulator
npm install
npm link # adds itself as a global command for npm scripts
npm link scenario-simulator # installs itself as a local dependency to be requireable
npm start # follow README instructions above
# edit `./app` and `./scenario` for better testing data
```