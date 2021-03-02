// Core logic comes here
// require apps, jobs, data and user

// require datdot-service-state-machine
// service triggers many parallel state machines

const XState = require('xstate')
const { Machine, interpret, assign } = XState
const datdot_service_SM = require('datdot-service-state-machine')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const datdot_service = interpret(datdot_service_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))

    if (state.hosting_start) {
      console.log('yoo')
      if (state.hosting_start === 'find_last_state') host_service.send('RESOLVE')
      if (state.hosting_start === 'connect_to_attestor') host_service.send('RESOLVE')
      if (state.hosting_start === 'receive_and_store_data') host_service.send('_RESOLVE')
    }
    // if (state.value.hosting_start === 'connect_to_encoders_and_hosters') datdot_service.send('RESOLVE')
    // if (state.value.hosting_start) {
    //   if (state.value.hosting_start === 'get_encoders_and_hosters_states') datdot_service.send('RESOLVE')
    // }
  })

  .start();
  datdot_service.send('EVENT_HOSTING_START')
}

run_state_machine()
