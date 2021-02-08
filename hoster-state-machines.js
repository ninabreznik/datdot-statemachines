const hosting_setup_machine = {
  initial: 'idle',
  states: {
    'idle': {
      actions: ['disconnect_all', 'drop_all_data'],
      on: 'new_hosting_setup_event',
      next: ['connect_to_attestor'],
      fail: {
        'no_connection_made': {
          retry: 3
          next: ['idle']
        }
      }
    },
    'connect_to_attestor': {
      actions: ['p2plex_connect', 'receive_and_store_data']
      on: 'received_all_data',
      next: ['hosting'],
      fail: {
        'no_data_received': {
          retry: 3,
          next: ['idle']
        },
        'connection_failed': {
          retry: 3,
          next: ['idle']
        }
      }
    },
    'hosting': {
      actions: ['join_swarm_and_seed']
      on: 'stop_hosting', // also on challenges??
      next: ['idle'],
      fail: {
        'not_able_to_join_swarm': {
          retry: 3,
          next: ['notify_chain'] // ???
        }
      }
    },
    'drop_hosting': {
      actions: ['exit_swarm', 'delete_data'],
      on: 'data_dropped',
      next: 'idle',
      fail: {
        'data_not_deleted': {
          retry: 3,
          next: ['idle']
        },
        'swarm_not_exited': {
          retry: 3,
          next: ['idle']
        }
      }
    }
  }
}

const storage_challenge = {
  initial: 'hosting',
  states: {
    'hosting': {
      on: 'new_storage_challenge',
      next: ['storage_challenge_response'],
      fail: {
        'no_connection_made': {
          retry: 3,
          next: ['hosting']
        }
      }
    },
    'connect_to_attestor': {
      actions: ['connect_to_attestor', 'provide_proof']
      on: 'attestor_received_all_data'
      next: 'hosting'
      fail: {
        'failed_to_provide_proof': {
          retry: 3,
          next: ['hosting']
        },
        'connection_failed': {
          retry: 3,
          next: ['hosting']
        }
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
      next: ['performance_challenge_response'],
      fail: {
        'no_connection_made': {
          retry: 3,
          next: ['hosting'] // or notify chain ??
        }
      }
    },
    'connect_to_attestor': {
      actions: ['connect_to_attestor', 'provide_proof']
      on: 'attestor_received_all_data'
      next: 'hosting'
      fail: {
        'failed_to_provide_proof': {
          retry: 3,
          next: ['hosting']
        },
        'connection_failed': {
          retry: 3,
          next: ['hosting']
        }
      }
    }
  }
}
