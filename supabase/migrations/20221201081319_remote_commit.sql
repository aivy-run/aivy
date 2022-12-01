--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.5 (Debian 14.5-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "extensions";


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: create_image_post_comment_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_image_post_comment_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
	commentable record;
	parent record;
	sended uuid[] = '{}'::uuid[];
	reply record;
begin
	select * into commentable from image_posts where id=new.commentable_id;

  	if (new.author != commentable.author) then
  		insert into "notifications" (author, target_image_post, target_user, type)
      		values (new.author, commentable.id, commentable.author, 'image_post_comment');
      		sended = array_append (sended, commentable.author);
    end if;
   
	if (new.parent_id is not null) then
   		select * into parent from comments where id=new.parent_id;
   		if (new.author != parent.author) then
  			insert into "notifications" (author, target_image_post, target_user, type)
      			values (new.author, commentable.id, parent.author, 'image_post_comment_reply');
      			sended = array_append (sended, parent.author);
    	end if;
      	
  		for reply in select * from comments where (parent_id=new.parent_id) loop
	  		if (new.author != reply.author) and (not (select reply.author = any (sended))) then
  				insert into "notifications" (author, target_image_post, target_user, type)
      				values (new.author, commentable.id, reply.author, 'image_post_comment_reply');
      			sended = array_append (sended, reply.author);
  			end if;
		end loop;
	end if;
  	return new;
end;
$$;


ALTER FUNCTION "public"."create_image_post_comment_notification"() OWNER TO "postgres";

--
-- Name: create_image_post_comment_reply_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_image_post_comment_reply_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  	parent record;
  	reply record;
  	sended uuid[] = '{}'::uuid[];
BEGIN
	IF new.type = 'reply' THEN
  		SELECT * INTO parent FROM image_posts_comments WHERE (id=new.target) AND (type = 'comment');

  		IF (new.author != parent.author) THEN
  			INSERT INTO "notifications" (author, target_image_post, target_user, type)
      			VALUES (new.author, parent.target, parent.author, 'image_post_comment_reply');
      		sended = array_append (sended, parent.author);
      	END IF;

  		FOR reply IN SELECT * FROM image_posts_comments WHERE (target=new.target) AND (type = 'reply') LOOP
	  		IF (new.author != reply.author) AND (NOT (SELECT reply.author = ANY (sended))) THEN
  				INSERT INTO "notifications" (author, target_image_post, target_user, type)
      				VALUES (new.author, parent.target, reply.author, 'image_post_comment_reply');
      			sended = array_append (sended, reply.author);
  			END IF;
	  	END LOOP;
  	END IF;
  	RETURN new;
END;
$$;


ALTER FUNCTION "public"."create_image_post_comment_reply_notification"() OWNER TO "postgres";

--
-- Name: create_like_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_like_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
	notification_type text;
	image_post_id bigint;
	comment_id bigint;
	user_id uuid;
begin
	case new.type
		when 'image_post' then
  			select author into user_id from image_posts where id=new.target;
			notification_type = 'image_post_like';
			image_post_id = new.target;
		when 'comment' then
  			select author, commentable_id into user_id, image_post_id from comments where id=new.target;
			notification_type = 'comment_like';
			comment_id = new.target;
	end case;

	if new.author = user_id then
		return new;
	end if;

	if exists (select from "notifications" where
		author = new.author and
		type = notification_type and
		(image_post_id is null or target_image_post = image_post_id) and
		(comment_id is null or target_comment = comment_id)
	) then 
		return new;
	end if;

  	insert into "notifications" (author, target_image_post, target_comment, target_user, type)
      	values (new.author, image_post_id, comment_id, user_id, notification_type);
  	return new;
end;
$$;


ALTER FUNCTION "public"."create_like_notification"() OWNER TO "postgres";

--
-- Name: create_relationship_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_relationship_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  	INSERT INTO "notifications" (author, target_user, type)
    	SELECT new.uid, new.target, 'relationship'
      		WHERE NOT EXISTS (
        		SELECT id FROM "notifications"
   	      			WHERE author = new.uid AND type = 'relationship' AND target_user = new.target
   	  		);
  	RETURN new;
END;
$$;


ALTER FUNCTION "public"."create_relationship_notification"() OWNER TO "postgres";

--
-- Name: decrease_image_post_bookmark_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."decrease_image_post_bookmark_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  	UPDATE image_posts SET bookmarks=(bookmarks - 1) WHERE id=old.target;
 	RETURN old;
END;
$$;


ALTER FUNCTION "public"."decrease_image_post_bookmark_count"() OWNER TO "postgres";

--
-- Name: decrease_like_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."decrease_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
	case old.type
		when 'image_post' then
			update "image_posts" set likes=(likes - 1) where id=old.target;
		when 'comment' then
			update "comments" set likes=(likes - 1) where id=old.target;
	end case;
 	return old;
end;
$$;


ALTER FUNCTION "public"."decrease_like_count"() OWNER TO "postgres";

--
-- Name: decrease_relationship(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."decrease_relationship"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  	UPDATE profiles SET followers=(followers - 1) WHERE uid=old.target;
  	UPDATE profiles SET follows=(follows - 1) WHERE uid=old.uid;
  	return old;
END;
$$;


ALTER FUNCTION "public"."decrease_relationship"() OWNER TO "postgres";

--
-- Name: increase_image_post_bookmark_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."increase_image_post_bookmark_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  	UPDATE image_posts SET bookmarks=(bookmarks + 1) WHERE id=new.target;
  	RETURN new;
END;
$$;


ALTER FUNCTION "public"."increase_image_post_bookmark_count"() OWNER TO "postgres";

--
-- Name: increase_image_post_view(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."increase_image_post_view"("target" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE image_posts SET views=(views + 1) WHERE id=target;
END;
$$;


ALTER FUNCTION "public"."increase_image_post_view"("target" bigint) OWNER TO "postgres";

--
-- Name: increase_like_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."increase_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
	case new.type
		when 'image_post' then
			update "image_posts" set likes=(likes + 1) where id=new.target;
		when 'comment' then
			update "comments" set likes=(likes + 1) where id=new.target;
	end case;
 	return new;
end;
$$;


ALTER FUNCTION "public"."increase_like_count"() OWNER TO "postgres";

--
-- Name: increase_relationship(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."increase_relationship"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  	UPDATE profiles SET followers=(followers + 1) WHERE uid=new.target;
  	UPDATE profiles SET follows=(follows + 1) WHERE uid=new.uid;
  	RETURN new;
END;
$$;


ALTER FUNCTION "public"."increase_relationship"() OWNER TO "postgres";

--
-- Name: profiles_valid_id_regex(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."profiles_valid_id_regex"("max_length" integer, "min_length" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  RETURN '^[a-z_0-9|-]{' || max_length || ',' || min_length || '}$';
END;
$_$;


ALTER FUNCTION "public"."profiles_valid_id_regex"("max_length" integer, "min_length" integer) OWNER TO "postgres";

--
-- Name: search_image_posts("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."search_image_posts"("query" "text") RETURNS "record"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
	pattern text = '%' || query || '%';
BEGIN
	SELECT * FROM image_posts i, json_array_elements(information) AS j
  		WHERE
    		j->>'prompt' ILIKE pattern OR
    		j->>'negative_prompt' ILIKE pattern OR
    		j->>'model' ILIKE pattern;
END;
$$;


ALTER FUNCTION "public"."search_image_posts"("query" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."bookmarks" (
    "id" bigint NOT NULL,
    "target" bigint NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" DEFAULT 'image_post'::"text" NOT NULL
);


ALTER TABLE "public"."bookmarks" OWNER TO "postgres";

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."comments" (
    "commentable_id" bigint NOT NULL,
    "author" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "commentable_type" "text" DEFAULT 'image_post'::"text" NOT NULL,
    "parent_id" bigint,
    "likes" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";

--
-- Name: contests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."contests" (
    "id" bigint NOT NULL,
    "title" "text",
    "description" "text"
);


ALTER TABLE "public"."contests" OWNER TO "postgres";

--
-- Name: contest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."contests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contest_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: image_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."image_posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text",
    "author" "uuid" NOT NULL,
    "tags" "text"[] NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL,
    "zoning" "text" DEFAULT 'normal'::"text" NOT NULL,
    "views" bigint DEFAULT '0'::bigint NOT NULL,
    "images" smallint DEFAULT '1'::smallint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bookmarks" bigint DEFAULT '0'::bigint NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "contest_id" bigint
);


ALTER TABLE "public"."image_posts" OWNER TO "postgres";

--
-- Name: image_posts_bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."bookmarks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."image_posts_bookmarks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: image_posts_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."comments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."image_posts_comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: image_posts_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."image_posts_information" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "prompt" "text",
    "index" smallint NOT NULL,
    "negative_prompt" "text",
    "model" "text",
    "steps" smallint,
    "cfg_scale" real,
    "sampler" "text",
    "seed" "text",
    "embedding" "text",
    "hypernetwork" "text",
    "vae" "text"
);


ALTER TABLE "public"."image_posts_information" OWNER TO "postgres";

--
-- Name: image_posts_information_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."image_posts_information" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."image_posts_information_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."likes" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "target" bigint NOT NULL,
    "id" bigint NOT NULL,
    "type" "text" DEFAULT 'image_post'::"text" NOT NULL
);


ALTER TABLE "public"."likes" OWNER TO "postgres";

--
-- Name: image_posts_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."image_posts_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: muted_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."muted_users" (
    "id" bigint NOT NULL,
    "target" "uuid" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."muted_users" OWNER TO "postgres";

--
-- Name: muted_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."muted_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."muted_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: n_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."image_posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."n_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."notifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "author" "uuid" NOT NULL,
    "target_user" "uuid",
    "target_image_post" bigint,
    "type" "text" NOT NULL,
    "target_comment" bigint
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."profiles" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "username" "text" NOT NULL,
    "twitter" "text",
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "follows" integer DEFAULT 0 NOT NULL,
    "followers" integer DEFAULT 0 NOT NULL,
    "introduction" "text",
    "zoning" "text"[] DEFAULT '{normal}'::"text"[] NOT NULL,
    CONSTRAINT "profiles_valid_id" CHECK (("id" ~ "public"."profiles_valid_id_regex"(1, 30)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

--
-- Name: random_image_posts; Type: VIEW; Schema: public; Owner: supabase_admin
--

CREATE VIEW "public"."random_image_posts" AS
 SELECT "image_posts"."id",
    "image_posts"."created_at",
    "image_posts"."title",
    "image_posts"."description",
    "image_posts"."author",
    "image_posts"."tags",
    "image_posts"."likes",
    "image_posts"."zoning",
    "image_posts"."views",
    "image_posts"."images",
    "image_posts"."updated_at",
    "image_posts"."bookmarks",
    "image_posts"."published"
   FROM "public"."image_posts"
  ORDER BY ("random"());


ALTER TABLE "public"."random_image_posts" OWNER TO "supabase_admin";

--
-- Name: relationship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."relationship" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uid" "uuid" NOT NULL,
    "target" "uuid" NOT NULL,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."relationship" OWNER TO "postgres";

--
-- Name: relationship_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."relationship" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."relationship_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."tags" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "used" bigint DEFAULT '1'::bigint NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";

--
-- Name: contests contest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."contests"
    ADD CONSTRAINT "contest_pkey" PRIMARY KEY ("id");


--
-- Name: bookmarks image_posts_bookmarks_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "image_posts_bookmarks_pk" PRIMARY KEY ("id");


--
-- Name: comments image_posts_comments_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "image_posts_comments_pk" PRIMARY KEY ("id");


--
-- Name: image_posts_information image_posts_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."image_posts_information"
    ADD CONSTRAINT "image_posts_information_pkey" PRIMARY KEY ("id");


--
-- Name: likes image_posts_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "image_posts_likes_pkey" PRIMARY KEY ("id");


--
-- Name: muted_users muted_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."muted_users"
    ADD CONSTRAINT "muted_users_pkey" PRIMARY KEY ("id");


--
-- Name: image_posts n_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."image_posts"
    ADD CONSTRAINT "n_images_pkey" PRIMARY KEY ("id");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_key" UNIQUE ("id");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("uid");


--
-- Name: profiles profiles_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_uid_key" UNIQUE ("uid");


--
-- Name: relationship relationship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."relationship"
    ADD CONSTRAINT "relationship_pkey" PRIMARY KEY ("id");


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("name");


--
-- Name: bookmarks on_delete_bookmark_decrease_bookmark_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_delete_bookmark_decrease_bookmark_count" BEFORE DELETE ON "public"."bookmarks" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_image_post_bookmark_count"();


--
-- Name: likes on_delete_like_decrease_like_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_delete_like_decrease_like_count" BEFORE DELETE ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_like_count"();


--
-- Name: relationship on_delete_relationship_decrease_relationship; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_delete_relationship_decrease_relationship" BEFORE DELETE ON "public"."relationship" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_relationship"();


--
-- Name: bookmarks on_insert_bookmark_increase_bookmark_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_bookmark_increase_bookmark_count" BEFORE INSERT ON "public"."bookmarks" FOR EACH ROW EXECUTE FUNCTION "public"."increase_image_post_bookmark_count"();


--
-- Name: comments on_insert_comment_create_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_comment_create_notification" BEFORE INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."create_image_post_comment_notification"();


--
-- Name: likes on_insert_like_craete_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_like_craete_notification" AFTER INSERT ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."create_like_notification"();


--
-- Name: likes on_insert_like_increase_like_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_like_increase_like_count" BEFORE INSERT ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_like_count"();


--
-- Name: relationship on_insert_relationship_create_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_relationship_create_notification" AFTER INSERT ON "public"."relationship" FOR EACH ROW EXECUTE FUNCTION "public"."create_relationship_notification"();


--
-- Name: relationship on_insert_relationship_increase_relationship; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "on_insert_relationship_increase_relationship" BEFORE INSERT ON "public"."relationship" FOR EACH ROW EXECUTE FUNCTION "public"."increase_relationship"();


--
-- Name: bookmarks bookmarks_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("uid");


--
-- Name: comments comments_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("uid");


--
-- Name: image_posts image_posts_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."image_posts"
    ADD CONSTRAINT "image_posts_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("uid");


--
-- Name: image_posts image_posts_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."image_posts"
    ADD CONSTRAINT "image_posts_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id");


--
-- Name: image_posts_information image_posts_information_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."image_posts_information"
    ADD CONSTRAINT "image_posts_information_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."image_posts"("id");


--
-- Name: notifications notifications_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."profiles"("uid");


--
-- Name: notifications notifications_target_comment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_target_comment_fkey" FOREIGN KEY ("target_comment") REFERENCES "public"."comments"("id");


--
-- Name: notifications notifications_target_image_post_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_target_image_post_fkey" FOREIGN KEY ("target_image_post") REFERENCES "public"."image_posts"("id");


--
-- Name: notifications notifications_target_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_target_user_fkey" FOREIGN KEY ("target_user") REFERENCES "public"."profiles"("uid");


--
-- Name: relationship relationship_target_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."relationship"
    ADD CONSTRAINT "relationship_target_fkey" FOREIGN KEY ("target") REFERENCES "public"."profiles"("uid");


--
-- Name: profiles Enable delete for users based on uid; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on uid" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "uid"));


--
-- Name: bookmarks Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."bookmarks" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: comments Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: image_posts Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."image_posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: image_posts_information Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."image_posts_information" FOR DELETE USING ((( SELECT "count"(*) AS "count"
   FROM "public"."image_posts"
  WHERE (("image_posts"."author" = "auth"."uid"()) AND ("image_posts"."id" = "image_posts_information"."post_id"))) > 0));


--
-- Name: likes Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."likes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: muted_users Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."muted_users" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: notifications Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "target_user") OR ("auth"."uid"() = "author")));


--
-- Name: relationship Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."relationship" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "uid") OR ("auth"."uid"() = "target")));


--
-- Name: bookmarks Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."bookmarks" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: comments Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: image_posts Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."image_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: image_posts_information Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."image_posts_information" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "count"(*) AS "count"
   FROM "public"."image_posts"
  WHERE (("image_posts"."author" = "auth"."uid"()) AND ("image_posts"."id" = "image_posts_information"."post_id"))) > 0));


--
-- Name: likes Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."likes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: muted_users Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."muted_users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: profiles Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "uid"));


--
-- Name: relationship Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."relationship" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "uid"));


--
-- Name: tags Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: comments Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."comments" FOR SELECT USING (true);


--
-- Name: contests Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."contests" FOR SELECT USING (true);


--
-- Name: image_posts Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."image_posts" FOR SELECT USING ((("auth"."uid"() = "author") OR ("published" = true)));


--
-- Name: image_posts_information Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."image_posts_information" FOR SELECT USING ((( SELECT "count"(*) AS "count"
   FROM "public"."image_posts"
  WHERE (("image_posts"."id" = "image_posts_information"."post_id") AND (("image_posts"."published" = true) OR ("image_posts"."author" = "auth"."uid"())))) > 0));


--
-- Name: likes Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."likes" FOR SELECT USING (true);


--
-- Name: notifications Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."notifications" FOR SELECT TO "authenticated" USING (true);


--
-- Name: profiles Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);


--
-- Name: relationship Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."relationship" FOR SELECT USING (true);


--
-- Name: tags Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."tags" FOR SELECT USING (true);


--
-- Name: muted_users Enable read access for users based on their user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for users based on their user_id" ON "public"."muted_users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: bookmarks Enable read for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read for users based on user_id" ON "public"."bookmarks" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "author"));


--
-- Name: image_posts Enable update for users based on email; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on email" ON "public"."image_posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author")) WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: tags Enable update for users based on email; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on email" ON "public"."tags" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);


--
-- Name: profiles Enable update for users based on uid; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on uid" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "uid")) WITH CHECK (("auth"."uid"() = "uid"));


--
-- Name: bookmarks Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on user_id" ON "public"."bookmarks" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author")) WITH CHECK (("auth"."uid"() = "author"));


--
-- Name: image_posts_information Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on user_id" ON "public"."image_posts_information" FOR UPDATE USING ((( SELECT "count"(*) AS "count"
   FROM "public"."image_posts"
  WHERE (("image_posts"."author" = "auth"."uid"()) AND ("image_posts"."id" = "image_posts_information"."post_id"))) > 0)) WITH CHECK ((( SELECT "count"(*) AS "count"
   FROM "public"."image_posts"
  WHERE (("image_posts"."author" = "auth"."uid"()) AND ("image_posts"."id" = "image_posts_information"."post_id"))) > 0));


--
-- Name: notifications Enable update for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on user_id" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "target_user")) WITH CHECK (("auth"."uid"() = "target_user"));


--
-- Name: bookmarks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

--
-- Name: contests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."contests" ENABLE ROW LEVEL SECURITY;

--
-- Name: image_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."image_posts" ENABLE ROW LEVEL SECURITY;

--
-- Name: image_posts_information; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."image_posts_information" ENABLE ROW LEVEL SECURITY;

--
-- Name: likes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

--
-- Name: muted_users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."muted_users" ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: relationship; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."relationship" ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "get_built_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "graphql"."get_built_schema_version"() TO "postgres";
GRANT ALL ON FUNCTION "graphql"."get_built_schema_version"() TO "anon";
GRANT ALL ON FUNCTION "graphql"."get_built_schema_version"() TO "authenticated";
GRANT ALL ON FUNCTION "graphql"."get_built_schema_version"() TO "service_role";


--
-- Name: FUNCTION "rebuild_on_ddl"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "graphql"."rebuild_on_ddl"() TO "postgres";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_ddl"() TO "anon";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_ddl"() TO "authenticated";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_ddl"() TO "service_role";


--
-- Name: FUNCTION "rebuild_on_drop"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "graphql"."rebuild_on_drop"() TO "postgres";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_drop"() TO "anon";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_drop"() TO "authenticated";
GRANT ALL ON FUNCTION "graphql"."rebuild_on_drop"() TO "service_role";


--
-- Name: FUNCTION "rebuild_schema"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "graphql"."rebuild_schema"() TO "postgres";
GRANT ALL ON FUNCTION "graphql"."rebuild_schema"() TO "anon";
GRANT ALL ON FUNCTION "graphql"."rebuild_schema"() TO "authenticated";
GRANT ALL ON FUNCTION "graphql"."rebuild_schema"() TO "service_role";


--
-- Name: FUNCTION "variable_definitions_sort"("variable_definitions" "jsonb"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "graphql"."variable_definitions_sort"("variable_definitions" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "graphql"."variable_definitions_sort"("variable_definitions" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "graphql"."variable_definitions_sort"("variable_definitions" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "graphql"."variable_definitions_sort"("variable_definitions" "jsonb") TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: SEQUENCE "key_key_id_seq"; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "create_image_post_comment_notification"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_image_post_comment_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_image_post_comment_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_image_post_comment_notification"() TO "service_role";


--
-- Name: FUNCTION "create_image_post_comment_reply_notification"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_image_post_comment_reply_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_image_post_comment_reply_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_image_post_comment_reply_notification"() TO "service_role";


--
-- Name: FUNCTION "create_like_notification"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_like_notification"() TO "service_role";


--
-- Name: FUNCTION "create_relationship_notification"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_relationship_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_relationship_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_relationship_notification"() TO "service_role";


--
-- Name: FUNCTION "decrease_image_post_bookmark_count"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."decrease_image_post_bookmark_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_image_post_bookmark_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_image_post_bookmark_count"() TO "service_role";


--
-- Name: FUNCTION "decrease_like_count"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."decrease_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_like_count"() TO "service_role";


--
-- Name: FUNCTION "decrease_relationship"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."decrease_relationship"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_relationship"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_relationship"() TO "service_role";


--
-- Name: FUNCTION "increase_image_post_bookmark_count"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."increase_image_post_bookmark_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_image_post_bookmark_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_image_post_bookmark_count"() TO "service_role";


--
-- Name: FUNCTION "increase_image_post_view"("target" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."increase_image_post_view"("target" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increase_image_post_view"("target" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_image_post_view"("target" bigint) TO "service_role";


--
-- Name: FUNCTION "increase_like_count"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."increase_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_like_count"() TO "service_role";


--
-- Name: FUNCTION "increase_relationship"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."increase_relationship"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_relationship"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_relationship"() TO "service_role";


--
-- Name: FUNCTION "profiles_valid_id_regex"("max_length" integer, "min_length" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."profiles_valid_id_regex"("max_length" integer, "min_length" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."profiles_valid_id_regex"("max_length" integer, "min_length" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."profiles_valid_id_regex"("max_length" integer, "min_length" integer) TO "service_role";


--
-- Name: FUNCTION "search_image_posts"("query" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."search_image_posts"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_image_posts"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_image_posts"("query" "text") TO "service_role";


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: TABLE "schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON TABLE "graphql"."schema_version" TO "postgres";
GRANT ALL ON TABLE "graphql"."schema_version" TO "anon";
GRANT ALL ON TABLE "graphql"."schema_version" TO "authenticated";
GRANT ALL ON TABLE "graphql"."schema_version" TO "service_role";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "valid_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyiduser";


--
-- Name: TABLE "bookmarks"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";


--
-- Name: TABLE "comments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";


--
-- Name: TABLE "contests"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."contests" TO "anon";
GRANT ALL ON TABLE "public"."contests" TO "authenticated";
GRANT ALL ON TABLE "public"."contests" TO "service_role";


--
-- Name: SEQUENCE "contest_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."contest_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contest_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contest_id_seq" TO "service_role";


--
-- Name: TABLE "image_posts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."image_posts" TO "anon";
GRANT ALL ON TABLE "public"."image_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."image_posts" TO "service_role";


--
-- Name: SEQUENCE "image_posts_bookmarks_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."image_posts_bookmarks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_posts_bookmarks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_posts_bookmarks_id_seq" TO "service_role";


--
-- Name: SEQUENCE "image_posts_comments_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."image_posts_comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_posts_comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_posts_comments_id_seq" TO "service_role";


--
-- Name: TABLE "image_posts_information"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."image_posts_information" TO "anon";
GRANT ALL ON TABLE "public"."image_posts_information" TO "authenticated";
GRANT ALL ON TABLE "public"."image_posts_information" TO "service_role";


--
-- Name: SEQUENCE "image_posts_information_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."image_posts_information_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_posts_information_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_posts_information_id_seq" TO "service_role";


--
-- Name: TABLE "likes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";


--
-- Name: SEQUENCE "image_posts_likes_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."image_posts_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_posts_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_posts_likes_id_seq" TO "service_role";


--
-- Name: TABLE "muted_users"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."muted_users" TO "anon";
GRANT ALL ON TABLE "public"."muted_users" TO "authenticated";
GRANT ALL ON TABLE "public"."muted_users" TO "service_role";


--
-- Name: SEQUENCE "muted_users_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."muted_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."muted_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."muted_users_id_seq" TO "service_role";


--
-- Name: SEQUENCE "n_images_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."n_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_images_id_seq" TO "service_role";


--
-- Name: TABLE "notifications"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";


--
-- Name: SEQUENCE "notifications_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: TABLE "random_image_posts"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."random_image_posts" TO "postgres";
GRANT ALL ON TABLE "public"."random_image_posts" TO "anon";
GRANT ALL ON TABLE "public"."random_image_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."random_image_posts" TO "service_role";


--
-- Name: TABLE "relationship"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."relationship" TO "anon";
GRANT ALL ON TABLE "public"."relationship" TO "authenticated";
GRANT ALL ON TABLE "public"."relationship" TO "service_role";


--
-- Name: SEQUENCE "relationship_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."relationship_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."relationship_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."relationship_id_seq" TO "service_role";


--
-- Name: TABLE "tags"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;
