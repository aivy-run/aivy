import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { mount, StartClient } from 'solid-start/entry-client'

import { initializeCookieSetter } from './lib/api/internal/auth'
import { checkVersion } from './lib/version'

import 'dayjs/locale/ja'

dayjs.locale('ja')
dayjs.extend(duration)

checkVersion()
initializeCookieSetter()

mount(() => <StartClient />, document)
