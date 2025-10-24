-- =========================================
-- NETTOYAGE DES FONCTIONS ET TABLES EXISTANTES
-- =========================================
DROP FUNCTION IF EXISTS get_and_mark_tickets(INT) CASCADE;
DROP FUNCTION IF EXISTS fetch_and_mark_email_jobs(INT) CASCADE;

DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS draw_date CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS tickets_number CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS roue_plays CASCADE;



-- =========================================
-- TABLES PRINCIPALES
-- =========================================

-- Tickets achetés
CREATE TABLE tickets (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email TEXT NOT NULL,
            full_name TEXT NOT NULL,
            ticket_number VARCHAR(6) NOT NULL UNIQUE CHECK (char_length(ticket_number) = 6),
            access_token UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
);

-- Date du tirage (Par défaut le 17 novembre 2025 à 20h)
CREATE TABLE draw_date (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            draw_date TIMESTAMP NOT NULL
);

INSERT INTO draw_date (draw_date) VALUES ('2025-11-17 20:00:00');


-- Gagnants
CREATE TABLE winners (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            ticket VARCHAR(6) NOT NULL UNIQUE CHECK (char_length(ticket) = 6),
            rank INT NOT NULL UNIQUE,
            notified BOOLEAN DEFAULT FALSE
);

-- Clients à notifier
CREATE TABLE notifications (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            access_token UUID NOT NULL,
            notified BOOLEAN DEFAULT FALSE
);

-- =========================================
-- TABLE DES NUMÉROS DE TICKETS DISPONIBLES
-- =========================================

CREATE TABLE tickets_number (
            id SERIAL PRIMARY KEY,
            ticket_number VARCHAR(6) UNIQUE NOT NULL CHECK (char_length(ticket_number) = 6),
            used BOOLEAN DEFAULT FALSE
);

-- Index pour accélérer la recherche de tickets libres
CREATE INDEX idx_tickets_used ON tickets_number (used);

-- Préremplissage avec 900 000 tickets aléatoires
INSERT INTO tickets_number (ticket_number)
SELECT LPAD(gs::text, 6, '0')
FROM generate_series(100000, 999999) AS gs
ORDER BY random();

-- Clé étrangère : tickets achetés doivent exister dans tickets_number
ALTER TABLE tickets
    ADD CONSTRAINT fk_ticket_number FOREIGN KEY (ticket_number) REFERENCES tickets_number(ticket_number);

-- =========================================
-- INDEX SUPPLÉMENTAIRES
-- =========================================
CREATE INDEX tickets_email_idx ON tickets(email);
CREATE INDEX tickets_token_idx ON tickets(access_token);
CREATE INDEX idx_notifications_notified ON notifications(notified);

-- =========================================
-- FONCTION RPC : attribution sécurisée de tickets
-- =========================================
CREATE OR REPLACE FUNCTION get_and_mark_tickets(quantity INT)
RETURNS TABLE(ticket_number VARCHAR(6)) AS $$
BEGIN
RETURN QUERY
    WITH selected AS (
        SELECT tn.ticket_number AS tn_number
        FROM tickets_number tn
        WHERE tn.used = FALSE
        LIMIT quantity
        FOR UPDATE SKIP LOCKED
    )
UPDATE tickets_number tn
SET used = TRUE
WHERE tn.ticket_number IN (SELECT tn_number FROM selected)
    RETURNING tn.ticket_number;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FILE D’ATTENTE POUR LES EMAILS
-- =========================================
CREATE TABLE email_queue (
            id BIGSERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            access_token UUID NOT NULL,
            ticket_numbers TEXT[] NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, sent, failed
            retries INT NOT NULL DEFAULT 0,
            last_error TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);

-- =========================================
-- FONCTION RPC : récupérer et verrouiller des jobs email
-- =========================================
CREATE OR REPLACE FUNCTION fetch_and_mark_email_jobs(batch INT)
RETURNS TABLE(
    id BIGINT,
    full_name TEXT,
    email TEXT,
    access_token UUID,
    ticket_numbers TEXT[],
    retries INT
) AS $$
BEGIN
RETURN QUERY
    WITH sel AS (
        SELECT q.id
        FROM email_queue q
        WHERE q.status = 'pending'
        ORDER BY q.created_at
        LIMIT batch
        FOR UPDATE SKIP LOCKED
    )
UPDATE email_queue AS q
SET status = 'processing', updated_at = now()
    FROM sel
WHERE q.id = sel.id
    RETURNING q.id, q.full_name, q.email, q.access_token, q.ticket_numbers, q.retries;
END;
$$ LANGUAGE plpgsql;


-- =========================================
-- Valeur du taux de victoire de la roue
-- =========================================

CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            value NUMERIC CHECK (value BETWEEN 0 AND 1)
);
INSERT INTO settings (key, value) VALUES ('win_probability', 0.10);




-- =========================================
-- Participation au tirage de la roue
-- =========================================

CREATE TABLE roue_plays (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            total_wins INT NOT NULL DEFAULT 0,
            total_losses INT NOT NULL DEFAULT 0,
            last_result TEXT CHECK (last_result IN ('win', 'lose')),
            played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            played_date DATE GENERATED ALWAYS AS ((played_at AT TIME ZONE 'Europe/Paris')::date) STORED

);

-- Empêche plusieurs jeux dans la même journée
CREATE UNIQUE INDEX unique_play_per_day_idx ON roue_plays (email, played_date);