/*
The following are the commands executed to setup the database for this project. It assumes a user named test already exists and 
currently runs on a postgres database. In order to run this project in a different type of database please replicate this schema
or alter it as needed (as well as the queries in server.js) to work with your database type.
*/

CREATE DATABASE entropy
GRANT ALL ON DATABASE entropy TO postgres;
GRANT ALL ON DATABASE entropy TO test;

CREATE TABLE public.gameobject
(
    positiony double precision NOT NULL,
    positionx double precision NOT NULL,
    id integer NOT NULL DEFAULT nextval('gameobject_id_seq'::regclass) ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    gameobjecttypeid integer NOT NULL DEFAULT nextval('gameobject_gameobjecttypeid_seq'::regclass) ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    positionz double precision NOT NULL,
    color double precision[],
    scale double precision[],
    name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT gameobject_pkey PRIMARY KEY (id)
)

CREATE TABLE public.gameobjecttype
(
    id integer NOT NULL DEFAULT nextval('gameobjecttype_id_seq'::regclass) ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    description text COLLATE pg_catalog."default",
    CONSTRAINT gameobjecttype_pkey PRIMARY KEY (id)
)