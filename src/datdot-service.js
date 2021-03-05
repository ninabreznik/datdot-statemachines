// Core logic comes here
// require apps, jobs, data and user

// require datdot-service-sm
// service triggers many parallel state machines

const XState = require('xstate')
const { Machine, interpret, assign } = XState
const datdot_service_SM = require('datdot-service-sm')
const make_db = require('make-hyperbee')

var id = 0
async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const datdot_service = interpret(datdot_service_SM)
  .onTransition(async (state) => {
    console.log('---------------------------------------------')
    console.log('PARENT STATE:', state.value)
    console.log('CHILDREN STATES')
    Object.keys(state.children).forEach(key => console.log(`${key}:`, state.children[key].state.value))
    console.log('CONTEXT:', state.context)
    // console.log('ACTIONS', JSON.stringify(state.historyValue))
    await db.put('current_state', JSON.stringify(state))
    // if (state.hosting_start) {
    //   if (state.hosting_start === 'find_last_state') host_service.send('RESOLVE')
    //   if (state.hosting_start === 'connect_toor') host_service.send('RESOLVE')
    //   if (state.hosting_start === 'receive_and_store_data') host_service.send('_RESOLVE')
    // }
    // if (state.value.hosting_start === 'connect_to_encoders_and_hosters') datdot_service.send('RESOLVE')
    // if (state.value.hosting_start) {
    //   if (state.value.hosting_start === 'get_encoders_and_hosters_states') datdot_service.send('RESOLVE')
    // }
  })

  .start();
  datdot_service.send({ type: 'SETUP', id: id++, role: 'attest' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'attest' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'attest' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'attest' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'attest' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'encode' })
  datdot_service.send({ type: 'SETUP', id: id++, role: 'encode' })

  datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '1', role: 'attest' })

  datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  datdot_service.send({ type: 'RESOLVE', id: '2', role: 'attest' })
  // datdot_service.send({ type: 'RESOLVE_ATT', key: '2'})
  // datdot_service.send('SETUP_ENCODE')
  // datdot_service.send('RESOLVE_ENC')
}

run_state_machine()
