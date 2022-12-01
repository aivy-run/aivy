import type { CompleteImagePost } from '../lib/api/supabase/images'
import type { UserProfile } from '../lib/api/supabase/user'

export type State = {
    posts: CompleteImagePost[]
    post: CompleteImagePost
    user: UserProfile['Row']
}
