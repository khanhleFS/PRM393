-- Optional: run manually against your DEMO database after schema initialization.
-- Inserts only missing package names; never deletes users, orders, payments or balances.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF NOT EXISTS (SELECT 1 FROM dbo.coin_packages WHERE name = N'Gói khởi đầu')
    INSERT INTO dbo.coin_packages (id, name, price_vnd, base_coins, is_active, created_at, updated_at)
    VALUES (NEWID(), N'Gói khởi đầu', 10000, 100, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.coin_packages WHERE name = N'Gói đọc truyện')
    INSERT INTO dbo.coin_packages (id, name, price_vnd, base_coins, is_active, created_at, updated_at)
    VALUES (NEWID(), N'Gói đọc truyện', 50000, 500, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

COMMIT TRANSACTION;
