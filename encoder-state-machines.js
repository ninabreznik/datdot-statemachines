const hosting_setup_machine = {
  initial: 'idle',
  states: {
    'idle': {
      actions: ['disconnect_all'],
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
      actions: ['get_data', 'encode', 'p2plex_connect', 'send_data_to_attestor'],
      on: 'attestor_received_all_encoded',
      next: ['idle'],
      fail: {
        'no_data_avail': {
          retry: 3,
          next: ['idle']
        },
        'encoding_failed': {
          retry: 3,
          next: ['idle']
        },
        'no_received_ack': {
          retry: 3,
          next: ['idle']
        },
        'connection_failed': {
          retry: 3,
          next: ['idle']
        }
      }
    }
    'restart_hosting_setup': {}, // resume (continue where you left of)
    'restart_hosting_setup_with_new_attestor': {} //partial resume (need to connect and send encoded (encoding is done))
  }
}
