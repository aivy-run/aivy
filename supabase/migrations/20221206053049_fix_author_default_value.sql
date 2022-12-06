alter table "public"."bookmarks" drop constraint "bookmarks_author_fkey";

alter table "public"."comments" drop constraint "comments_author_fkey";

alter table "public"."image_posts" drop constraint "image_posts_author_fkey";

alter table "public"."likes" drop constraint "likes_author_fkey";

alter table "public"."muted_users" drop constraint "muted_users_author_fkey";

alter table "public"."notifications" drop constraint "notifications_author_fkey";

alter table "public"."relationship" drop constraint "relationship_uid_fkey";

alter table "public"."bookmarks" alter column "author" set default auth.uid();

alter table "public"."comments" alter column "author" set default auth.uid();

alter table "public"."image_posts" alter column "author" set default auth.uid();

alter table "public"."likes" alter column "author" set default auth.uid();

alter table "public"."muted_users" alter column "author" set default auth.uid();

alter table "public"."notifications" alter column "author" set default auth.uid();

alter table "public"."relationship" alter column "uid" set default auth.uid();

alter table "public"."bookmarks" add constraint "bookmarks_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_author_fkey";

alter table "public"."comments" add constraint "comments_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."comments" validate constraint "comments_author_fkey";

alter table "public"."image_posts" add constraint "image_posts_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."image_posts" validate constraint "image_posts_author_fkey";

alter table "public"."likes" add constraint "likes_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."likes" validate constraint "likes_author_fkey";

alter table "public"."muted_users" add constraint "muted_users_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."muted_users" validate constraint "muted_users_author_fkey";

alter table "public"."notifications" add constraint "notifications_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) not valid;

alter table "public"."notifications" validate constraint "notifications_author_fkey";

alter table "public"."relationship" add constraint "relationship_uid_fkey" FOREIGN KEY (uid) REFERENCES profiles(uid) not valid;

alter table "public"."relationship" validate constraint "relationship_uid_fkey";


