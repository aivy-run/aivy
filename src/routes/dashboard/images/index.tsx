import { Posts } from '~/components/gallery/posts'
import { useUser } from '~/context/user'

export default function Images() {
  const {
    accessor: [me],
  } = useUser()
  return <Posts all={20} filter={{ author: [me().id] }} url="/dashboard/images" editable />
}
