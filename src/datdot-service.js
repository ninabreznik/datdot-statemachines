const XState = require('xstate')
const { State, Machine, interpret, assign } = XState
const service_sm = require('datdot-service-sm')
const plan = require('plan-sm')
const make_db = require('make-hyperbee')
var count = 0

module.exports = datdot_service

async function datdot_service (wire) {
  const db = await make_db('./data/hyperbee')
  const save_state = async (key, state) => {
    const jsonState = JSON.stringify(state)
    await db.put(key, jsonState)
  }

  const service = interpret(service_sm)
  .onTransition(async (state) => {
    save_state('service', state)
    // const { actions, activities, meta, events, value, context, event, _sessionid, historyValue, transitions, children } = state
    // console.log({ oldstate: historyValue?.current, newstate: value, event })
    // console.log(JSON.stringify({ actions, activities, meta,  context, transitions },0,2))
    // console.log({ historyValue, children })

    console.log('---------------------------------------------')
    console.log(
      'DATDOT-SERVICE:', 
      '| State:', state.value, 
      '| Actors:', state.context.actors ? state.context.actors.map(actor => actor.name) : '[]',
      '| Event:', state.event.type === 'xstate.update' ? state.event.type : state.event
    )
    if (state.event.type === 'xstate.update') {
      const name = state.event.state.context.name
      const jsonState = JSON.stringify(state.event.state);
      await db.put(name, jsonState)
    }
  })
  
  // fresh start
  
  service.start()

  // restart from saved state

  // const buff = await db.get('service')
  // const current_state = JSON.parse(buff.value.toString('utf-8'))
  // service.start(State.create(current_state))
  // console.log(service)
  // // service.context.actors.forEach(actor => restart_submachine(actor.name) )
  
  // async function restart_submachine (name) {
  //   console.log(foo)
  //   // const sub_sm = service.state.children[name].machine
  //   const buff = await db.get(name)
  //   const current_state = JSON.parse(buff.value.toString('utf-8'))
  //   console.log('current state', current_state)
  //   const resolvedState = plan_sm.resolveState(State.create(current_state))
  //   const restored_state = interpret(sub_sm).start(resolvedState)
  //   console.log(restored_state)
  // }

  const send = async (name, type) =>  {
    var entry = await db.get(name)
    if (!entry) await db.put(name, '')
    service.send({ type, to: name })
  }

  // SCENARIO

  // TODO: 
  // stop actors on demand
  /* think about the names of the spawned SM
    - service SM generates random name
    - service SM spawns new machine with context to let it know its name
    - child machine sends msg to the chain through the service SM
    - service SM generates and sends the real msg and stores msg id together with child SM actor name in the DB
    - chain sends answer where service SM checks the ref msg and looks up for child SM in the DB stored by this msg ref
    - if child SM is in the DB then msg gets forwarded to the child (send)
  */

  /* ------------------------------------
             REGISTER ACCOUNT
  --------------------------------------- */

  // send(`account-sm-${count++}`, 'account', 'user_REGISTER_ACCOUNT') // spawn SM

  /* ------------------------------------
             NEW HOSTING PLAN
  --------------------------------------- */

  send(`plan-sm-${count++}`, '_PUBLISH_HOSTING_PLAN') // spawn SM



  // setTimeout(async () => {
  //   const name = 'plan-sm-0'
  //   const plan_actor = service.state.children[name]
  //   const plan_sm = plan_actor.machine

  //   const buff = await db.get(name)
  //   const current_state = JSON.parse(buff.value.toString('utf-8'))

  //   const target_state = State.create(current_state)
  //   console.log(`resolving from *${plan_actor.state.value}* to *${target_state.value}*`)
  //   const resolvedState = plan_sm.resolveState(target_state)
  //   interpret(plan_sm).start(resolvedState)    
  // }, 6000)
  
  setTimeout(() => send('plan-sm-0', 'chain_PLAN_END'), 30) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_CONFIRMED'), 3000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_UPDATE'), 3000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_PAUSE'), 9000) // send event to existing SM
  // setTimeout(() => send('plan-sm-0', 'chain_PLAN_RESUME'), 12000) // send event to existing SM

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
