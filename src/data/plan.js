const XState = require('xstate')
const { Machine, interpret, assign } = XState
const plan_SM = require('plan-sm')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const plan_service = interpret(plan_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))
    if (state.value === 'subscribe') plan_service.send('_RESOLVE')
    if (state.value === 'submit_to_chain') plan_service.send('RESOLVE')
  })

  .start();
  plan_service.send('PLAN_SUBSCRIBE')
}

run_state_machine()
