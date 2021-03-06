const XState = require('xstate')
const { Machine, interpret, assign } = XState
const user_SM = require('user-sm')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()
  const last_saved = await db.get('current_state')
  if (last_saved) console.log('LAST SAVED STATE:', JSON.parse(last_saved.value).value)

  const user_service = interpret(user_SM)
  .onTransition(async (state) => {
    console.log('CURRENT STATE:', state.value)
    await db.put('current_state', JSON.stringify(state))
    if (state.value === 'account_create') user_service.send('_RESOLVE')
    if (state.value === 'roles_register') user_service.send('_RESOLVE')
    if (state.value === 'publish_to_chain') user_service.send('RESOLVE')
  })

  .start();
  user_service.send('_ACCOUNT_CREATE')
}

run_state_machine()
