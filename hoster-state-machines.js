const XState = require('xstate')
const { Machine, interpret, assign } = XState

const new_hosting_setup_states = {
    initial: 'connect_to_attestor',
    states: {
      connect_to_attestor: {
        actions: ['p2plex_to_attestor'],
        on: {
          RESOLVE: 'receive_and_store_data',
          REJECT: 'failure_connect_to_attestor' // retry
        },
      },
      failure_connect_to_attestor: {
        on: {
          RETRY: 'connect_to_attestor'
        }
      },
      receive_and_store_data: {
        actions: ['receive_data', 'verify_data', 'store_data'], // stream, all happening in parallel
        on: {
          RESOLVE: '#idleState',
          REJECT: 'failure_receive_and_store_data' // retry
        },
      },
      failure_receive_and_store_data: {
        on: {
          RETRY: 'receive_and_store_data'
        }
      },
    }
}

const resume_hosting_setup_states = {
    initial: 'resume_hosting_setup',
    states: {
      resume_hosting_setup: {
        actions: ['resume'], // streaming, all happening in parallel
        on: {
          RESOLVE: '#idleState',
          REJECT: 'failure_resume_hosting_setup'  // retry
        }
      },
      failure_resume_hosting_setup: {
        on: {
          RETRY: 'resume_hosting_setup'
        }
      },
    }
}


const hoster_machine = Machine({
  initial: 'idle',
  states: {
    idle: {
      id: 'idleState',
      actions: ['disconnect_all', 'drop_all_data'],
      on: {
        EVENT_NEW_HOSTING_SETUP: {
          target: 'new_hosting_setup'
        },
        EVENT_RESUME_HOSTING_SETUP: {
          target: 'resume_hosting_setup'
        },
      },
    },
    new_hosting_setup: {
      on: {},
      ...new_hosting_setup_states
    },
    resume_hosting_setup: {
      on: {},
      ...resume_hosting_setup_states
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
    failure_storage_challenge: {
      on: {
        RETRY: 'storage_challenge_response'
      }
    },
    failure_performance_challenge: {
      on: {
        RETRY: 'performance_challenge_response'
      }
    },
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
