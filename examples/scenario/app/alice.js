const simulate = require('scenario-simulator')
const datdot = require('_datdot')
const wire = require('_wire-protocol')
const { pid, list } = simulate(chunk => { // terminal input
  // const [type, msg] = chunk.split(':')
  // if (type === 'something_manual1') return user.send(msg)
  // if (type === 'something_manual2') return user.send(msg)
  console.log({ message: chunk.toString() }) // e.g. { message: 'asdf' }
})
const index = list.indexOf(pid)


if (pid === list[0]) console.log(`all users: ${list}`)
console.log(`i am number ${index} of ${list.length}`)
console.log(`my name is ${pid}`)
console.log('-----------------------')

alice(wire)
/**********************************************************
  ALICE
**********************************************************/
async function alice (wire) {
  const register = wire('root')
  const { signals: { to, from }, link } = register('alice')
  datdot(pid, link('datdot'))
}
