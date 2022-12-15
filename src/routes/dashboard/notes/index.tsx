import { Notes } from '~/components/note-list/notes'
import { useUser } from '~/context/user'

export default function Images() {
  const {
    accessor: [me],
  } = useUser()
  return <Notes editable all={20} filter={{ author: [me().id] }} />
}
