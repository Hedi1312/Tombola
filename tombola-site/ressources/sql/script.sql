-- Supprimer d'abord la fonction si elle existe
DROP FUNCTION IF EXISTS get_and_mark_tickets(INT) CASCADE;

drop table if exists tickets cascade;
drop table if exists draw_date cascade;
drop table if exists winners cascade;
drop table if exists notifications cascade;
drop table if exists tickets_number cascade;


-- Table pour stocker les tickets achetés
create table tickets (
        id bigint generated always as identity primary key,
        email text not null,
        full_name text not null,
        ticket_number VARCHAR(6) NOT NULL UNIQUE CHECK (char_length(ticket_number) = 6),
        access_token uuid not null,
        created_at timestamp with time zone default now()
);

-- Table pour stocker la date du tirage
create table draw_date (
        id bigint generated always as identity primary key,
        draw_date timestamp not null
);


-- Table pour stocker les gagnants
create table winners (
        id bigint generated always as identity primary key,
        name text not null,
        email text not null UNIQUE,
        ticket VARCHAR(6) NOT NULL UNIQUE CHECK (char_length(ticket) = 6),
        rank int not null unique check (rank between 1 and 7)
);


-- Table pour stocker les clients à prévenir
create table notifications (
        id bigint generated always as identity primary key,
        full_name text not null,
        email text not null unique,
        access_token uuid NOT NULL,
        notified boolean default false
);


-- Table pour stocker les tickets à attribuer
CREATE TABLE tickets_number (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(6) UNIQUE NOT NULL CHECK (char_length(ticket_number) = 6),
        used BOOLEAN DEFAULT FALSE
);

-- Index pour accélérer la recherche de tickets libres
CREATE INDEX idx_tickets_used ON tickets_number (used);

-- Préremplir avec 900 000 tickets formatés à 6 caractères et mélangés
INSERT INTO tickets_number (ticket_number)
SELECT LPAD(gs::text, 6, '0')
FROM generate_series(100000, 999999) AS gs
ORDER BY random();


-- Contrainte pour éviter d’attribuer un ticket inexistant
alter table tickets add constraint fk_ticket_number foreign key (ticket_number) references tickets_number(ticket_number);


-- Index pour accélérer les recherches par email
create index tickets_email_idx on tickets(email);

-- Index pour accélérer les recherches par token
create index tickets_token_idx on tickets(access_token);

-- Index pour optimiser les requêtes sur les utilisateurs non notifiés
create index idx_notifications_notified on notifications(notified);


-- 🔹 Fonction RPC pour récupérer et verrouiller des tickets en toute sécurité
CREATE OR REPLACE FUNCTION get_and_mark_tickets(quantity INT)
RETURNS TABLE(ticket_number VARCHAR(6)) AS $$
BEGIN
    RETURN QUERY
        WITH selected AS (
                SELECT tn.ticket_number AS tn_number
                FROM tickets_number tn
                WHERE tn.used = FALSE
                LIMIT quantity
                FOR UPDATE
        )
        UPDATE tickets_number tn
        SET used = TRUE
        WHERE tn.ticket_number IN (SELECT tn_number FROM selected)
        RETURNING tn.ticket_number;
END;
$$ LANGUAGE plpgsql;