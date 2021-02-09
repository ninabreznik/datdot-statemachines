const hosting_setup_machine = Machine({
  initial: 'idle',
  states: {
    idle: {
      actions: ['disconnect_all', 'drop_all_data'],
      on: {
        EVENT: { // new hosting setup
          target: 'connect_receive_store_data'
        }
      },
    },
    connect_receive_store_data: {
      actions: ['p2plex_connect', 'receive_and_store_data'], // stream, all happening in parallel
      on: {
        RESOLVE: 'hosting',
        REJECT: 'failure' // retry
      },
    },
    hosting: {
      actions: ['join_swarm_and_seed'],
      on: {
        EVENT: { // drop hosting // challenges
          target: 'drop_hosting'
        }
      }
    },
    drop_hosting: {
      actions: ['exit_swarm', 'delete_data'],
      onDone: 'idle'
    },
    failure: {
      on: {
        RETRY: 'connect_receive_store_data'
      }
    }
  }
})


const storage_challenge = {
  initial: 'hosting',
  states: {
    'hosting': {
      on: 'new_storage_challenge',
      target: ['storage_challenge_response'],
      failure: {
        'no_connection_made': {
          retry: 3,
          target: ['hosting']
        }
      }
    },
    'storage_challenge_response': {
      actions: ['p2plex_connect', 'provide_proof'],
      on: {
        RESOLVE: 'hosting',
        REJECT: 'storage_challenge_response' // retry
      }
    }
    'restart_hosting_setup': {}, // resume (continue where you left of)
    'restart_hosting_setup_with_new_attestor': {} //partial resume (need to connect, tell what you miss)
  }
}

const performance_challenge = {
  initial: 'hosting',
  states: {
    'hosting': {
      on: 'new_performance_challenge',
      target: ['performance_challenge_response'],
      failure: {
        'no_connection_made': {
          retry: 3,
          target: ['hosting'] // or notify chain ??
        }
      }
    },
    'performance_challenge_response': {
      actions: ['p2plex_connect', 'provide_proof']
      on: {
        RESOLVE: 'hosting',
        REJECT: 'performance_challenge_response' // retry
      }
      }
    }
  }
}
