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

    console.log('PARENT:', '| State:', state.value, '| Context:', state.context, '| Event:', state.event)
    console.log('~~~')
    console.log('Children:')
    // 'attest-0'
    const child0 = state.context.actors.filter(el => el.name === 'attest-0')[0]
    if (child0) {
      const attest0 =child0.ref
      console.log('attest-0', '| State:', attest0.state.value, '| Context:', attest0.state.context, '| event', attest0.state.event )
      if (child0.ref.state.value === 'get_encoders_and_hosters_states' && !resolved) {
        console.log('time to resolve')
        datdot_service.send({ type: 'RESOLVE', id: '0', role: 'attest' })
        resolved = true
      }
    }
    // 'attest-01
    const child1 = state.context.actors.filter(el => el.id === 'attest-1')[0]
    if (child1) {
      console.log('STATE for "attest-1" actor:', child1.ref.state.value, child1.ref.state.context )
    }
    
    await db.put('current_state', JSON.stringify(state))
  })

  .start()

  // ATTEST
  datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'attest' })
  // // ENCODE
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'encode' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'encode' })
  // // HOST
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'host' })
  // datdot_service.send({ type: 'HOSTING_SETUP', id: id++, role: 'host' })

  // datdot_service.send({ type: 'REJECT', id: '1', role: 'attest' })
  // datdot_service.send({ type: '_RETRY', id: '1', role: 'attest' })
  // datdot_service.send({ type: 'REJECT', id: '1', role: 'attest' })
  // datdot_service.send({ type: '_RETRY', id: '1', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })

  // datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  // datdot_service.send({ type: 'REJECT', id: '2', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })

}

run_state_machine()
