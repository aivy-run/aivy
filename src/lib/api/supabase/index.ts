import { BookmarkApi } from './bookmarks'
import { CommentApi } from './comments'
import { ImagePostApi } from './images'
import { LikeApi } from './like'
import { Mute } from './mute'
import { NoteApi } from './notes'
import { NotificationApi } from './notification'
import { RelationShipApi } from './relationship'
import { TagApi } from './tag'
import { UserApi } from './user'

class Api {
    public readonly user = new UserApi()
    public readonly image = new ImagePostApi()
    public readonly note = new NoteApi()
    public readonly like = new LikeApi()
    public readonly bookmark = new BookmarkApi()
    public readonly comment = new CommentApi()
    public readonly relationship = new RelationShipApi()
    public readonly mute = new Mute()
    public readonly notification = new NotificationApi()
    public readonly tags = new TagApi()
}

export const api = new Api()
