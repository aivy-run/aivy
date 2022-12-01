import { createEffect } from 'solid-js'
import { useNavigate } from 'solid-start'

import { Fallback } from '~/components/ui/fallback'
import { useUser } from '~/context/user'

export default () => {
  const {
    accessor: [me, profile],
    status: { isFetching },
  } = useUser(true)
  const navigate = useNavigate()
  createEffect(() => {
    if (isFetching()) return
    if (me() && !profile()) navigate('/setup', { replace: true })
    else navigate('/', { replace: true })
  })
  return (
    <>
      <Fallback />
    </>
  )
}
