import { NotFoundError } from '~/components/error-handler'

export default () => {
  throw new NotFoundError()
}
