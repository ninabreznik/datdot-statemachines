const XState = require('xstate')
const { Machine, interpret, assign } = XState


const new_hosting_setup_states = {
  initial: 'connect_to_encoders_and_hosters',
  states: {
    connect_to_encoders_and_hosters: {
      actions: ['connect_to_encoders', 'connect_to_hosters'],
      on: {
       RESOLVE: 'data_from_encoders_to_hosters',
       REJECT: 'failure_connect_to_encoders_and_hosters' // retry
      }
    },
    failure_connect_to_encoders_and_hosters: {
      on: {
        RETRY: 'connect_to_encoders_and_hosters'
      }
    },
    data_from_encoders_to_hosters: {
      actions: ['get_encoded_data', 'compare_encodings', 'send_encoded_to_hosters'],
      on: {
        RESOLVE: 'report_to_chain',
        REJECT: 'failure_data_from_encoders_to_hosters'
      }
    },
    failure_data_from_encoders_to_hosters: {
      on: {
        RETRY: 'data_from_encoders_to_hosters'
      }
    }
    report_to_chain: {
      actions: ['send_report'],
      on: {
        RESOLVE: 'failure_report_to_chain', // @TODO change to idle
        REJECT: 'failure_report_to_chain'
      }
    },
    failure_report_to_chain: {
      on: {
        RETRY: 'report_to_chain'
      }
    }
  }
}

const storage_challenge_states = {
  initial:'p2plex_to_hoster',
  states: {
    p2plex_to_hoster: {
      actions: ['p2plex_connect'],
      on: {
        RESOLVE: 'storage_challenge_report',
        REJECT: 'failure_p2plex_to_hoster'
      }
    },
    receive_data: {
      actions: ['receive_data', 'verify'],
      on: {
        RESOLVE: 'storage_challenge_report',
        REJECT: 'failure_receive_data'
      }
    },
    storage_challenge_report: {
      actions: ['send_report'],
      on: {
        RESOLVE: 'failure_storage_challenge_report', // @TODO  change to idle
        REJECT: 'failure_storage_challenge_report'
      }
    },
    failure_storage_challenge_report: {
      on: {
        RETRY: 'storage_challenge_report'
      }
    },
    failure_receive_data: {
      on: {
        RETRY: 'receive_data'
      }
    },
    failure_p2plex_to_hoster: {
      on: {
        RETRY: 'p2plex_to_hoster'
      }
    },
  }
}

const performance_challenge_states = {
  initial:'p2plex_to_hosters',
  states: {
    p2plex_to_hosters: {
      actions: ['p2plex_connect_to_all_hosters'],
      on: {
        RESOLVE: 'join_attestors_swarm',
        REJECT: 'failure_p2plex_to_hosters'
      }
    },
    failure_p2plex_to_hosters: {
      on: {
        RETRY: 'p2plex_to_hosters'
      }
    },
    join_attestors_swarm: {
      actions: ['join_attestors_swarm'],
      on: {
        RESOLVE: 'compare_hoster_reports',
        REJECT: 'failure_join_attestors_swarm'
      }
    },
    failure_join_attestors_swarm: {
      on: {
        RETRY: 'join_attestors_swarm'
      }
    },
    compare_hoster_reports: {
      actions: ['compare_reports_with_other_attestors'],
      on: {
        RESOLVE: 'attestation',
        REJECT: 'failure_compare_hoster_reports'
      }
    },
    failure_compare_hoster_reports: {
      on: {
        RETRY: 'compare_hoster_reports'
      }
    },
    attestation: {
      actions: ['select_attestors', 'check_performance_for_selected_chunks'],
      on: {
        RESOLVE: 'performance_challenge_report',
        REJECT: 'failure_attestation'
      }
    },
    failure_attestation: {
      on: {
        RETRY: 'attestation'
      }
    },
    performance_challenge_report: {
      actions: ['compare_reports_with_other_attestors'],
      on: {
        RESOLVE: 'failure_performance_challenge_report', // @TODO  change to idle
        REJECT: 'failure_performance_challenge_report'
      }
    },
    failure_performance_challenge_report: {
      on: {
        RETRY: 'performance_challenge_report'
      }
    },
  }
}

const attestor_machine = Machine({
  initial: 'idle',
  context: {
   fresh: true,
   restart: false,
   restart_as_new_attestor: false
 },
  states: {
    idle: {
      actions: ['disconnect_all'],
      on: {
        EVENT_NEW_HOSTING_SETUP: {
          target: 'new_hosting_setup'
        },
        EVENT_PERFORMANCE_CHALLENGE: {
          target: 'performance_challenge'
        },
        EVENT_STORAGE_CHALLENGE: {
          target: 'storage_challenge'
        },
      },
    },

    new_hosting_setup: {
      on: {},
      ...new_hosting_setup_states
    },

    storage_challenge: {
      on: {},
      ...storage_challenge_states
    },

    performance_challenge: {
      on: {},
      ...performance_challenge_states
    },

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
