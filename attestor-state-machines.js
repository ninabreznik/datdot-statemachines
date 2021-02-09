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
        EVENT_NEW_HOSTING_SETUP: {
          target: 'connect_to_encoders_and_hosters'
        },
        EVENT_STORAGE_CHALLENGE: {
          target: 'storage_challenge'
        },
        EVENT_PERFORMANCEE_CHALLENGE: {
          target: 'performance_challenge'
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

    storage_challenge: {
      actions: ['p2plex', 'receive_data', 'verify', 'report_to_chain'],
      on: {
        RESOLVE: 'report_to_chain',
        REJECT: 'failure'
      }
    },

    performance_challenge: {
      actions: ['']
    },

    report_to_chain: {
      actions: ['send_report'],
      target: 'idle'
    },

    failure: {
      on: {
        RETRY: Machine.history // @TODO
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
