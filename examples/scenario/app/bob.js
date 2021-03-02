const simulate = require('scenario-simulator')
const wire = require('_wire-protocol')
const datdot = require('_datdot')
const { pid, list } = simulate(chunk => { // terminal input
  // const [type, msg] = chunk.split(':')
  // if (type === 'something_manual1') return user.send(msg)
  // if (type === 'something_manual2') return user.send(msg)
})
if (pid === list[0]) console.log(`all users: ${list}`)
const index = list.indexOf(pid)
console.log(`i am number ${index} of ${list.length}`)
console.log(`my name is ${pid}`)
console.log('-----------------------')

bob(wire)


async function datdot (pid, wire) {
  const register = wire('user')
  const { signals: { to, from }, link } = register('_datdot.js')
  to('user')({ data: 'hello world' })
}
/**********************************************************
  BOB
**********************************************************/
function bob (wire) {
  const register = wire('root', handler)
  const { signals: { to, from }, link } = register('bob')

  const wire1 = link('_datdot')
  datdot(pid, wire1)

  // for case DATDOT and BOB:
  // 1. you can only deliver a message when the other side is available (e.g. online + subscribed)
  // 2. you can get informed about changes in availability (available or unavailable)

  const message = { type: 'ready', data: 'hello world' }
  to('_datdot')()


  /******************************************************************
    HELPERS 
  ******************************************************************/
  var buffer = []
  // drop messages sent while receiver is offline
  const off = send => { }
  // error when trying to send messages while receiver is offline
  const off = send => message => { throw new Error('receiver is offline') }
  // buffer message while receiver is offline
  const off = send => message => { buffer.push(message) }
  // ----------------------------------------------------------------
  // start/continue sending
  const on = send => send
  // vs.
  // start/continue sending + resend buffered
  const on = send => {
    for (var i = 0, len = buffer.length; i < len; i++) send(message)
    buffer = []
    return send
  }
  /*****************************************************************/
  function defaults (_on, _off) {
    _on(on)
    _off(off)
  }
  /******************************************************************
    DEFINE
  ******************************************************************/
  const send = to('_datdot', { on, off })
  // vs.
  const send = to('_datdot', defaults)
  // vs.
  const send = await to('_datdot')
  send(message)
  await to('_datdot').then(send => send(message))
  send.on(on)
  send.off(off)
  /******************************************************************
    USE
  ******************************************************************/
  var counter = 0
  setTimeout(async function dosomething () {
    counter++
    // ...do lots of stuff...
    const message = { type: 'ready', data: 'hello world' + couter++ }
    const trackid = await send(message)
    // ...do some more stuff...
    setTimeout(doSomething, 1000)
  }, 1000)





  datdot(pid, link('_datdot', handler))

  // BOBs CUSTOM BEHAVIOR - hard coded user behavior

  from('_datdot')(message => {
    if (message.type === 'ready') {
      if (pid === list[0]) {
        const message = { to: list[1] , type: 'show', data: 'hello world' }
        const msg = to(message)
        threads[msg.id] = msg
      }

      to('_datdot')({
        type: 'make_account',
        data: {
          name: 'bob',
          seedphrase: 'foo bar baz bla blu yoy',
        }
      })
    }
    if (message.type === 'account_created') {
      console.log('account_created', message)
    }
  })


}

