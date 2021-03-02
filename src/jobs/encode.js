const XState = require('xstate')
const { Machine, interpret, assign } = XState
const encode_SM = require('encode-state-machine')
const make_db = require('make-hyperbee')

async function run_state_machine (db, cb) {
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const encode_service = interpret(encode_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))
    if (state.value.hosting_start) {
      if (state.value.hosting_start === 'find_last_state') encode_service.send('_RESOLVE')
      if (state.value.hosting_start === 'connect_to_attestor') encode_service.send('RESOLVE')
      if (state.value.hosting_start === 'encode_data_and_send_to_attestor') encode_service.send('RESOLVE')
    }
  }).start()

  // API call for external transitions
  encode_service.send('EVENT_HOSTING_START')
  return function send (eventname) {
    const newstate = encode_service.send(eventname)
    if (notvalid(newstate)) throw Error('invalid state transition')
  }
}

// TASKS
// - compress data (encode)
// - verification
// - connect to attestor
// - send data to attestor

/////////////////////////////////////////////

// USAGE EXAMPLE

const db = await make_db()
const send = run_state_machine(db, ontransition)

send('start_encoding')
function ontransition (state) {

}

// HELPERS

// resume: () => {
//
//   if (same_attestor) { // resume (continue where you left of)
//     // already connected
//     attestorOrders() // attestor knows what is missing
//     sendMissing()
//   }
//   if (new_attestor) {
//     connect()
//     attestorOrders() // attestor asks hoster what what is missing and lets you know
//     sendMissing()
//   }
//
// }
