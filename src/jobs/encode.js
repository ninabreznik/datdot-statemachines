const XState = require('xstate')
const { Machine, interpret, assign } = XState
const encode_SM = require('encode-state-machine')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const attestor_service = interpret(encode_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))
    if (state.value === 'connect_to_attestor') attestor_service.send('_RESOLVE')
    if (state.value === 'encode_data_and_send_to_attestor') attestor_service.send('_RESOLVE')
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
