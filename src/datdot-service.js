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
  send(1, 246, 'attest', 'chain_HOSTING_SETUP')
  send(2, 246, 'host', 'chain_HOSTING_SETUP')
  // send(3, 246, 'encode','HOSTING_SETUP')
  // setTimeout(() => send(4, 246, 'attest-storage', 'STORAGE_PROOF'), 5000)
  // setTimeout(() => send(2, 246, 'host', 'STORAGE_PROOF'), 5000)
  // setTimeout(() => send(2, 246, 'host', 'PERFORMANCE_CHECK'), 5000)
  // setTimeout(() => send(5, 246, 'attest','PERFORMANCE_CHECK'), 5000)
  
  // setTimeout(() => send(6, 246, 'attest', 'chain_PERFORMANCE_LEAD'), 5000) 
  setTimeout(() => send(7, 246, 'attest', 'chain_PERFORMANCE_CHECK'), 5000)
  setTimeout(() => send(7, 246, 'attest', '_SWARM_CHECK'), 5000)
  setTimeout(() => send(7, 246, 'attest', '_REPORT_REVIEW'), 10000)

}

run_state_machine()
