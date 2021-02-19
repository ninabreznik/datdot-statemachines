const XState = require('xstate')
const { Machine, interpret, assign } = XState
const host_SM = require('host-state-machine')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const attestor_service = interpret(host_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))
    if (state.value.hosting_start) {
      if (state.value.hosting_start === 'connect_to_attestor') attestor_service.send('_RESOLVE')
      if (state.value.hosting_start === 'receive_and_store_data') attestor_service.send('_RESOLVE')
    }
  })

  .start();
  attestor_service.send('EVENT_HOSTING_START')
}

run_state_machine()

// HELPERS

// resume: () => {
//
//   if (same_attestor) { // resume (continue where you left of)
//     // already connected
//     receiveMissing()
//   }
//   if (new_attestor) {
//     connect()
//     tellAttestorWhatsMissing()
//     receiveMissing()
//   }
//
// }
