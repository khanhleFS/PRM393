-- DB_NAME is validated by the deployment script. Never reset an existing database.
IF DB_ID(N'$(DB_NAME)') IS NULL
    EXEC(N'CREATE DATABASE [$(DB_NAME)]');
