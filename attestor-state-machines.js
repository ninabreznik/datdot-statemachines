const Machine = require('XState')

const hosting_setup_machine = Machine({
  initial: 'idle',
  context: {
   fresh: true,
   restart: false,
   restart_as_new_attestor: false
 },
  states: {
    'idle': {
      actions: ['disconnect_all'],
      on: ['new_hosting_setup_event', 'restart', 'restart_as_new_attestor'],
      next: 'connect_to_encoders_and_hosters'
    },

    'connect_to_encoders_and_hosters': {
      actions: ['connect_to_encoders', 'connect_to_hosters'],
      on: 'connected',
      next: 'data_from_encoders_to_hosters',
      fail: {
        'no_connection_made': {
          retry: 3
          next: ['report_to_chain']
        }
      }
    },

    'data_from_encoders_to_hosters': {
      actions: ['get_encoded_data', 'compare_encodings', 'send_encoded_to_hosters'],
      on: 'hosters_received_all_data',
      next: 'report_to_chain',
      fail: {
        'connection_failed': {
          retry: {
            'connect_to_encoders_and_hosters': 3,
            fallback: 'report_to_chain'
          },
        },
        'no_data_from_encoder': {
          retry: {
            'data_from_encoders_to_hosters': 3, //get_encoded_data
            fallback: 'report_to_chain'
          },
        },
        'encoding_mismatch': {
          next: 'report_to_chain'
        },
        'no_ack_from_hosters': {
          retry: {
            'connect_to_encoders_and_hosters': 3,
            fallback: 'report_to_chain'
          },
        },
      }
    },

    'report_to_chain': {
      actions: ['send_report'],
      on: {
        'no_connection_made': {
          next: 'restart'
        },
        'hosting_starts': {
          next: 'idle'
        },
        ['connection_failed', 'encoding_mismatch', 'no_data_from_encoder', 'no_ack_from_hosters']: {
          next: 'restart'
        }
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
