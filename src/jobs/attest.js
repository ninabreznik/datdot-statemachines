const XState = require('xstate')
const { Machine, interpret, assign } = XState
const attest_SM = require('attest-state-machine')
const host_SM = require('host-state-machine')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const attest_service = interpret(attest_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))

    if (state.value.hosting_start) {
      if (state.value.hosting_start === 'connect_to_encoders_and_hosters') attest_service.send('RESOLVE')
      if (state.value.hosting_start === 'get_encoders_and_hosters_states') attest_service.send('RESOLVE')
      if (state.value.hosting_start === 'data_from_encoders_to_hosters') attest_service.send('RESOLVE')
      if (state.value.hosting_start === 'submit_report') attest_service.send('_RESOLVE')
    }
  })

  .start();
  attest_service.send('EVENT_HOSTING_START')
}

run_state_machine()


/*
function connect_to_encoders_and_hosters () {
if (hosting_setup_machine.context.fresh || hosting_setup_machine.context.restart_as_new_attestor) {
connect & wait for connected = true
}
else if (hosting_setup_machine.context.resume) return connected = true
}

function connect_to_encoders_and_hosters () {
if (hosting_setup_machine.context.resume) resume
else data_from_encoders_to_hosters
}
*/
