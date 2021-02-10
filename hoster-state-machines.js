const hoster_machine = Machine({
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
      actions: ['p2plex_to_attestor', 'receive_and_store_data'], // stream, all happening in parallel
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure_connect' // retry
      },
    },
    resume_hosting_setup: {
      actions: ['resume'], // streaming, all happening in parallel
      on: {
        RESOLVE: 'idle',
        REJECT: 'failure_resume'  // retry
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
      actions: ['p2plex_to_attestor', 'provide_proof'],
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure_storage_challenge'
      }
    },
    performance_challenge_response: {
      actions: ['p2plex_connect_to_attestors_observers', 'start_sending_reports'],
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure_performance_challenge'
      }
    },
    failure_connect: {
      on: {
        RETRY: 'connect_receive_store_data'
      }
    },
    failure_resume: {
      on: {
        RETRY: 'resume_hosting_setup'
      }
    },
    failure_storage_challenge: {
      on: {
        RETRY: 'storage_challenge_response'
      }
    },
    failure_performance_challenge: {
      on: {
        RETRY: 'performance_challenge_response'
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
