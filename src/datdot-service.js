const XState = require('xstate')
const { Machine, interpret, assign } = XState
const datdot_service_SM = require('datdot-service-sm')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  var id = 0
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)
  var resolved = false

  const datdot_service = interpret(datdot_service_SM)

  .onTransition(async (state) => {
    console.log('---------------------------------------------')
    console.log(
      'PARENT:', 
      '| State:', state.value, 
      '| Actors:', state.context.actors.map(actor => actor.name), 
      '| Event:', state.event
    ) 

    await db.put('current_state', JSON.stringify(state))
  })

  .start()

  // ATTEST
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // // ENCODE
  datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'encode' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'encode' })
  // // HOST
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'host' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'host' })
}

run_state_machine()
