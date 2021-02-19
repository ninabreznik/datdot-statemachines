const XState = require('xstate')
const { Machine, interpret, assign } = XState

const main_machine = Machine({
  initial: 'publish_plan',
  states: {
    publish_plan: {},
    pause_plan: {},
    resume_plan: {},
    end_plan: {},
  }
})
