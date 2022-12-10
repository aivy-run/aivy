import dotenv from 'dotenv'
import { createHandler, renderAsync, StartServer } from 'solid-start/entry-server'

import { OriginalMiddleware } from './middleware'

dotenv.config({
  path: import.meta.env.DEV ? '.env.local' : '.env',
})

export default createHandler(
  OriginalMiddleware,
  renderAsync((event) => <StartServer event={event} />),
)
