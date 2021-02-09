const Machine = require('XState')

const hosting_setup_machine = Machine({
  initial: 'idle',
  context: {
   fresh: true,
   restart: false,
   restart_as_new_attestor: false
 },
  states: {
    idle: {
      actions: ['disconnect_all'],
      on: {
        EVENT: {
          target: 'connect_to_encoders_and_hosters'
        }
      },
    },

    connect_to_encoders_and_hosters: {
      actions: ['connect_to_encoders', 'connect_to_hosters'],
      on: {
       RESOLVE: 'data_from_encoders_to_hosters',
       REJECT: 'failure' // retry
      }
    },

    data_from_encoders_to_hosters: {
      actions: ['get_encoded_data', 'compare_encodings', 'send_encoded_to_hosters'],
      on: {
        RESOLVE: 'report_to_chain',
        REJECT: 'failure'
      }
    },

    report_to_chain: {
      actions: ['send_report'],
      target: 'idle'
    },

    failure: {
      on: {
        RETRY: 'connect_to_encoders_and_hosters'
      }
    }
  }
})

/*
function connect_to_encoders_and_hosters () {
if (hosting_setup_machine.context.fresh || hosting_setup_machine.context.restart_as_new_attestor) {
connect & wait for connected = true
}
else if (hosting_setup_machine.context.resume) return connected = true
}

function connect_to_encoders_and_hosters () {
if (hosting_setup_machine.context.resume) resume
else data_from_encoders_to_hosters
}
*/
