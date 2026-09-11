-- =============================================================================
-- schema-h2.sql  –  H2 (MSSQLServer compatibility mode)
-- Ground truth: Java entities as of 2026-07-11
-- Tables: users, otps, categories, novels, novel_categories, chapters,
--         chapter_unlocks, bookmarks, payments, coin_transactions,
--         coin_packages, orders, revenues
-- =============================================================================

-- ---------------------------------------------------------------
-- DROP ORDER (children before parents)
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS revenues;
DROP TABLE IF EXISTS coin_transactions;
DROP TABLE IF EXISTS chapter_unlocks;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS novel_categories;
DROP TABLE IF EXISTS novels;
DROP TABLE IF EXISTS coin_packages;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------
-- 1. users
--    Entity: User (own id, Instant createdAt/updatedAt)
--    role     → UserRole  : ADMIN | USER
-- ---------------------------------------------------------------
CREATE TABLE users (
    id           UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    role         VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','USER')),
    username     VARCHAR(255) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(20)  UNIQUE,
    address      VARCHAR(255),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    coin_balance INT          NOT NULL DEFAULT 0,
    is_author    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role      ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ---------------------------------------------------------------
-- 2. otps
--    Entity: OTP (own id – no FK to users, no is_used, uses expiry_time)
-- ---------------------------------------------------------------
CREATE TABLE otps (
    id          UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    otp_code    VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP    NOT NULL
);
CREATE INDEX idx_otps_email ON otps(email);

-- ---------------------------------------------------------------
-- 3. categories
--    Entity: Category (own id, NO timestamps)
-- ---------------------------------------------------------------
CREATE TABLE categories (
    id   UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ---------------------------------------------------------------
-- 4. coin_packages
--    Entity: CoinPackage (own id, Instant createdAt/updatedAt)
-- ---------------------------------------------------------------
CREATE TABLE coin_packages (
    id               UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    price_vnd        INT          NOT NULL,
    base_coins       INT          NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------
-- 5. novels
--    Entity: Novel (own id, Instant createdAt/updatedAt)
--    status → NovelStatus : ONGOING | COMPLETED | CANCELLED
-- ---------------------------------------------------------------
CREATE TABLE novels (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    author_id       UUID         NOT NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(300) NOT NULL UNIQUE,
    description     CLOB,
    cover_image_url VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ONGOING'
                    CHECK (status IN ('ONGOING','COMPLETED','CANCELLED')),
    view_count      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE INDEX idx_novels_author_id  ON novels(author_id);
CREATE INDEX idx_novels_slug       ON novels(slug);
CREATE INDEX idx_novels_status     ON novels(status);
CREATE INDEX idx_novels_created_at ON novels(created_at);

-- ---------------------------------------------------------------
-- 6. novel_categories
--    Entity: NovelCategory (@EmbeddedId novel_id + category_id)
-- ---------------------------------------------------------------
CREATE TABLE novel_categories (
    novel_id    BIGINT NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (novel_id, category_id),
    FOREIGN KEY (novel_id)    REFERENCES novels(id)     ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX idx_novel_categories_category_id ON novel_categories(category_id);

-- ---------------------------------------------------------------
-- 7. chapters
--    Entity: Chapter (own id, Instant createdAt/updatedAt)
--    status → ChapterStatus : FREE | LOCKED | UNLOCKED
--    NO is_free column (removed from entity)
-- ---------------------------------------------------------------
CREATE TABLE chapters (
    id             BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    novel_id       BIGINT       NOT NULL,
    chapter_number INT          NOT NULL,
    title          VARCHAR(255) NOT NULL,
    slug           VARCHAR(300) NOT NULL,
    content        CLOB,
    audio_url      VARCHAR(1000),
    status         VARCHAR(10)  NOT NULL DEFAULT 'FREE'
                   CHECK (status IN ('FREE','LOCKED','UNLOCKED')),
    coin_price     INT          NOT NULL DEFAULT 0,
    view_count     INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    CONSTRAINT uq_chapters_novel_number UNIQUE (novel_id, chapter_number)
);
CREATE INDEX idx_chapters_novel_id   ON chapters(novel_id);
CREATE INDEX idx_chapters_slug       ON chapters(slug);
CREATE INDEX idx_chapters_status     ON chapters(status);
CREATE INDEX idx_chapters_created_at ON chapters(created_at);

-- ---------------------------------------------------------------
-- 8. chapter_unlocks
--    Entity: ChapterUnlock (own id, unlocked_at only – no updated_at)
-- ---------------------------------------------------------------
CREATE TABLE chapter_unlocks (
    id          UUID      NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id     UUID      NOT NULL,
    chapter_id  BIGINT    NOT NULL,
    coins_spent INT       NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    CONSTRAINT uq_chapter_unlocks_user_chapter UNIQUE (user_id, chapter_id)
);
CREATE INDEX idx_chapter_unlocks_user_id    ON chapter_unlocks(user_id);
CREATE INDEX idx_chapter_unlocks_chapter_id ON chapter_unlocks(chapter_id);

-- ---------------------------------------------------------------
-- 9. bookmarks
--    Entity: Bookmark (own id, Instant createdAt/updatedAt)
--    last_page NOT NULL per @NotNull
-- ---------------------------------------------------------------
CREATE TABLE bookmarks (
    id              UUID      NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id         UUID      NOT NULL,
    novel_id        BIGINT    NOT NULL,
    last_chapter_id BIGINT,
    is_favorite     BOOLEAN   NOT NULL DEFAULT FALSE,
    reading_progress_percent INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (novel_id)        REFERENCES novels(id)   ON DELETE CASCADE,
    FOREIGN KEY (last_chapter_id) REFERENCES chapters(id),
    CONSTRAINT uq_bookmarks_user_novel UNIQUE (user_id, novel_id)
);
CREATE INDEX idx_bookmarks_user_id    ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_novel_id   ON bookmarks(novel_id);
CREATE INDEX idx_bookmarks_updated_at ON bookmarks(updated_at);

-- ---------------------------------------------------------------
-- 10. payments
--     Entity: Payment (own id, created_at ONLY – no updated_at)
--     status   → PaymentStatus  : PENDING | SUCCESS | FAILED
--     provider  VARCHAR(20)
--     transaction_ref VARCHAR(100)
-- ---------------------------------------------------------------
CREATE TABLE payments (
    id              UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id         UUID         NOT NULL,
    amount_vnd      INT          NOT NULL,
    coins_received  INT          NOT NULL,
    status          VARCHAR(10)  NOT NULL
                    CHECK (status IN ('PENDING','SUCCESS','FAILED')),
    provider        VARCHAR(20)  NOT NULL,
    transaction_ref VARCHAR(100) UNIQUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_payments_user_id    ON payments(user_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ---------------------------------------------------------------
-- 11. coin_transactions
--     Entity: CoinTransaction (own id, created_at ONLY)
--     type → CoinTransactionType : TOPUP | UNLOCKED_CHAPTER
-- ---------------------------------------------------------------
CREATE TABLE coin_transactions (
    id            UUID         NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id       UUID         NOT NULL,
    type          VARCHAR(30)  NOT NULL
                  CHECK (type IN ('TOPUP','UNLOCKED_CHAPTER', 'AUTHOR_REVENUE')),
    amount        INT          NOT NULL,
    balance_after INT          NOT NULL,
    ref_id        UUID,
    note          VARCHAR(255),
    coin_package_id UUID,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id)
);
CREATE INDEX idx_coin_transactions_user_id    ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type       ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

-- ---------------------------------------------------------------
-- 12. orders
--     Entity: Order extends BaseEntity (id: UUID, created_at/updated_at: LocalDateTime via JPA auditing)
--     status → OrderStatus : PENDING | COMPLETED | CANCELLED
-- ---------------------------------------------------------------
CREATE TABLE orders (
    id              UUID        NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id         UUID        NOT NULL,
    coin_package_id UUID        NOT NULL,
    amount_vnd      INT         NOT NULL,
    coins           INT         NOT NULL,
    status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('PENDING','COMPLETED','CANCELLED')),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id),
    FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id)
);
CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ---------------------------------------------------------------
-- 13. revenues
--     Entity: Revenue (own id, calculated_at ONLY)
-- ---------------------------------------------------------------
CREATE TABLE revenues (
    id                  UUID           NOT NULL DEFAULT RANDOM_UUID() PRIMARY KEY,
    novel_id            BIGINT         NOT NULL,
    author_id           UUID           NOT NULL,
    total_coins_earned  INT            NOT NULL DEFAULT 0,
    free_chapter_count  INT            NOT NULL DEFAULT 0,
    total_chapter_count INT            NOT NULL DEFAULT 0,
    author_share_percent DECIMAL(5,2)  NOT NULL DEFAULT 70.00,
    author_coins        INT            NOT NULL DEFAULT 0,
    calculated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (novel_id)  REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT uq_revenues_novel_author UNIQUE (novel_id, author_id)
);
CREATE INDEX idx_revenues_author_id     ON revenues(author_id);
CREATE INDEX idx_revenues_calculated_at ON revenues(calculated_at);
