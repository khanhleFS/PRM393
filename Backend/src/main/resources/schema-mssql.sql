    -- =============================================================================
    -- schema-mssql.sql  –  Microsoft SQL Server
    -- Ground truth: Java entities as of 2026-07-11
    -- NOTE: With spring.jpa.hibernate.ddl-auto=update, Hibernate auto-creates tables.
    --       This file is a reference/manual-run script only.
    -- =============================================================================

-- ---------------------------------------------------------------
-- DROP ORDER (children before parents)
-- ---------------------------------------------------------------
IF OBJECT_ID('author_payment_tickets','U') IS NOT NULL DROP TABLE author_payment_tickets;
IF OBJECT_ID('author_profiles','U')       IS NOT NULL DROP TABLE author_profiles;
IF OBJECT_ID('revenues','U')         IS NOT NULL DROP TABLE revenues;
IF OBJECT_ID('coin_transactions','U') IS NOT NULL DROP TABLE coin_transactions;
IF OBJECT_ID('chapter_unlocks','U')  IS NOT NULL DROP TABLE chapter_unlocks;
IF OBJECT_ID('bookmarks','U')        IS NOT NULL DROP TABLE bookmarks;
IF OBJECT_ID('payments','U')         IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('orders','U')           IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('chapters','U')         IS NOT NULL DROP TABLE chapters;
IF OBJECT_ID('novel_categories','U') IS NOT NULL DROP TABLE novel_categories;
IF OBJECT_ID('novels','U')           IS NOT NULL DROP TABLE novels;
IF OBJECT_ID('coin_packages','U')    IS NOT NULL DROP TABLE coin_packages;
IF OBJECT_ID('otps','U')             IS NOT NULL DROP TABLE otps;
IF OBJECT_ID('categories','U')       IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('users','U')            IS NOT NULL DROP TABLE users;

-- ---------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------
CREATE TABLE users (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    role         NVARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN','USER','AUTHOR')),
    username     NVARCHAR(255)    NOT NULL,
    email        NVARCHAR(255)    NOT NULL,
    password     NVARCHAR(255)    NOT NULL,
    phone        NVARCHAR(20)     NULL,
    address      NVARCHAR(255)    NULL,
    is_active    BIT              NOT NULL DEFAULT 1,
    coin_balance INT              NOT NULL DEFAULT 0,
    is_author    BIT              NOT NULL DEFAULT 0,
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT uq_users_phone    UNIQUE (phone)
);
CREATE INDEX idx_users_role      ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

    -- ---------------------------------------------------------------
    -- 2. otps
    -- ---------------------------------------------------------------
    CREATE TABLE otps (
        id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        email       NVARCHAR(255)    NOT NULL,
        otp_code    NVARCHAR(255)    NOT NULL,
        expiry_time DATETIME2        NOT NULL
    );
    CREATE INDEX idx_otps_email ON otps(email);

    -- ---------------------------------------------------------------
    -- 3. categories
    -- ---------------------------------------------------------------
    CREATE TABLE categories (
        id   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        name NVARCHAR(100)    NOT NULL,
        slug NVARCHAR(120)    NOT NULL,
        CONSTRAINT uq_categories_name UNIQUE (name),
        CONSTRAINT uq_categories_slug UNIQUE (slug)
    );
    CREATE INDEX idx_categories_slug ON categories(slug);

    -- ---------------------------------------------------------------
    -- 4. coin_packages
    -- ---------------------------------------------------------------
    CREATE TABLE coin_packages (
        id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        name             NVARCHAR(100)    NOT NULL,
        price_vnd        INT              NOT NULL,
        base_coins       INT              NOT NULL,
        is_active        BIT              NOT NULL DEFAULT 1,
        created_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME()
    );

    -- ---------------------------------------------------------------
    -- 5. novels
    -- ---------------------------------------------------------------
    CREATE TABLE novels (
        id              BIGINT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        author_id       UNIQUEIDENTIFIER NOT NULL,
        title           NVARCHAR(255)    NOT NULL,
        slug            NVARCHAR(300)    NOT NULL,
        description     NVARCHAR(MAX)    NULL,
        cover_image_url NVARCHAR(500)    NULL,
        status          NVARCHAR(20)     NOT NULL DEFAULT 'ONGOING'
                        CHECK (status IN ('ONGOING','COMPLETED','CANCELLED')),
        view_count      INT              NOT NULL DEFAULT 0,
        created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT uq_novels_slug UNIQUE (slug),
        CONSTRAINT fk_novels_author FOREIGN KEY (author_id) REFERENCES users(id)
    );
    CREATE INDEX idx_novels_author_id  ON novels(author_id);
    CREATE INDEX idx_novels_slug       ON novels(slug);
    CREATE INDEX idx_novels_status     ON novels(status);
    CREATE INDEX idx_novels_created_at ON novels(created_at);

    -- ---------------------------------------------------------------
    -- 6. novel_categories
    -- ---------------------------------------------------------------
    CREATE TABLE novel_categories (
        novel_id    BIGINT           NOT NULL,
        category_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT pk_novel_categories PRIMARY KEY (novel_id, category_id),
        CONSTRAINT fk_nc_novel    FOREIGN KEY (novel_id)    REFERENCES novels(id)     ON DELETE CASCADE,
        CONSTRAINT fk_nc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_novel_categories_category_id ON novel_categories(category_id);

    -- ---------------------------------------------------------------
    -- 7. chapters
    -- ---------------------------------------------------------------
    CREATE TABLE chapters (
        id             BIGINT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        novel_id       BIGINT           NOT NULL,
        chapter_number INT              NOT NULL,
        title          NVARCHAR(255)    NOT NULL,
        slug           NVARCHAR(300)    NOT NULL,
        content        NVARCHAR(MAX)    NULL,
        audio_url      NVARCHAR(1000)   NULL,
        status         NVARCHAR(10)     NOT NULL DEFAULT 'FREE'
                    CHECK (status IN ('FREE','LOCKED','UNLOCKED')),
        coin_price     INT              NOT NULL DEFAULT 0,
        view_count     INT              NOT NULL DEFAULT 0,
        created_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_chapters_novel FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
        CONSTRAINT uq_chapters_novel_number UNIQUE (novel_id, chapter_number)
    );
    CREATE INDEX idx_chapters_novel_id   ON chapters(novel_id);
    CREATE INDEX idx_chapters_slug       ON chapters(slug);
    CREATE INDEX idx_chapters_status     ON chapters(status);
    CREATE INDEX idx_chapters_created_at ON chapters(created_at);

    -- ---------------------------------------------------------------
    -- 8. chapter_unlocks
    -- ---------------------------------------------------------------
    CREATE TABLE chapter_unlocks (
        id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id     UNIQUEIDENTIFIER NOT NULL,
        chapter_id  BIGINT           NOT NULL,
        coins_spent INT              NOT NULL,
        unlocked_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_cu_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
        CONSTRAINT fk_cu_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
        CONSTRAINT uq_chapter_unlocks_user_chapter UNIQUE (user_id, chapter_id)
    );
    CREATE INDEX idx_chapter_unlocks_user_id    ON chapter_unlocks(user_id);
    CREATE INDEX idx_chapter_unlocks_chapter_id ON chapter_unlocks(chapter_id);

    -- ---------------------------------------------------------------
    -- 9. bookmarks
    -- ---------------------------------------------------------------
    CREATE TABLE bookmarks (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id         UNIQUEIDENTIFIER NOT NULL,
        novel_id        BIGINT           NOT NULL,
        last_chapter_id BIGINT           NULL,
        is_favorite     BIT              NOT NULL DEFAULT 0,
        reading_progress_percent INT      NOT NULL DEFAULT 0,
        created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_bm_user    FOREIGN KEY (user_id)         REFERENCES users(id)    ON DELETE CASCADE,
        CONSTRAINT fk_bm_novel   FOREIGN KEY (novel_id)        REFERENCES novels(id)   ON DELETE NO ACTION,
        CONSTRAINT fk_bm_chapter FOREIGN KEY (last_chapter_id) REFERENCES chapters(id),
        CONSTRAINT uq_bookmarks_user_novel UNIQUE (user_id, novel_id)
    );
    CREATE INDEX idx_bookmarks_user_id    ON bookmarks(user_id);
    CREATE INDEX idx_bookmarks_novel_id   ON bookmarks(novel_id);
    CREATE INDEX idx_bookmarks_updated_at ON bookmarks(updated_at);

    -- ---------------------------------------------------------------
    -- 10. payments
    -- ---------------------------------------------------------------
    CREATE TABLE payments (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id         UNIQUEIDENTIFIER NOT NULL,
        amount_vnd      INT              NOT NULL,
        coins_received  INT              NOT NULL,
        status          NVARCHAR(10)     NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED')),
        provider        NVARCHAR(20)     NOT NULL,
        transaction_ref NVARCHAR(100)    NULL,
        created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT uq_payments_transaction_ref UNIQUE (transaction_ref)
    );
    CREATE INDEX idx_payments_user_id    ON payments(user_id);
    CREATE INDEX idx_payments_status     ON payments(status);
    CREATE INDEX idx_payments_created_at ON payments(created_at);

    -- ---------------------------------------------------------------
    -- 11. coin_transactions
    -- ---------------------------------------------------------------
    CREATE TABLE coin_transactions (
        id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id       UNIQUEIDENTIFIER NOT NULL,
        type          NVARCHAR(30)     NOT NULL CHECK (type IN ('TOPUP','UNLOCKED_CHAPTER', 'AUTHOR_REVENUE')),
        amount        INT              NOT NULL,
        balance_after INT              NOT NULL,
        ref_id        UNIQUEIDENTIFIER NULL,
        note          NVARCHAR(255)    NULL,
        coin_package_id UNIQUEIDENTIFIER NULL,
        created_at    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_ct_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_ct_package FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id)
    );
    CREATE INDEX idx_coin_transactions_user_id    ON coin_transactions(user_id);
    CREATE INDEX idx_coin_transactions_type       ON coin_transactions(type);
    CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

    -- ---------------------------------------------------------------
    -- 12. orders
    -- ---------------------------------------------------------------
    CREATE TABLE orders (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id         UNIQUEIDENTIFIER NOT NULL,
        coin_package_id UNIQUEIDENTIFIER NOT NULL,
        quantity        INT              NOT NULL DEFAULT 1,
        amount_vnd      INT              NOT NULL,
        coins           INT              NOT NULL,
        status          NVARCHAR(20)     NOT NULL CHECK (status IN ('PENDING','COMPLETED','CANCELLED')),
        created_at      DATETIME2        NULL,
        updated_at      DATETIME2        NULL,
        CONSTRAINT fk_orders_user    FOREIGN KEY (user_id)         REFERENCES users(id),
        CONSTRAINT fk_orders_package FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id)
    );
    CREATE INDEX idx_orders_user_id    ON orders(user_id);
    CREATE INDEX idx_orders_status     ON orders(status);
    CREATE INDEX idx_orders_created_at ON orders(created_at);

    -- ---------------------------------------------------------------
    -- 13. revenues
    -- ---------------------------------------------------------------
    CREATE TABLE revenues (
        id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        novel_id             BIGINT           NOT NULL,
        author_id            UNIQUEIDENTIFIER NOT NULL,
        total_coins_earned   INT              NOT NULL DEFAULT 0,
        free_chapter_count   INT              NOT NULL DEFAULT 0,
        total_chapter_count  INT              NOT NULL DEFAULT 0,
        author_share_percent DECIMAL(5,2)     NOT NULL DEFAULT 70.00,
        author_coins         INT              NOT NULL DEFAULT 0,
        calculated_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_rev_novel  FOREIGN KEY (novel_id)  REFERENCES novels(id) ON DELETE CASCADE,
        CONSTRAINT fk_rev_author FOREIGN KEY (author_id) REFERENCES users(id),
        CONSTRAINT uq_revenues_novel_author UNIQUE (novel_id, author_id)
    );
    CREATE INDEX idx_revenues_author_id     ON revenues(author_id);
    CREATE INDEX idx_revenues_calculated_at ON revenues(calculated_at);

    -- =============================================================================
    -- Bổ sung cột payments
    -- =============================================================================

    ALTER TABLE payments ADD order_id UNIQUEIDENTIFIER NULL;
    ALTER TABLE payments ADD paid_at DATETIME2 NULL;
    ALTER TABLE payments ADD CONSTRAINT FK_payments_orders FOREIGN KEY (order_id) REFERENCES orders(id);

    -- =============================================================================
    -- Migration: isAuthor (xóa role AUTHOR, thêm cột is_author)
    -- =============================================================================

    -- Nếu DB đã tồn tại và cần migration (không chạy lại schema từ đầu):
    -- ALTER TABLE users ADD is_author BIT NOT NULL DEFAULT 0;
    -- UPDATE users SET role = 'USER', is_author = 1 WHERE role = 'AUTHOR';

-- Cập nhật tài khoản tác giả cũ (chạy trực tiếp trên DB hiện tại):
UPDATE users SET role = 'USER', is_author = 1 WHERE email = 'author@sba.com';

-- =============================================================================
-- Author Profiles & Payment Tickets
-- =============================================================================
IF OBJECT_ID('author_payment_tickets','U') IS NOT NULL DROP TABLE author_payment_tickets;
IF OBJECT_ID('author_profiles','U')       IS NOT NULL DROP TABLE author_profiles;

CREATE TABLE author_profiles (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    user_id             UNIQUEIDENTIFIER NOT NULL,
    pen_name            NVARCHAR(255)    NOT NULL,
    bio                 NVARCHAR(MAX)    NULL,
    author_coin_balance INT              NOT NULL DEFAULT 0,
    total_novels        BIGINT           NOT NULL DEFAULT 0,
    total_chapters      BIGINT           NOT NULL DEFAULT 0,
    total_views         BIGINT           NOT NULL DEFAULT 0,
    bank_name           NVARCHAR(100)    NULL,
    bank_account_number NVARCHAR(100)    NULL,
    bank_account_holder NVARCHAR(255)    NULL,
    status              NVARCHAR(20)     NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','SUSPENDED')),
    created_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_author_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_ap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE author_payment_tickets (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    author_profile_id UNIQUEIDENTIFIER NOT NULL,
    month_year        NVARCHAR(20)     NOT NULL,
    total_coins       INT              NOT NULL,
    coin_rate         INT              NOT NULL DEFAULT 1000,
    amount_vnd        INT              NOT NULL,
    status            NVARCHAR(20)     NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID','CANCELLED')),
    paid_at           DATETIME2        NULL,
    transaction_ref   NVARCHAR(100)    NULL,
    created_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_apt_author FOREIGN KEY (author_profile_id) REFERENCES author_profiles(id) ON DELETE CASCADE
);

