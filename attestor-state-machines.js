const XState = require('xstate')
const { Machine, interpret, assign } = XState


const attestor_machine = Machine({
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
        EVENT_PERFORMANCE_CHALLENGE: {
          target: 'performance_challenge'
        }
      },
    },

    connect_to_encoders_and_hosters: {
      actions: ['connect_to_encoders', 'connect_to_hosters'],
      on: {
       RESOLVE: 'data_from_encoders_to_hosters',
       REJECT: 'failure_hosting_setup' // retry
      }
    },

    data_from_encoders_to_hosters: {
      actions: ['get_encoded_data', 'compare_encodings', 'send_encoded_to_hosters'],
      on: {
        RESOLVE: 'report_to_chain',
        REJECT: 'failure_hosting_setup'
      }
    },

    storage_challenge: {
      actions: ['p2plex_to_hoster', 'receive_data', 'verify', 'report_to_chain'],
      on: {
        RESOLVE: 'report_to_chain',
        REJECT: 'failure_storage_challenge'
      }
    },

    performance_challenge: {
      actions: ['p2plex_to_hosters', 'join_attestors_swarm', 'compare_hoster_reports', 'attestation', 'performance_challenge_report' ],
      on: {
        RESOLVE: 'performance_challenge_report',
        REJECT: 'failure_performance_challenge'
      }
    },

    report_to_chain: {
      actions: ['send_report'],
      target: 'idle'
    },

    performance_challenge_report: {
      actions: ['send_performance_challenge_report'],
      target: 'idle'
    },

    failure_hosting_setup: {
      on: {
        RETRY: 'connect_to_encoders_and_hosters'
      }
    },

    failure_storage_challenge: {
      on: {
        RETRY: 'storage_challenge'
      }
    },

    failure_performance_challenge: {
      on: {
        RETRY: 'performance_challenge'
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
