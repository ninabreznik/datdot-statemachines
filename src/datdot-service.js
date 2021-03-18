const XState = require('xstate')
const { Machine, interpret, assign } = XState
const datdot_service_SM = require('datdot-service-sm')
const make_db = require('make-hyperbee')

async function run_state_machine () {
  const db = await make_db()

  const service = interpret(datdot_service_SM)
  .onTransition(async (state) => {
    console.log('---------------------------------------------')
    console.log(
      'PARENT:', 
      '| State:', state.value, 
      '| Actors:', state.context.actors ? state.context.actors.map(actor => actor.name) : '[]',
      '| Event:', state.event,
      // state.context.actors

    )

  })
  .start()

  const send = async (id, contract_id, role, type) =>  {
    const name = await get_name(id, contract_id, role)
    service.send({ type, name })
    await db.put(`${id}/${contract_id}`, name)
  }
  
  async function get_name (id, contract_id, role) {
    var buff = await db.get(`${id}/${contract_id}`)
    if (buff) { return buff.value.toString('utf-8') }
    else { return `${id}-${contract_id}-${role}` }
  }

  // SCENARIO

  /* ------------------------------------
             CREATE ACCOUNT
  --------------------------------------- */

  /* ------------------------------------
             NEW HOSTING PLAN
  --------------------------------------- */

  send(9, 246, 'plan', '_HOSTING_PLAN_SUBSCRIPTION') // spawn SM
  setTimeout(() => send(9, 246, 'plan', 'chain_PLAN_UPDATE'), 3000) // send event to existing SM
  setTimeout(() => send(9, 246, 'plan', 'chain_PLAN_PAUSE'), 9000) // send event to existing SM
  setTimeout(() => send(9, 246, 'plan', 'chain_PLAN_RESUME'), 12000) // send event to existing SM
  setTimeout(() => send(9, 246, 'plan', 'chain_PLAN_END'), 15000) // send event to existing SM

  /* ------------------------------------
                   JOBS
  --------------------------------------- */

  // ----- ATTEST -----
  // send(1, 246, 'attest', 'chain_HOSTING_SETUP') // spawn SM

  // send(4, 246, 'attest', 'chain_STORAGE_PROOF') // spawn SM

  // send(6, 246, 'attest', 'chain_LEAD_PERFORMANCE_CHECK') // spawn SM
  // setTimeout(() => send(6, 246, 'attest', '_HOSTER_REPORT'), 5000) // send event to existing SM
  // setTimeout(() => send(6, 246, 'attest', '_ORGANIZE_PERFORMANCE_CHECK'), 5000) // send event to existing SM
  // setTimeout(() => send(6, 246, 'attest', '_SEND_REPORT'), 5000) // send event to existing SM

  // send(7, 246, 'attest', 'chain_PERFORMANCE_CHECK') // spawn SM
  // setTimeout(() => send(7, 246, 'attest', '_SWARM_CHECK'), 5000) // send event to existing SM
  // setTimeout(() => send(7, 246, 'attest', '_REPORT_REVIEW'), 10000) // send event to existing SM

  // ----- HOST -----
  // send(2, 246, 'host', 'chain_HOSTING_SETUP') // spawn SM
  // setTimeout(() => send(2, 246, 'host', 'chain_STORAGE_PROOF'), 5000) // send event to existing SM
  // setTimeout(() => send(2, 246, 'host', 'chain_PERFORMANCE_CHECK'), 5000) // send event to existing SM
  
  // ----- ENCODE -----
  // send(3, 246, 'encode','chain_HOSTING_SETUP') // spawn SM

}

run_state_machine()
