-- Additive migration; keep JPA_DDL_AUTO=validate. Run after backing up the database.
IF OBJECT_ID(N'dbo.sepay_test_receipts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sepay_test_receipts (
        transaction_id varchar(100) NOT NULL PRIMARY KEY,
        order_id uniqueidentifier NOT NULL,
        received_at datetimeoffset(6) NOT NULL
    );
END;
