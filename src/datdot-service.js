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

  const hosting_setup = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    console.log({ name })
    service.send({ type: 'HOSTING_SETUP', name })
    if (name.includes('host-setup')) {
      await db.put(`${id}/${contract_id}`, name)
    }
  }
  const performance_check = async (id, contract_id, role) =>  {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'PERFORMANCE_CHECK', name })
  }
  const storage_proof = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'STORAGE_PROOF', name })
  }
  const hosting_repair = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'HOSTING_REPAIR', name })
  }
  const hosting_pause = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'HOSTING_PAUSE', name })
  }
  const hosting_resume = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'HOSTING_RESUME', name })
  }
  const hosting_end = async (id, contract_id, role) => {
    const name = await get_name(id, contract_id, role)
    service.send({ type: 'HOSTING_END', name })
  }

  async function get_name (id, contract_id, role) {
    var buff = await db.get(`${id}/${contract_id}`)
    if (buff) { return buff.value.toString('utf-8') }
    else { return `${id}-${contract_id}-${role}` }
  }

  // scenario
  hosting_setup(11, 246, 'attest-setup')
  hosting_setup(26, 246, 'host')
  // hosting_setup(17, 246, 'encode')
  // setTimeout(() => storage_proof(11, 246, 'attest-storage'), 5000)
  setTimeout(() => storage_proof(26, 246, 'host'), 5000)

}

run_state_machine()
