-- =========================================================================
-- H2 Database Create Tables Script for SBA301 Project
-- Novel Reading Platform with User Management, Payments, and Coin System
-- =========================================================================

-- -------------------------------------------------------------------------
-- DROP EXISTING TABLES (if they exist)
-- =========================================================================
DROP TABLE IF EXISTS revenues;
DROP TABLE IF EXISTS coin_transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS chapter_unlocks;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS novel_categories;
DROP TABLE IF EXISTS novels;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- -------------------------------------------------------------------------
-- 1. Users Table
-- =========================================================================
CREATE TABLE users (
                       id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                        role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
                       username VARCHAR(255) NOT NULL UNIQUE,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       phone VARCHAR(20),
                       address VARCHAR(500),
                       is_active BOOLEAN NOT NULL DEFAULT TRUE,
                       coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
                       is_author BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- -------------------------------------------------------------------------
-- 2. OTPs Table
-- =========================================================================
CREATE TABLE otps (
                      id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                      user_id UUID NOT NULL,
                      otp_code VARCHAR(10) NOT NULL,
                      is_used BOOLEAN NOT NULL DEFAULT FALSE,
                      expires_at TIMESTAMP NOT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                      CONSTRAINT idx_otps_user_code UNIQUE (user_id, otp_code)
);

CREATE INDEX idx_otps_user_id ON otps(user_id);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);

-- -------------------------------------------------------------------------
-- 3. Categories Table
-- =========================================================================
CREATE TABLE categories (
                            id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                            name VARCHAR(255) NOT NULL UNIQUE,
                            slug VARCHAR(300) NOT NULL UNIQUE,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- -------------------------------------------------------------------------
-- 4. Novels Table
-- =========================================================================
CREATE TABLE novels (
                        id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                        author_id UUID NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        slug VARCHAR(300) NOT NULL UNIQUE,
                        description CLOB,
                        cover_image_url VARCHAR(500),
                        status VARCHAR(20) NOT NULL CHECK (status IN ('ongoing', 'completed', 'hiatus')),
                        view_count INT NOT NULL DEFAULT 0,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_novels_author_id ON novels(author_id);
CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_created_at ON novels(created_at);

-- -------------------------------------------------------------------------
-- 5. Novel_Categories Association Table
-- =========================================================================
CREATE TABLE novel_categories (
                                  novel_id UUID NOT NULL,
                                  category_id UUID NOT NULL,
                                  PRIMARY KEY (novel_id, category_id),
                                  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
                                  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_novel_categories_category_id ON novel_categories(category_id);

-- -------------------------------------------------------------------------
-- 6. Chapters Table
-- =========================================================================
CREATE TABLE chapters (
                          id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                          novel_id UUID NOT NULL,
                          chapter_number INT NOT NULL,
                          title VARCHAR(255) NOT NULL,
                          slug VARCHAR(300) NOT NULL,
                          content CLOB,
                          audio_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'FREE' CHECK (status IN ('LOCKED', 'UNLOCKED', 'FREE')),
    coin_price INT NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
                          view_count INT NOT NULL DEFAULT 0,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
                                 id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                                 user_id UUID NOT NULL,
                                 chapter_id UUID NOT NULL,
                                 coins_spent INT NOT NULL CHECK (coins_spent >= 0),
                                 unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
                           id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                           user_id UUID NOT NULL,
                           novel_id UUID NOT NULL,
                           last_chapter_id UUID,
                           is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
                           reading_progress_percent INT DEFAULT 0,
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                           FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
                           FOREIGN KEY (last_chapter_id) REFERENCES chapters(id),
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
                          id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                          user_id UUID NOT NULL,
                          amount_vnd INT NOT NULL CHECK (amount_vnd > 0),
                          coins_received INT NOT NULL CHECK (coins_received > 0),
                          status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
                          provider VARCHAR(100) NOT NULL,
                          transaction_ref VARCHAR(255) UNIQUE,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- -------------------------------------------------------------------------
-- 10. Coin_Transactions Table (Audit log of coin movements)
-- =========================================================================
CREATE TABLE coin_transactions (
                                   id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                                   user_id UUID NOT NULL,
                                   type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'spend', 'refund', 'bonus', 'adjustment')),
                                   amount INT NOT NULL,
                                   balance_after INT NOT NULL CHECK (balance_after >= 0),
                                   ref_id UUID,
                                   note VARCHAR(500),
                                   coin_package_id UUID,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   FOREIGN KEY (user_id) REFERENCES users(id),
                                   FOREIGN KEY (coin_package_id) REFERENCES coin_packages(id)
);

CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

-- -------------------------------------------------------------------------
-- 11. Revenues Table (Earnings per novel)
-- =========================================================================
CREATE TABLE revenues (
                          id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
                          novel_id UUID NOT NULL,
                          author_id UUID NOT NULL,
                          total_coins_earned INT NOT NULL DEFAULT 0 CHECK (total_coins_earned >= 0),
                          free_chapter_count INT NOT NULL DEFAULT 0,
                          total_chapter_count INT NOT NULL DEFAULT 0,
                          author_share_percent DECIMAL(5, 2) NOT NULL DEFAULT 70.00 CHECK (author_share_percent BETWEEN 0 AND 100),
                          author_coins INT NOT NULL DEFAULT 0 CHECK (author_coins >= 0),
                          calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
                          FOREIGN KEY (author_id) REFERENCES users(id),
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