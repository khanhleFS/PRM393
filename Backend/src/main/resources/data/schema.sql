-- =========================================================================
-- MSSQL Create Tables Script for SBA301 Project
-- Novel Reading Platform with User Management, Payments, and Coin System
-- =========================================================================

-- -------------------------------------------------------------------------
-- DROP EXISTING TABLES (if they exist)
-- =========================================================================
IF OBJECT_ID('revenues', 'U') IS NOT NULL DROP TABLE revenues;
IF OBJECT_ID('coin_transactions', 'U') IS NOT NULL DROP TABLE coin_transactions;
IF OBJECT_ID('payments', 'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('chapter_unlocks', 'U') IS NOT NULL DROP TABLE chapter_unlocks;
IF OBJECT_ID('bookmarks', 'U') IS NOT NULL DROP TABLE bookmarks;
IF OBJECT_ID('chapters', 'U') IS NOT NULL DROP TABLE chapters;
IF OBJECT_ID('novel_categories', 'U') IS NOT NULL DROP TABLE novel_categories;
IF OBJECT_ID('novels', 'U') IS NOT NULL DROP TABLE novels;
IF OBJECT_ID('otps', 'U') IS NOT NULL DROP TABLE otps;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;

-- -------------------------------------------------------------------------
-- 1. Users Table
-- =========================================================================
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role NVARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    username NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    is_author BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT idx_users_email UNIQUE (email),
    CONSTRAINT idx_users_username UNIQUE (username)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- -------------------------------------------------------------------------
-- 2. OTPs Table
-- =========================================================================
CREATE TABLE otps (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL,
    otp_code NVARCHAR(10) NOT NULL,
    is_used BIT NOT NULL DEFAULT 0,
    expiry_time DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT idx_otps_email_code UNIQUE (email, otp_code)
);

CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expiry_time ON otps(expiry_time);

-- -------------------------------------------------------------------------
-- 3. Categories Table
-- =========================================================================
CREATE TABLE categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL UNIQUE,
    slug NVARCHAR(300) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- -------------------------------------------------------------------------
-- 4. Novels Table
-- =========================================================================
CREATE TABLE novels (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    author_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(300) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    cover_image_url NVARCHAR(500),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('ONGOING', 'COMPLETED', 'CANCELLED')),
    view_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE NO ACTION
);

CREATE INDEX idx_novels_author_id ON novels(author_id);
CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_created_at ON novels(created_at);

-- -------------------------------------------------------------------------
-- 5. Novel_Categories Association Table
-- =========================================================================
CREATE TABLE novel_categories (
    novel_id UNIQUEIDENTIFIER NOT NULL,
    category_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (novel_id, category_id),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_novel_categories_category_id ON novel_categories(category_id);

-- -------------------------------------------------------------------------
-- 6. Chapters Table
-- =========================================================================
CREATE TABLE chapters (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    novel_id UNIQUEIDENTIFIER NOT NULL,
    chapter_number INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(300) NOT NULL,
    content NVARCHAR(MAX),
    audio_url NVARCHAR(1000),
    status NVARCHAR(20) NOT NULL DEFAULT 'FREE' CHECK (status IN ('LOCKED','UNLOCKED','FREE')),
    coin_price INT NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
    view_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    CONSTRAINT idx_chapters_novel_number UNIQUE (novel_id, chapter_number)
);

CREATE INDEX idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX idx_chapters_slug ON chapters(slug);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_created_at ON chapters(created_at);

-- -------------------------------------------------------------------------
-- 7. Chapter_Unlocks Table (User has unlocked paid chapter)
-- =========================================================================
CREATE TABLE chapter_unlocks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    chapter_id UNIQUEIDENTIFIER NOT NULL,
    coins_spent INT NOT NULL CHECK (coins_spent >= 0),
    unlocked_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    CONSTRAINT idx_chapter_unlocks_user_chapter UNIQUE (user_id, chapter_id)
);

CREATE INDEX idx_chapter_unlocks_user_id ON chapter_unlocks(user_id);
CREATE INDEX idx_chapter_unlocks_chapter_id ON chapter_unlocks(chapter_id);
CREATE INDEX idx_chapter_unlocks_unlocked_at ON chapter_unlocks(unlocked_at);

-- -------------------------------------------------------------------------
-- 8. Bookmarks Table (Favorites and reading progress)
-- =========================================================================
CREATE TABLE bookmarks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    novel_id UNIQUEIDENTIFIER NOT NULL,
    last_chapter_id UNIQUEIDENTIFIER,
    is_favorite BIT NOT NULL DEFAULT 0,
    reading_progress_percent INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (last_chapter_id) REFERENCES chapters(id) ON DELETE NO ACTION,
    CONSTRAINT idx_bookmarks_user_novel UNIQUE (user_id, novel_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_novel_id ON bookmarks(novel_id);
CREATE INDEX idx_bookmarks_is_favorite ON bookmarks(is_favorite);
CREATE INDEX idx_bookmarks_updated_at ON bookmarks(updated_at);

-- -------------------------------------------------------------------------
-- 9. Payments Table (VNPay or other payment gateway)
-- =========================================================================
CREATE TABLE payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    amount_vnd INT NOT NULL CHECK (amount_vnd > 0),
    coins_received INT NOT NULL CHECK (coins_received > 0),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    provider NVARCHAR(100) NOT NULL,
    transaction_ref NVARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    CONSTRAINT idx_payments_transaction_ref UNIQUE (transaction_ref)
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- -------------------------------------------------------------------------
-- 10. Coin_Transactions Table (Audit log of coin movements)
-- =========================================================================
CREATE TABLE coin_transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('TOPUP', 'UNLOCKED_CHAPTER', 'UNLOCKED_CHAPTER')),
    amount INT NOT NULL,
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    ref_id UNIQUEIDENTIFIER,
    note NVARCHAR(500),
    coin_package_id UNIQUEIDENTIFIER,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id) ON DELETE NO ACTION
);

CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

-- -------------------------------------------------------------------------
-- 11. Revenues Table (Earnings per novel)
-- =========================================================================
CREATE TABLE revenues (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    novel_id UNIQUEIDENTIFIER NOT NULL,
    author_id UNIQUEIDENTIFIER NOT NULL,
    total_coins_earned INT NOT NULL DEFAULT 0 CHECK (total_coins_earned >= 0),
    free_chapter_count INT NOT NULL DEFAULT 0,
    total_chapter_count INT NOT NULL DEFAULT 0,
    author_share_percent DECIMAL(5, 2) NOT NULL DEFAULT 70.00 CHECK (author_share_percent BETWEEN 0 AND 100),
    author_coins INT NOT NULL DEFAULT 0 CHECK (author_coins >= 0),
    calculated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE NO ACTION,
    CONSTRAINT idx_revenues_novel_author UNIQUE (novel_id, author_id)
);

CREATE INDEX idx_revenues_author_id ON revenues(author_id);
CREATE INDEX idx_revenues_calculated_at ON revenues(calculated_at);

-- =========================================================================
-- Summary of Tables Created
-- =========================================================================
-- 1. users                    - User accounts with roles (ADMIN, USER)
-- 2. otps                     - One-time passwords for 2FA/verification
-- 3. categories               - Book categories/genres
-- 4. novels                   - Novel entries with author, status, view count
-- 5. novel_categories         - Many-to-many association
-- 6. chapters                 - Individual chapters (free or paid)
-- 7. chapter_unlocks          - Track which user unlocked which paid chapter
-- 8. bookmarks                - User favorites and reading progress
-- 9. payments                 - Payment records (coins purchased)
-- 10. coin_transactions       - Transaction log/audit trail for coins
-- 11. revenues                - Revenue calculations per novel per author
-- =========================================================================