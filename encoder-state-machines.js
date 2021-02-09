const hosting_setup_machine = Machine({
  initial: 'idle',
  states: {
    idle: {
      actions: ['disconnect_all'],
      on: {
        EVENT: { // new_hosting_setup
          target: 'connect_encode_send_to_attestor'
        }
      },
    },
    connect_encode_send_to_attestor: {
      actions: ['get_data', 'encode', 'p2plex_connect', 'send_data_to_attestor'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure'  // retry
      }
    },
    failure: {
      on: {
        RETRY: 'connect_encode_send_to_attestor'
      }
    }
  }
})


restart_hosting_setup: {}, // resume (continue where you left of)
restart_hosting_setup_with_new_attestor: {} //partial resume (need to connect and send encoded (encoding is done))
