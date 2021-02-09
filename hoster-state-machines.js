const hosting_setup_machine = Machine({
  initial: 'idle',
  states: {
    idle: {
      actions: ['disconnect_all', 'drop_all_data'],
      on: {
        EVENT_NEW_HOSTING_SETUP: { // new_hosting_setup
          target: 'connect_receive_store_data'
        },
        EVENT_RESUME_HOSTING_SETUP: { // new_hosting_setup
          target: 'resume_hosting_setup'
        },
      },
    },
    connect_receive_store_data: {
      actions: ['p2plex_connect', 'receive_and_store_data'], // stream, all happening in parallel
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure' // retry
      },
    },
    resume_hosting_setup: {
      actions: ['resume'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure'  // retry
      }
    },
    hosting: {
      actions: ['join_swarm_and_seed'],
      on: {
        EVENT_DROP_HOSTING: {
          target: 'drop_hosting'
        },
        EVENT_STORAGE_CHALLENGE: {
          target: 'storage_challenge_response'
        },
        EVENT_PERFORMANCEE_CHALLENGE: {
          target: 'performance_challenge_response'
        }
      }
    },
    drop_hosting: {
      actions: ['exit_swarm', 'delete_data'],
      onDone: 'idle'
    },
    storage_challenge_response: {
      actions: ['p2plex_connect', 'provide_proof'],
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure'
      }
    },
    performance_challenge_response: {
      actions: ['p2plex_connect', 'provide_proof'],
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure'
      }
    },
    failure: {
      on: {
        RETRY: 'connect_receive_store_data'
      }
    }
  }
})


// HELPERS

resume: () => {

  if (same_attestor) { // resume (continue where you left of)
    // already connected
    receiveMissing()
  }
  if (new_attestor) {
    connect()
    tellAttestorWhatsMissing()
    receiveMissing()
  }

}
