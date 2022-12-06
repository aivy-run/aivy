alter table "public"."bookmarks" drop constraint "bookmarks_author_fkey";

alter table "public"."comments" drop constraint "comments_author_fkey";

alter table "public"."image_posts" drop constraint "image_posts_author_fkey";

alter table "public"."image_posts" drop constraint "image_posts_contest_id_fkey";

alter table "public"."image_posts_information" drop constraint "image_posts_information_post_id_fkey";

alter table "public"."notifications" drop constraint "notifications_author_fkey";

alter table "public"."notifications" drop constraint "notifications_target_comment_fkey";

alter table "public"."notifications" drop constraint "notifications_target_image_post_fkey";

alter table "public"."notifications" drop constraint "notifications_target_user_fkey";

alter table "public"."relationship" drop constraint "relationship_target_fkey";

alter table "public"."bookmarks" alter column "author" drop default;

alter table "public"."likes" alter column "author" drop default;

alter table "public"."muted_users" alter column "author" drop default;

alter table "public"."likes" add constraint "likes_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_author_fkey";

alter table "public"."muted_users" add constraint "muted_users_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."muted_users" validate constraint "muted_users_author_fkey";

alter table "public"."relationship" add constraint "relationship_uid_fkey" FOREIGN KEY (uid) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."relationship" validate constraint "relationship_uid_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_author_fkey";

alter table "public"."comments" add constraint "comments_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_author_fkey";

alter table "public"."image_posts" add constraint "image_posts_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."image_posts" validate constraint "image_posts_author_fkey";

alter table "public"."image_posts" add constraint "image_posts_contest_id_fkey" FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE not valid;

alter table "public"."image_posts" validate constraint "image_posts_contest_id_fkey";

alter table "public"."image_posts_information" add constraint "image_posts_information_post_id_fkey" FOREIGN KEY (post_id) REFERENCES image_posts(id) ON DELETE CASCADE not valid;

alter table "public"."image_posts_information" validate constraint "image_posts_information_post_id_fkey";

alter table "public"."notifications" add constraint "notifications_author_fkey" FOREIGN KEY (author) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_author_fkey";

alter table "public"."notifications" add constraint "notifications_target_comment_fkey" FOREIGN KEY (target_comment) REFERENCES comments(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_target_comment_fkey";

alter table "public"."notifications" add constraint "notifications_target_image_post_fkey" FOREIGN KEY (target_image_post) REFERENCES image_posts(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_target_image_post_fkey";

alter table "public"."notifications" add constraint "notifications_target_user_fkey" FOREIGN KEY (target_user) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_target_user_fkey";

alter table "public"."relationship" add constraint "relationship_target_fkey" FOREIGN KEY (target) REFERENCES profiles(uid) ON DELETE CASCADE not valid;

alter table "public"."relationship" validate constraint "relationship_target_fkey";


