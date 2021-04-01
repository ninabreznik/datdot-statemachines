const XState = require('xstate')
const { State, Machine, interpret, assign } = XState
const service_sm = require('datdot-service-sm')
const plan = require('plan-sm')
const make_db = require('make-hyperbee')
var count = 0

module.exports = datdot_service

async function datdot_service () {
  const db = await make_db('./data/hyperbee')
  const machine = interpret(service_sm)

  .start()
  .onTransition(async (state) => {
    save_state('service', state)
    const { actions, activities, meta, events, value, context, event, _sessionid, historyValue, transitions, children } = state
    console.log('---------------------------------------------')
    console.log(
      'DATDOT-SERVICE:', 
      '| State:', value, 
      '| Actors:', context.actors ? context.actors.map(actor => actor.name) : '[]',
      '| Event:', event.type === 'xstate.update' ? event.type : event
    )
    if (event.type === 'xstate.update') { 
      save_state(event.state.context.name, JSON.stringify(event.state))
    }
  })

  const send = async (name, type) =>  {
    var entry = await db.get(name)
    if (!entry) await db.put(name, '')
    machine.send({ type, to: name })
  }

  async function save_state (key, state) {
    const jsonState = JSON.stringify(state)
    await db.put(key, jsonState)
  }

  // SCENARIO

  /* ------------------------------------
             REGISTER ACCOUNT
  --------------------------------------- */

  // send(`account-sm-${count++}`, 'account', 'user_REGISTER_ACCOUNT') // spawn SM

  /* ------------------------------------
             NEW HOSTING PLAN
  --------------------------------------- */

  send(`plan-sm-${count++}`, 'user_PUBLISH_HOSTING_PLAN') // spawn SM
  setTimeout(() => send('plan-sm-0', 'chain_PLAN_UPDATE'), 3000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_PAUSE'), 6000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_RESUME'), 9000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_END'),12000) // send event to existing SM

  /* ------------------------------------
                   JOBS
  --------------------------------------- */

  // ----- ATTEST -----
  // send('attest-setup-sm, 'chain_HOSTING_SETUP') // spawn SM

  // send('attest-storage-sm', 'chain_STORAGE_PROOF') // spawn SM

  // send(`attest-lead-performance-sm-${count++}`, 'chain_LEAD_PERFORMANCE_CHECK') // spawn SM
  // setTimeout(() => send('attest-lead-performance-sm-0', '_HOSTER_REPORT'), 5000) // send event to existing SM
  // setTimeout(() => send('attest-lead-performance-sm-0', '_ORGANIZE_PERFORMANCE_CHECK'), 5000) // send event to existing SM
  // setTimeout(() => send('attest-lead-performance-sm-0', '_SEND_REPORT'), 5000) // send event to existing SM

  // send(`attest-performance-sm-${count++}`, 'chain_PERFORMANCE_CHECK') // spawn SM
  // setTimeout(() => send('attest-performance-sm-0', '_SWARM_CHECK'), 5000) // send event to existing SM
  // setTimeout(() => send('attest-performance-sm-0', '_REPORT_REVIEW'), 10000) // send event to existing SM

  // ----- HOST -----
  // send('host-sm', 'chain_HOSTING_SETUP') // spawn SM
  // setTimeout(() => send('host-sm', 'chain_STORAGE_PROOF'), 5000) // send event to existing SM
  // setTimeout(() => send('host-sm', 'chain_PERFORMANCE_CHECK'), 5000) // send event to existing SM
  
  // ----- ENCODE -----
  // send('encode-sm', 'chain_HOSTING_SETUP') // spawn SM

}

datdot_service()
