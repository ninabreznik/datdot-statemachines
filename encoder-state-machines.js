const hosting_setup_machine = Machine({
  initial: 'idle',
  states: {
    idle: {
      actions: ['disconnect_all'],
      on: {
        EVENT_NEW_HOSTING_SETUP: { // new_hosting_setup
          target: 'connect_encode_send_to_attestor'
        },
        EVENT_RESUME_HOSTING_SETUP: { // new_hosting_setup
          target: 'resume_hosting_setup'
        },
      },
    },
    connect_encode_send_to_attestor: {
      actions: ['get_data', 'encode', 'p2plex_connect', 'send_data_to_attestor'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure'  // retry
      }
    },
    resume_hosting_setup: {
      actions: ['resume'], // streaming, all happening in parallel
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


// HELPERS

resume: () => {

  if (same_attestor) { // resume (continue where you left of)
    // already connected
    attestorOrders() // attestor knows what is missing
    sendMissing()
  }
  if (new_attestor) {
    connect()
    attestorOrders() // attestor asks hoster what what is missing and lets you know
    sendMissing()
  }

}
