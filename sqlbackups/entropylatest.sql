PGDMP                         w           entropy    11.3    11.3                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                       false                       1262    16407    entropy    DATABASE     �   CREATE DATABASE entropy WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'English_United States.1252' LC_CTYPE = 'English_United States.1252';
    DROP DATABASE entropy;
             postgres    false                       0    0    DATABASE entropy    ACL     '   GRANT ALL ON DATABASE entropy TO test;
                  postgres    false    2833            �            1259    16412 
   gameobject    TABLE       CREATE TABLE public.gameobject (
    positiony double precision NOT NULL,
    positionx double precision NOT NULL,
    id integer NOT NULL,
    gameobjecttypeid integer NOT NULL,
    positionz double precision NOT NULL,
    color double precision[],
    scale double precision[]
);
    DROP TABLE public.gameobject;
       public         test    false            �            1259    16410    gameobject_gameobjecttypeid_seq    SEQUENCE     �   CREATE SEQUENCE public.gameobject_gameobjecttypeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.gameobject_gameobjecttypeid_seq;
       public       test    false    198                       0    0    gameobject_gameobjecttypeid_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.gameobject_gameobjecttypeid_seq OWNED BY public.gameobject.gameobjecttypeid;
            public       test    false    197            �            1259    16408    gameobject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.gameobject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.gameobject_id_seq;
       public       test    false    198                       0    0    gameobject_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.gameobject_id_seq OWNED BY public.gameobject.id;
            public       test    false    196            �            1259    16421    gameobjecttype    TABLE     V   CREATE TABLE public.gameobjecttype (
    id integer NOT NULL,
    description text
);
 "   DROP TABLE public.gameobjecttype;
       public         test    false            �            1259    16419    gameobjecttype_id_seq    SEQUENCE     �   CREATE SEQUENCE public.gameobjecttype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.gameobjecttype_id_seq;
       public       test    false    200                       0    0    gameobjecttype_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.gameobjecttype_id_seq OWNED BY public.gameobjecttype.id;
            public       test    false    199            �
           2604    16415    gameobject id    DEFAULT     n   ALTER TABLE ONLY public.gameobject ALTER COLUMN id SET DEFAULT nextval('public.gameobject_id_seq'::regclass);
 <   ALTER TABLE public.gameobject ALTER COLUMN id DROP DEFAULT;
       public       test    false    196    198    198            �
           2604    16416    gameobject gameobjecttypeid    DEFAULT     �   ALTER TABLE ONLY public.gameobject ALTER COLUMN gameobjecttypeid SET DEFAULT nextval('public.gameobject_gameobjecttypeid_seq'::regclass);
 J   ALTER TABLE public.gameobject ALTER COLUMN gameobjecttypeid DROP DEFAULT;
       public       test    false    197    198    198            �
           2604    16424    gameobjecttype id    DEFAULT     v   ALTER TABLE ONLY public.gameobjecttype ALTER COLUMN id SET DEFAULT nextval('public.gameobjecttype_id_seq'::regclass);
 @   ALTER TABLE public.gameobjecttype ALTER COLUMN id DROP DEFAULT;
       public       test    false    199    200    200            	          0    16412 
   gameobject 
   TABLE DATA               i   COPY public.gameobject (positiony, positionx, id, gameobjecttypeid, positionz, color, scale) FROM stdin;
    public       test    false    198   �                 0    16421    gameobjecttype 
   TABLE DATA               9   COPY public.gameobjecttype (id, description) FROM stdin;
    public       test    false    200   �                  0    0    gameobject_gameobjecttypeid_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.gameobject_gameobjecttypeid_seq', 1, true);
            public       test    false    197                       0    0    gameobject_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.gameobject_id_seq', 25, true);
            public       test    false    196                       0    0    gameobjecttype_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.gameobjecttype_id_seq', 2, true);
            public       test    false    199            �
           2606    16418    gameobject gameobject_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.gameobject
    ADD CONSTRAINT gameobject_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.gameobject DROP CONSTRAINT gameobject_pkey;
       public         test    false    198            �
           2606    16429 "   gameobjecttype gameobjecttype_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.gameobjecttype
    ADD CONSTRAINT gameobjecttype_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.gameobjecttype DROP CONSTRAINT gameobjecttype_pkey;
       public         test    false    200            	   �  x���Kn%7E��������4z�9*'�3�.�񊼇W��}���S��_?��K��������<??��5޲=rܴ��-*�俿�������P�>yN�\�E�];���OP��od��Hg�n��O>�IE���m�y涶ݥ۞D��!�R[G\�b*��if(�Hyy�~
���f��Ȏm�7:�Tb0`Oz�w��Dҭ�v	���о�;5�J��0�y�[F-,�ܳR{nTz�V������g_ix����덌�B�}�?6ؕ������Gx]����P��v��O^����h���ă��x�fi�ۙ�j�
����^��wX�,�e�:K���¯���6|��ѩ%�Ş�@�~���K���љ΄�2֑Г���̵�u����1���r���'��I6ܗ&vr*�jUH`��bCh��%ů������ʬIh6�67f6o7$� �-C����=e������@���+�.E�[9̝�`�GK㣳����E��Il�����ջϒ��*d�c��ؒl@0ثʼ���b���Mv���7q����ћ=E�N�$��q;�s,z�y	:
��voGg�9�f(�?�?D^�v�wn0`8�UF�$��W;,8�~��sW�_�?���ǟU�ّ         &   x�3���-�IUH.MJ�2�)�L�K�I����� �t�     