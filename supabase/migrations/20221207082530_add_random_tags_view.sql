create or replace view "public"."random_tags" as  SELECT tags.created_at,
    tags.name,
    tags.used
   FROM tags
  ORDER BY (random());
