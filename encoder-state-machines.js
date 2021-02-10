const encoder_machine = Machine({
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
      actions: ['get_data', 'encode', 'p2plex_to_attestor', 'send_data_to_attestor'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure_connect'  // retry
      }
    },
    resume_hosting_setup: {
      actions: ['resume'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure_resume'  // retry
      }
    },
    failure_connect: {
      on: {
        RETRY: 'connect_encode_send_to_attestor'
      }
    },
    failure_resume: {
      on: {
        RETRY: 'resume_hosting_setup'
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
