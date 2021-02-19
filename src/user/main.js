const XState = require('xstate')
const { Machine, interpret, assign } = XState

const dat_dot_machine = Machine({
  initial: 'start',
  states: {
    start: {},
    register_user: {},
    unregister_user: {},
    offer_hosting: {},
    publish_hosting_request: {},
    example_state: {
      invoke: {
        src: attestor_state_machine,
        onDone: 'something'
      }
    }
  }
})
