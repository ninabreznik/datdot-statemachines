#!/usr/bin/env node

if (require.main === module) {
  const log = logger('ROOT')
  log.error = logger('ROOT', 'ERROR')
  execute(log).catch(log.error)
} else module_exports()

function module_exports () {
  const [json] = process.argv.slice(2)
  const config = JSON.parse(json)
  process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
    process.exit(2)
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
    process.exit(1)
  })
  .on('warning', error => {
    const stack = error.stack
    console.error(error, `warning ${stack}`)
    // process.exit(3)
  }).stdin.on('data', (...args) => handler(...args))
  var handler = () => {}
  module.exports = listener => (handler = listener, config)
}

async function execute (log) {
  const spawn = require('cross-spawn')
  const path = require('path')

  const SCENARIOS = path.join(process.cwd(), './scenario')
  const APPS = path.join(process.cwd(), './app')
  var [scenario_name, PORT] = process.argv.slice(2)
  if (!scenario_name) return log.error('missing `scenario_name` argument')
  if (scenario_name.includes('.')) return log.error('no "." allowed in scenario_name')  

  const filename = `${scenario_name}.json`
  const filepath = path.join(SCENARIOS, filename)  
  const scenario = Object.entries(require(filepath))
  const apps = scenario.flatMap(([app, n]) => new Array(n).fill(app))

  // @NOTE: risk of more apps in scenario than free ports
  const MAX_PORT = 65535 - apps.length
  if (PORT) {
    if (!Number.isInteger(Number(PORT))) return log.error('optional `port` argument must be a number')
    // @NOTE: risk of busy ports between PORT and PORT + apps.length
    if (Number(PORT) < 0 || Number(PORT) > MAX_PORT) return log.error(`try: 0 < port < ${MAX_PORT}`)
  }
  if (!PORT) {
    // @NOTE: risk of all port < MAX_PORT busy
    do {
      PORT = await get_port()
    } while (PORT > MAX_PORT)
  }

  const list = apps.map((filename, i) => `${filename.split('.')[0]}:${Number(PORT) + i}`)
  const processes = { }
  for (var i = 0, len = apps.length; i < len; i++) {
    const filename = apps[i]
    const apppath = path.join(APPS, filename)
    const pid = list[i]
    const config = JSON.stringify({ pid, list })
    const node = spawn('node', [apppath, config], { stdio: 'pipe' })
    processes[pid] = node
    const log = logger(pid)
    log.error = logger(pid, 'ERROR')
    log.close = logger(pid, 'CLOSE')
    log.exit = logger(pid, 'EXIT')
    node.stdout.on('data', chunk => log(chunk.toString()))
    node.stderr.on('data', log.error)
    node.on('close', log.close)
    node.on('exit', log.exit)
  }
  const nodes = Object.keys(processes).reduce((nodes, k, i) => (nodes[i] = k, nodes), {})
  process.stdin.on('data', chunk => {
    // @TODO: make nested `by` and `type` transition on REPL easier
    // @TODO: color terminal output nicer
    // @TODO: on error or crash, allow easy restart/update/rollback of processes
    const [cmd = '', ...data] = chunk.toString().split('\n')[0].split(' ')
    if (cmd[0] !== '/') log('type: `/help`')
    else if (cmd === '/help') print_help()
    else {
      const num = cmd.slice(1)
      if (!nodes[num]) return log(`not a valid <node> number: ${cmd}`)
      const node = processes[nodes[num]]
      node.stdin.write(data.join(' '))
    }
  })
  print_help()
  log('----------------------------------------')
  return
  function print_help () {
    log('COMMANDS:', JSON.stringify({
      '/help': {
        args: '',
        demo: '/help',
        info: '(to see this message)',
      },
      '/<node> <text message>': {
        args: {
          '<node>': list,
          '<text message>': 'string',
        },
        demo: '/0 hello world',
        info: 'send <text message> to <node> with a process name',
      },
    }, 0, 2).slice(1).slice(0, -1))
  }
}

function logger (name, type) {
  if (type === 'EXIT') return code => {
    console.log(`[${name}]`, `${type}:\n`, `node process exited with code ${code}`)
  }
  if (type === 'CLOSE') return code => {
    console.log(`[${name}]`, `${type}:\n`, `node process close all stdio with code ${code}`)
  }
  if (type === 'ERROR') return (...args) => {
    console.error(`[${name}]`, `${type}:\n`, ...args.map(arg => arg.toString()))
  }
  return (...args) => console.log(`[${name}]`, ...args.map(arg => arg.toString()))
}
function get_port () {
  const net = require('net')
  var server = net.createServer(sock => sock.end('end'))
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port
      server.close(() => {
        server.unref()
        resolve(port)
      })
    })
  })
}