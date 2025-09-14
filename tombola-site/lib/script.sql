drop table tickets cascade;
drop table draw_date cascade;
drop table winners cascade;


-- Table pour stocker les tickets achetés
create table if not exists tickets (
        id bigint generated always as identity primary key,
        email text not null,
        full_name text not null,
        ticket_number bigint not null,
        access_token uuid not null,
        created_at timestamp with time zone default now()
);

-- Table pour stocker la date du tirage
create table  if not exists draw_date (
        id bigint generated always as identity primary key,
        draw_date timestamp not null
);


-- Table pour stocker les gagnants
create table if not exists winners (
        id bigint generated always as identity primary key,
        name text not null,
        ticket char(6) not null UNIQUE,
        rank int not null unique check (rank between 1 and 5)
);


-- Index pour accélérer les recherches par email
create index if not exists tickets_email_idx on tickets(email);

-- Index pour accélérer les recherches par token
create index if not exists tickets_token_idx on tickets(access_token);
