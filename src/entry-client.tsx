import { mount, StartClient } from 'solid-start/entry-client'

import { initializeClientAuth } from './lib/api/internal/auth'
import { checkVersion } from './lib/version'

import 'solid-devtools'

checkVersion()
initializeClientAuth()

mount(() => <StartClient />, document)
