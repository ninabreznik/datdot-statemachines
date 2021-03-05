const XState = require('xstate')
const { Machine, interpret, assign } = XState
const host_SM = require('host-sm')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const host_service = interpret(host_SM)
  .onTransition(async (State) => {
    const state = State.value
    console.log('CURRENT STATE:', state)
    await db.put('current_state', JSON.stringify(state))
    if (state === 'hosting') {
      // setTimeout(() => host_service.send('EVENT_PROOF_OF_STORAGE_REQUEST'), 2000)
      setTimeout(() => host_service.send('EVENT_HOSTING_PAUSE'), 2000)
    }
    else if (state === 'paused') {
      setTimeout(() => host_service.send('EVENT_HOSTING_RESUME'), 2000)
    }
    else if (state.hosting_pause) {
      if (state.hosting_pause === 'pause') host_service.send('_RESOLVE')
    }
    else if (state.hosting_resume) {
      if (state.hosting_resume === 'resume') host_service.send('_RESOLVE')
    }
    else if (state.hosting_pause) {
      if (state.hosting_pause === 'pause') host_service.send('_RESOLVE')
    }
    else if (state.hosting_start) {
      if (state.hosting_start === 'find_last_state') host_service.send('RESOLVE')
      if (state.hosting_start === 'connect_to_attestor') host_service.send('RESOLVE')
      if (state.hosting_start === 'receive_and_store_data') host_service.send('_RESOLVE')
    }
    else if (state.proof_of_storage) {
      if (state.proof_of_storage === 'connect_to_attestor') host_service.send('_RESOLVE')
      if (state.proof_of_storage === 'get_proof') host_service.send('_RESOLVE')
      if (state.proof_of_storage === 'send_proof') host_service.send('RESOLVE')
    }
  })

  .start();
  host_service.send('EVENT_HOSTING_START')
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
