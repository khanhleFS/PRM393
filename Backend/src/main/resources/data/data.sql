-- =========================================================================
-- MSSQL Seed Data Script for SBA301 Project
-- Based on the current Spring Boot entities.
-- ChapterStatus enum exists in code but is not mapped to chapters table yet;
-- chapter access is represented by is_free + coin_price.
-- Password values are BCrypt hashes of 'Password123'.
-- =========================================================================

-- Clear existing data if necessary (uncomment to reset)
/*
DELETE FROM revenues;
DELETE FROM chapter_unlocks;
DELETE FROM bookmarks;
DELETE FROM coin_transactions;
DELETE FROM payments;
DELETE FROM chapters;
DELETE FROM novel_categories;
DELETE FROM novels;
DELETE FROM categories;
DELETE FROM otps;
DELETE FROM users;
*/

-- -------------------------------------------------------------------------
-- 1. Declare fixed IDs used across seed data
-- -------------------------------------------------------------------------
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
DECLARE @AuthorId UNIQUEIDENTIFIER = NEWID();
DECLARE @UserId UNIQUEIDENTIFIER = NEWID();

DECLARE @CatActionId UNIQUEIDENTIFIER = NEWID();
DECLARE @CatRomanceId UNIQUEIDENTIFIER = NEWID();
DECLARE @CatFantasyId UNIQUEIDENTIFIER = NEWID();
DECLARE @CatSciFiId UNIQUEIDENTIFIER = NEWID();
DECLARE @CatMysteryId UNIQUEIDENTIFIER = NEWID();
DECLARE @CatAdventureId UNIQUEIDENTIFIER = NEWID();

DECLARE @PaymentId UNIQUEIDENTIFIER = NEWID();
DECLARE @FirstPaidChapterId UNIQUEIDENTIFIER = NULL;
DECLARE @BookmarkChapterId UNIQUEIDENTIFIER = NULL;

-- -------------------------------------------------------------------------
-- 2. Insert Users (roles follow UserRole enum: ADMIN, AUTHOR, USER)
-- -------------------------------------------------------------------------
INSERT INTO users (id, role, username, email, password, phone, address, is_active, coin_balance, is_author, created_at, updated_at)
VALUES
(@AdminId, 'ADMIN', N'System Administrator', 'admin@sba.com', '$2a$12$Uwo2BFDsFLkNsdRON/ZvWe4ZNGrRFW113PStx/cKKOV3z0Xs7rgtu', '0901234567', N'123 Admin Street, Hanoi', 1, 0, 0, GETDATE(), GETDATE()),
(@AuthorId, 'USER', N'Nguyen Nhat Anh', 'author@sba.com', '$2a$12$Uwo2BFDsFLkNsdRON/ZvWe4ZNGrRFW113PStx/cKKOV3z0Xs7rgtu', '0912345678', N'456 Author Boulevard, HCM City', 1, 1500, 1, GETDATE(), GETDATE()),
(@UserId, 'USER', N'Tran Binh Minh', 'user@sba.com', '$2a$12$Uwo2BFDsFLkNsdRON/ZvWe4ZNGrRFW113PStx/cKKOV3z0Xs7rgtu', '0987654321', N'789 Reader Lane, Da Nang', 1, 350, 0, GETDATE(), GETDATE());

-- -------------------------------------------------------------------------
-- 3. Insert Categories
-- -------------------------------------------------------------------------
INSERT INTO categories (id, name, slug)
VALUES
(@CatActionId, N'Action', 'action'),
(@CatRomanceId, N'Romance', 'romance'),
(@CatFantasyId, N'Fantasy', 'fantasy'),
(@CatSciFiId, N'Science Fiction', 'science-fiction'),
(@CatMysteryId, N'Mystery', 'mystery'),
(@CatAdventureId, N'Adventure', 'adventure');

-- -------------------------------------------------------------------------
-- 4. Insert 20 Novels with all fields used by Novel entity
-- -------------------------------------------------------------------------
DECLARE @NovelSeeds TABLE (
    row_num INT NOT NULL PRIMARY KEY,
    novel_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(300) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    cover_image_url NVARCHAR(500) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    theme NVARCHAR(120) NOT NULL,
    protagonist NVARCHAR(120) NOT NULL,
    story_setting NVARCHAR(220) NOT NULL,
    main_conflict NVARCHAR(260) NOT NULL,
    story_tone NVARCHAR(160) NOT NULL,
    category_one UNIQUEIDENTIFIER NOT NULL,
    category_two UNIQUEIDENTIFIER NOT NULL
);

INSERT INTO @NovelSeeds (row_num, novel_id, title, slug, description, cover_image_url, status, theme, protagonist, story_setting, main_conflict, story_tone, category_one, category_two)
VALUES
(1, NEWID(), N'Shadow Academy', 'shadow-academy', N'A gifted student enters an academy where every exam reveals an old secret and every friendship carries a hidden cost.', 'https://picsum.photos/seed/shadow-academy/400/600', 'ongoing', N'magic school and secret trials', N'Elian Voss', N'a moonlit academy built above sealed catacombs and watched by living portraits', N'each exam exposes a forbidden ritual connected to Elian''s missing family, while classmates may be allies or spies', N'fantasy mystery with tense school rivalries and secret magic', @CatFantasyId, @CatMysteryId),
(2, NEWID(), N'Starlight Courier', 'starlight-courier', N'A young courier crosses dangerous star lanes to deliver a message that can stop an interplanetary war.', 'https://picsum.photos/seed/starlight-courier/400/600', 'ongoing', N'space travel and political danger', N'Mira Vale', N'freighter docks, asteroid routes, and neutral stations between rival planets', N'a sealed diplomatic message can prevent war, but pirates, soldiers, and corrupt officials all want it first', N'science fiction adventure with urgency, navigation risk, and political stakes', @CatSciFiId, @CatAdventureId),
(3, NEWID(), N'Crimson Blade', 'crimson-blade', N'An exiled swordsman searches for the truth behind a fallen kingdom while hunters close in from every border.', 'https://picsum.photos/seed/crimson-blade/400/600', 'completed', N'sword fights and royal revenge', N'Kael Ardent', N'border forts, ruined royal roads, and mountain passes stained by old battles', N'Kael must prove who betrayed the crown before assassins erase every witness from the fallen kingdom', N'action adventure with sword duels, pursuit, and revenge', @CatActionId, @CatAdventureId),
(4, NEWID(), N'Moonlit Contract', 'moonlit-contract', N'A reluctant heir signs a magical contract with a rival family and discovers loyalty is harder than betrayal.', 'https://picsum.photos/seed/moonlit-contract/400/600', 'ongoing', N'romance and supernatural bargains', N'Selene Marrow', N'a divided city where noble houses seal promises under moon magic', N'Selene is bound to a rival heir by a contract that rewards honesty and punishes betrayal with visible scars', N'romantic fantasy with emotional tension, family duty, and magical consequences', @CatRomanceId, @CatFantasyId),
(5, NEWID(), N'Clockwork City', 'clockwork-city', N'In a city powered by living machines, an apprentice mechanic finds a map to the engine beneath the world.', 'https://picsum.photos/seed/clockwork-city/400/600', 'ongoing', N'mechanical wonders and urban mystery', N'Ivo Renn', N'a brass-and-glass city where streets shift when the central engine dreams', N'Ivo discovers that the living machines are failing because someone is stealing time from the city core', N'science fiction mystery with mechanical wonder and hidden sabotage', @CatSciFiId, @CatMysteryId),
(6, NEWID(), N'River of Ashes', 'river-of-ashes', N'A healer follows a poisoned river upstream and uncovers the army that turned villages into silence.', 'https://picsum.photos/seed/river-of-ashes/400/600', 'completed', N'healing, war, and wilderness survival', N'Liora Sen', N'burned riverbanks, abandoned ferries, and forest villages coated in gray dust', N'Liora must trace the poison before an occupying army uses it to empty the valley forever', N'adventure action with survival, battlefield danger, and moral courage', @CatAdventureId, @CatActionId),
(7, NEWID(), N'Lanterns After Rain', 'lanterns-after-rain', N'Two neighbors rebuild a flooded town and slowly learn that old letters can change the shape of tomorrow.', 'https://picsum.photos/seed/lanterns-after-rain/400/600', 'ongoing', N'gentle romance and community drama', N'Mai Harper', N'a riverside town of repaired bridges, rain lanterns, and half-drowned family shops', N'Mai and Theo uncover old letters that reveal why their families stopped speaking after the last great flood', N'romance mystery with quiet emotion, community healing, and buried history', @CatRomanceId, @CatMysteryId),
(8, NEWID(), N'The Ninth Gate', 'the-ninth-gate', N'A historian opens the wrong gate in an ancient temple and wakes a guardian who remembers the first war.', 'https://picsum.photos/seed/the-ninth-gate/400/600', 'ongoing', N'ancient ruins and mythic guardians', N'Dr. Ansel Rook', N'desert temples, buried libraries, and nine stone gates aligned with forgotten stars', N'Ansel awakens a guardian whose memory of the first war may either save the world or restart it', N'fantasy adventure with ancient magic, exploration, and mythic danger', @CatFantasyId, @CatAdventureId),
(9, NEWID(), N'Neon Detective', 'neon-detective', N'A private detective in a rain-soaked megacity investigates a missing android with memories that should not exist.', 'https://picsum.photos/seed/neon-detective/400/600', 'ongoing', N'cyberpunk investigation and identity', N'Juno Park', N'neon alleys, data markets, and corporate towers above a rain-soaked megacity', N'Juno must find a missing android whose illegal memories implicate the corporation that owns the police', N'science fiction mystery with noir atmosphere, surveillance, and identity questions', @CatSciFiId, @CatMysteryId),
(10, NEWID(), N'Empire of Glass', 'empire-of-glass', N'A palace translator hears a prophecy in a forbidden language and becomes the target of nobles on every side.', 'https://picsum.photos/seed/empire-of-glass/400/600', 'completed', N'court intrigue and fragile alliances', N'Amara Lune', N'a mirrored palace where every whispered word can be reflected back as evidence', N'Amara translates a forbidden prophecy and becomes valuable to every noble faction planning the empire''s next betrayal', N'fantasy romance with palace intrigue, delicate alliances, and dangerous language', @CatFantasyId, @CatRomanceId),
(11, NEWID(), N'Hollow Crown', 'hollow-crown', N'A prince who faked his own death returns as a nameless soldier and must reclaim a throne held by someone who wears his face.', 'https://picsum.photos/seed/hollow-crown/400/600', 'ongoing', N'identity, usurpation, and royal war', N'Prince Dorian Vael', N'a capital city under heavy occupation where every checkpoint demands a name and bloodline papers', N'Dorian must expose the imposter king without revealing himself before the false coronation becomes permanent law', N'action fantasy with political conspiracy, disguise, and sword-driven urgency', @CatActionId, @CatFantasyId),
(12, NEWID(), N'Signal Bloom', 'signal-bloom', N'An agronomist on a dying colony planet discovers that the soil is transmitting an encoded signal from deep underground.', 'https://picsum.photos/seed/signal-bloom/400/600', 'ongoing', N'first contact and ecological collapse', N'Dr. Seren Ota', N'a dust-red colony of failing farms, pressurized greenhouses, and deep-drill stations at the edge of a canyon', N'Seren must decode the signal before the colonial authority shuts down the project and buries the discovery', N'science fiction mystery with ecological tension, isolation, and alien curiosity', @CatSciFiId, @CatMysteryId),
(13, NEWID(), N'Veil of Salt', 'veil-of-salt', N'A bride-to-be discovers that the coastal town she is marrying into holds a ritual that erases one memory from every newcomer.', 'https://picsum.photos/seed/veil-of-salt/400/600', 'ongoing', N'hidden tradition, romance, and memory', N'Isla Maren', N'a fog-wrapped fishing town of salt-stained docks, locked attics, and wedding lanterns that burn all night', N'Isla suspects the missing memory is the one that would let her leave, and the ritual is scheduled for her wedding eve', N'romance mystery with atmospheric dread, tender love, and small-town secrets', @CatRomanceId, @CatMysteryId),
(14, NEWID(), N'Iron Nomad', 'iron-nomad', N'A wandering mechanic crosses a post-war wasteland repairing machines and slowly pieces together who started the war.', 'https://picsum.photos/seed/iron-nomad/400/600', 'completed', N'survival, truth, and wasteland justice', N'Rafe Durn', N'cracked highways, salvage markets, and fortified water depots between dead cities', N'every machine Rafe repairs carries a serial number that traces back to one weapons factory and one general''s order', N'action adventure with gritty survival, moral reckoning, and road-film momentum', @CatActionId, @CatAdventureId),
(15, NEWID(), N'Glass Garden', 'glass-garden', N'A gardener inside an enchanted greenhouse tends plants that bloom once per century and discovers one is about to flower for the last time.', 'https://picsum.photos/seed/glass-garden/400/600', 'ongoing', N'magic, loss, and botanical wonder', N'Yuen Calloway', N'a sealed glass greenhouse spanning several floors, lit by artificial suns and patrolled by living vines', N'the final bloom will either heal a curse that has silenced the outside world or dissolve the greenhouse forever', N'fantasy adventure with quiet wonder, urgency, and bittersweet emotion', @CatFantasyId, @CatAdventureId),
(16, NEWID(), N'Parallel Desk', 'parallel-desk', N'An office worker receives messages from herself in a parallel timeline where she made every different choice.', 'https://picsum.photos/seed/parallel-desk/400/600', 'ongoing', N'parallel lives, regret, and self-discovery', N'Nora Yuen', N'a modern city office tower, a shared apartment, and the coffee shop where both versions of Nora meet every Thursday', N'the two Noras must cooperate to prevent an event that will collapse both timelines, but their goals are opposite', N'science fiction romance with introspective tension, clever plotting, and emotional honesty', @CatSciFiId, @CatRomanceId),
(17, NEWID(), N'Dust Oracle', 'dust-oracle', N'A desert trader stumbles upon an oracle buried under three centuries of sand who speaks only in riddles about the next catastrophe.', 'https://picsum.photos/seed/dust-oracle/400/600', 'completed', N'prophecy, desert survival, and hidden wisdom', N'Tariq Osei', N'endless dune roads, oasis trading posts, and a buried temple complex carved into living rock', N'Tariq must interpret the oracle''s riddles before a sandstorm cult uses the prophecy to trigger a mass migration war', N'adventure mystery with desert atmosphere, ancient knowledge, and mounting dread', @CatAdventureId, @CatMysteryId),
(18, NEWID(), N'The Cartographer''s Lie', 'the-cartographers-lie', N'A royal cartographer learns that every map she has ever drawn contains a hidden error that leads travelers toward a forbidden zone.', 'https://picsum.photos/seed/the-cartographers-lie/400/600', 'ongoing', N'hidden manipulation and cartographic mystery', N'Petra Volm', N'a stone archive city where every wall is a map and every guild controls a territory with ink and compass', N'Petra discovers she is not making the errors consciously, and the forbidden zone contains the proof of why', N'fantasy mystery with quiet paranoia, intellectual puzzles, and cartographic wonder', @CatFantasyId, @CatMysteryId),
(19, NEWID(), N'Second Skin', 'second-skin', N'An undercover agent falls in love with the target of her investigation and must decide which identity is the real one.', 'https://picsum.photos/seed/second-skin/400/600', 'ongoing', N'undercover romance and moral loyalty', N'Agent Calla Neve', N'a harbor city of imported fashions, underground auction houses, and rooftop cafes with long sight lines', N'Calla''s cover identity has grown closer to the target than her real self, and the mission deadline is now two days away', N'action romance with tension, identity crisis, and emotional cost', @CatActionId, @CatRomanceId),
(20, NEWID(), N'Fog Parliament', 'fog-parliament', N'A junior delegate arrives at a fog-shrouded parliament where votes disappear overnight and the majority is always whoever woke up last.', 'https://picsum.photos/seed/fog-parliament/400/600', 'ongoing', N'political manipulation and supernatural fog', N'Delegate Oswin Frey', N'a parliament building perpetually wrapped in coastal fog, with ink-stained corridors and offices that rearrange nightly', N'Oswin must pass a land-rights bill before the fog erases the vote record again, and someone is feeding the fog deliberately', N'fantasy mystery with sharp political satire, supernatural logic, and dry wit', @CatFantasyId, @CatMysteryId);

INSERT INTO novels (id, author_id, title, slug, description, cover_image_url, status, view_count, created_at, updated_at)
SELECT
    novel_id,
    @AuthorId,
    title,
    slug,
    description,
    cover_image_url,
    status,
    250 + (row_num * 137),
    DATEADD(DAY, -1 * (row_num * 7), GETDATE()),
    GETDATE()
FROM @NovelSeeds;

-- -------------------------------------------------------------------------
-- 5. Insert Novel - Category Associations
-- -------------------------------------------------------------------------
INSERT INTO novel_categories (novel_id, category_id)
SELECT novel_id, category_one FROM @NovelSeeds
UNION ALL
SELECT novel_id, category_two FROM @NovelSeeds;

-- -------------------------------------------------------------------------
-- 6. Insert 20 Chapters for each Novel
-- First 5 chapters are free: is_free = 1 and coin_price = 0.
-- Remaining chapters are paid: is_free = 0 and coin_price > 0.
-- -------------------------------------------------------------------------
DECLARE @CurrentNovelRow INT = 1;
DECLARE @CurrentNovelId UNIQUEIDENTIFIER;
DECLARE @CurrentNovelTitle NVARCHAR(255);
DECLARE @CurrentNovelSlug NVARCHAR(300);
DECLARE @CurrentNovelDescription NVARCHAR(MAX);
DECLARE @CurrentNovelTheme NVARCHAR(120);
DECLARE @CurrentProtagonist NVARCHAR(120);
DECLARE @CurrentSetting NVARCHAR(220);
DECLARE @CurrentConflict NVARCHAR(260);
DECLARE @CurrentTone NVARCHAR(160);
DECLARE @ChapterNo INT;
DECLARE @ChapterId UNIQUEIDENTIFIER;
DECLARE @Status NVARCHAR(20);
DECLARE @CoinPrice INT;
DECLARE @ChapterTitle NVARCHAR(255);
DECLARE @ChapterSlug NVARCHAR(300);
DECLARE @ChapterContent NVARCHAR(MAX);
DECLARE @BeatTitle NVARCHAR(120);
DECLARE @BeatContent NVARCHAR(MAX);
DECLARE @CreatedAt DATETIME;

DECLARE @ChapterBeats TABLE (
    chapter_number INT NOT NULL PRIMARY KEY,
    beat_title NVARCHAR(120) NOT NULL,
    beat_content NVARCHAR(MAX) NOT NULL
);

INSERT INTO @ChapterBeats (chapter_number, beat_title, beat_content)
VALUES
(1, N'First Signal', N'The opening scene introduces the ordinary rhythm of the world, then breaks it with a signal that only the protagonist understands. The chapter focuses on atmosphere, the first hint of danger, and the personal reason the protagonist cannot walk away.'),
(2, N'Unwanted Invitation', N'A powerful figure offers help with conditions attached. The protagonist accepts because the mystery has already touched home, but the decision creates tension with someone who believes the offer is a trap.'),
(3, N'Rules of the Road', N'The protagonist learns the rules that govern this world: who has power, what is forbidden, and what price people pay for disobedience. A small test proves that the threat is real.'),
(4, N'First Ally', N'An unlikely ally appears with useful knowledge and a private motive. Their first conversation is guarded, but they share enough truth to move forward together.'),
(5, N'The Hidden Mark', N'The first free arc closes with the discovery of a mark, code, scar, map fragment, or letter that connects the protagonist directly to the central conflict. The chapter ends with a clear reason to continue.'),
(6, N'Paid Threshold', N'The story crosses into more dangerous territory. The protagonist pays a practical or emotional cost to pass a guarded threshold, making this the first chapter that feels like a deeper commitment.'),
(7, N'False Safety', N'A place that seems safe reveals surveillance, betrayal, or a hidden rule. The protagonist realizes that protection can become another kind of prison.'),
(8, N'Enemy in Motion', N'The antagonist or opposing force acts directly for the first time. The chapter raises urgency with a chase, interrogation, sabotage, or formal challenge.'),
(9, N'Broken Trust', N'A trusted clue proves incomplete. The protagonist suspects the ally, the institution, or their own memory, and must choose between caution and action.'),
(10, N'Midnight Discovery', N'At the midpoint, the protagonist uncovers proof that the conflict is larger than expected. The discovery changes the goal from survival to stopping a wider disaster.'),
(11, N'Cost of Truth', N'The new truth hurts someone innocent or exposes an old lie. The protagonist gains information but loses comfort, reputation, or a safe route home.'),
(12, N'Countermove', N'The protagonist forms a plan using everything learned so far. The plan almost works, but the enemy has predicted one important step.'),
(13, N'Dark Bargain', N'A bargain is offered: safety in exchange for silence, power in exchange for loyalty, or love in exchange for surrender. The protagonist refuses or accepts with a secret condition.'),
(14, N'Wound and Witness', N'A battle, accident, or emotional rupture leaves the group shaken. A witness provides the missing detail that reframes the earliest chapters.'),
(15, N'The Door Beneath', N'The path leads below the surface: underground, behind the palace, inside the engine, beyond the gate, or into a private archive. The setting reveals the physical heart of the mystery.'),
(16, N'Names of the Guilty', N'The protagonist identifies the people responsible, but the evidence is dangerous to carry. Allies argue over whether justice is worth the likely cost.'),
(17, N'Last Quiet Hour', N'Before the final push, characters speak honestly. Romance, friendship, grief, or loyalty becomes explicit, giving the coming conflict emotional weight.'),
(18, N'Open Conflict', N'The hidden struggle becomes public. The protagonist confronts guards, rivals, machines, nobles, soldiers, spirits, or corporate agents in a scene built around action and consequence.'),
(19, N'The Choice', N'The protagonist reaches the decisive moral choice: revenge or mercy, secrecy or truth, escape or responsibility. The choice defines what kind of ending is possible.'),
(20, N'After the Storm', N'The season arc resolves the central threat while leaving a future thread open. Characters count the cost, claim a small victory, and face the next horizon.');

WHILE @CurrentNovelRow <= 20
BEGIN
    SELECT
        @CurrentNovelId = novel_id,
        @CurrentNovelTitle = title,
        @CurrentNovelSlug = slug,
        @CurrentNovelDescription = description,
        @CurrentNovelTheme = theme,
        @CurrentProtagonist = protagonist,
        @CurrentSetting = story_setting,
        @CurrentConflict = main_conflict,
        @CurrentTone = story_tone
    FROM @NovelSeeds
    WHERE row_num = @CurrentNovelRow;

    SET @ChapterNo = 1;

    WHILE @ChapterNo <= 20
    BEGIN
        SET @ChapterId = NEWID();
        SET @Status = CASE WHEN @ChapterNo <= 5 THEN 'FREE' ELSE 'LOCKED' END;
        SET @CoinPrice = CASE WHEN @ChapterNo <= 5 THEN 0 ELSE 20 + ((@ChapterNo % 5) * 5) END;
        SELECT
            @BeatTitle = beat_title,
            @BeatContent = beat_content
        FROM @ChapterBeats
        WHERE chapter_number = @ChapterNo;

        SET @ChapterTitle = CONCAT(N'Chapter ', @ChapterNo, N': ', @BeatTitle);
        SET @ChapterSlug = CONCAT(@CurrentNovelSlug, '-chapter-', @ChapterNo);
        SET @CreatedAt = DATEADD(DAY, -1 * ((@CurrentNovelRow * 30) - @ChapterNo), GETDATE());
        SET @ChapterContent = CONCAT(
            N'Novel: ', @CurrentNovelTitle, N'. Chapter ', @ChapterNo, N' - ', @BeatTitle, N'. ',
            N'Premise: ', @CurrentNovelDescription, N' ',
            N'This chapter belongs to the ', @CurrentNovelTheme, N' arc and keeps the tone of ', @CurrentTone, N'. ',
            N'The scene follows ', @CurrentProtagonist, N' through ', @CurrentSetting, N'. ',
            N'Central conflict: ', @CurrentConflict, N'. ',
            @BeatContent, N' ',
            N'In this chapter, ', @CurrentProtagonist, N' notices a detail that matches the novel title and its promise: ',
            CASE @CurrentNovelRow
                WHEN 1 THEN N'shadows inside the academy behave like witnesses, turning a school test into a magical investigation.'
                WHEN 2 THEN N'starlight routes and courier codes turn a delivery job into a race against war.'
                WHEN 3 THEN N'the crimson blade becomes both weapon and evidence as the exile fights through another ambush.'
                WHEN 4 THEN N'the moonlit contract tightens around two rival hearts whenever either side hides the truth.'
                WHEN 5 THEN N'gears, maps, and living engines point toward the buried mechanism beneath the city.'
                WHEN 6 THEN N'ash on the riverbank reveals how far the poison has traveled and who benefits from silence.'
                WHEN 7 THEN N'rain lanterns and old letters make the town''s grief feel personal, tender, and unresolved.'
                WHEN 8 THEN N'the ninth gate answers one ancient question while opening another path into myth.'
                WHEN 9 THEN N'neon reflections, hacked memories, and corporate lies pull the detective deeper into the case.'
                WHEN 10 THEN N'glass walls, forbidden language, and courtly desire make every translation politically dangerous.'
                WHEN 11 THEN N'the hollow crown on the throne is a replica; the real crown has a name engraved inside it, and that name is Dorian''s.'
                WHEN 12 THEN N'the signal bloom pattern in the soil matches a growth algorithm Seren wrote herself two years ago and never published.'
                WHEN 13 THEN N'the veil of salt left on the windowsill is not from the sea; its mineral signature matches the locked attic upstairs.'
                WHEN 14 THEN N'the iron nomad''s own repair tools carry the same factory stamp as the war machines, making Rafe an unwilling part of the story.'
                WHEN 15 THEN N'the glass garden''s oldest pane reflects a face that does not belong to Yuen; the greenhouse remembers its first gardener.'
                WHEN 16 THEN N'the messages from the parallel desk arrive at the exact minute Nora almost made a different choice, suggesting time is watching her.'
                WHEN 17 THEN N'the dust oracle''s newest riddle uses Tariq''s childhood nickname, a name no one outside his home village should know.'
                WHEN 18 THEN N'the cartographer''s lie is visible only when two maps are overlaid; together they form a route to the forbidden zone''s entrance.'
                WHEN 19 THEN N'the second skin Calla has worn so long now reacts to the target''s voice before her real self does, and that terrifies her.'
                ELSE N'the fog parliament''s mist thins for exactly one minute at dawn, long enough to read the vote that was supposed to disappear.'
            END,
            N' By the final paragraph, the chapter gives readers a concrete development, a character choice, and a hook for the next chapter.'
        );

        INSERT INTO chapters (id, novel_id, chapter_number, title, slug, content, status, coin_price, view_count, created_at)
        VALUES (
            @ChapterId,
            @CurrentNovelId,
            @ChapterNo,
            @ChapterTitle,
            @ChapterSlug,
            @ChapterContent,
            @Status,
            @CoinPrice,
            40 + (@CurrentNovelRow * 15) + (@ChapterNo * 9),
            @CreatedAt
        );

        IF @CurrentNovelRow = 1 AND @ChapterNo = 6
        BEGIN
            SET @FirstPaidChapterId = @ChapterId;
        END;

        IF @CurrentNovelRow = 1 AND @ChapterNo = 5
        BEGIN
            SET @BookmarkChapterId = @ChapterId;
        END;

        SET @ChapterNo = @ChapterNo + 1;
    END;

    SET @CurrentNovelRow = @CurrentNovelRow + 1;
END;

-- -------------------------------------------------------------------------
-- 6b. Add extra paid chapters for selected novels.
-- Requested order/counts:
-- row 8 +15, row 10 +45, row 16 +20, row 20 +9,
-- row 5 +4, row 3 +3, row 19 +7, row 9 +17.
-- Extra chapters continue after chapter 20.
-- -------------------------------------------------------------------------
DECLARE @ExtraChapterTargets TABLE (
    row_num INT NOT NULL PRIMARY KEY,
    extra_count INT NOT NULL
);

INSERT INTO @ExtraChapterTargets (row_num, extra_count)
VALUES
(8, 15),
(10, 45),
(16, 20),
(20, 9),
(5, 4),
(3, 3),
(19, 7),
(9, 17);

DECLARE @ExtraChapterIndex INT;
DECLARE @ExtraChapterCount INT;
DECLARE @ExtraArcDetail NVARCHAR(MAX);

SET @CurrentNovelRow = 1;

WHILE @CurrentNovelRow <= 20
BEGIN
    SELECT @ExtraChapterCount = extra_count
    FROM @ExtraChapterTargets
    WHERE row_num = @CurrentNovelRow;

    IF @ExtraChapterCount IS NOT NULL
    BEGIN
        SELECT
            @CurrentNovelId = novel_id,
            @CurrentNovelTitle = title,
            @CurrentNovelSlug = slug,
            @CurrentNovelDescription = description,
            @CurrentNovelTheme = theme,
            @CurrentProtagonist = protagonist,
            @CurrentSetting = story_setting,
            @CurrentConflict = main_conflict,
            @CurrentTone = story_tone
        FROM @NovelSeeds
        WHERE row_num = @CurrentNovelRow;

        SET @ExtraChapterIndex = 1;

        WHILE @ExtraChapterIndex <= @ExtraChapterCount
        BEGIN
            SET @ChapterNo = 20 + @ExtraChapterIndex;
            SET @ChapterId = NEWID();
            SET @Status = 'LOCKED';
            SET @CoinPrice = 25 + ((@ChapterNo % 6) * 5);
            SET @BeatTitle = CONCAT(N'Extended Arc ', @ExtraChapterIndex);
            SET @ChapterTitle = CONCAT(N'Chapter ', @ChapterNo, N': ', @BeatTitle);
            SET @ChapterSlug = CONCAT(@CurrentNovelSlug, '-chapter-', @ChapterNo);
            SET @CreatedAt = DATEADD(DAY, @ExtraChapterIndex, GETDATE());

            SET @ExtraArcDetail = CASE @CurrentNovelRow
                WHEN 3 THEN N'Kael follows the surviving royal standard through border tunnels, and each duel reveals another name from the list of traitors.'
                WHEN 5 THEN N'Ivo descends closer to the buried engine, where every repaired gear changes a street above and exposes the saboteur''s route.'
                WHEN 8 THEN N'Ansel and the awakened guardian cross the temples beyond the ninth gate, translating star inscriptions before rival explorers can weaponize them.'
                WHEN 9 THEN N'Juno tracks the missing android through data markets, memory clinics, and corporate dead zones where every witness has been edited.'
                WHEN 10 THEN N'Amara survives deeper court games as each translated phrase shifts an alliance, exposes a lover''s secret, or turns a noble house against itself.'
                WHEN 16 THEN N'Nora compares both timelines one decision at a time, learning which regrets are warnings and which are traps set by the collapse between worlds.'
                WHEN 19 THEN N'Calla''s cover identity keeps pulling her toward the target, while the mission files prove that love and loyalty are both being used against her.'
                ELSE N'Oswin studies the parliament''s moving rooms and vanishing vote records, tracing the fog to a faction that wins only when memory fails.'
            END;

            SET @ChapterContent = CONCAT(
                N'Novel: ', @CurrentNovelTitle, N'. Chapter ', @ChapterNo, N' - ', @BeatTitle, N'. ',
                N'This paid extra chapter continues after the first twenty chapters and keeps the same ', @CurrentNovelTheme, N' direction. ',
                N'Premise reminder: ', @CurrentNovelDescription, N' ',
                N'The scene follows ', @CurrentProtagonist, N' through ', @CurrentSetting, N', with the main conflict still pressing forward: ', @CurrentConflict, N'. ',
                @ExtraArcDetail, N' ',
                N'The chapter advances the extended arc by focusing on step ', @ExtraChapterIndex, N' of ', @ExtraChapterCount, N': ',
                CASE
                    WHEN @ExtraChapterIndex % 5 = 1 THEN N'a new clue appears, but accepting it forces the protagonist to trust someone whose motives remain unclear.'
                    WHEN @ExtraChapterIndex % 5 = 2 THEN N'the clue leads into a confrontation where the protagonist wins information but loses a safe route.'
                    WHEN @ExtraChapterIndex % 5 = 3 THEN N'an ally challenges the protagonist''s plan, turning the emotional cost of the mission into the center of the scene.'
                    WHEN @ExtraChapterIndex % 5 = 4 THEN N'the enemy answers with pressure, surveillance, or violence, proving the extended mystery is still alive.'
                    ELSE N'the chapter closes this mini-cycle with a reveal that points directly to the next chapter.'
                END,
                N' By the ending, chapter ', @ChapterNo, N' has its own event, its own decision, and a hook that continues naturally from chapter ', @ChapterNo - 1, N'.'
            );

            INSERT INTO chapters (id, novel_id, chapter_number, title, slug, content, status, coin_price, view_count, created_at)
            VALUES (
                @ChapterId,
                @CurrentNovelId,
                @ChapterNo,
                @ChapterTitle,
                @ChapterSlug,
                @ChapterContent,
                @Status,
                @CoinPrice,
                40 + (@CurrentNovelRow * 15) + (@ChapterNo * 9),
                @CreatedAt
            );

            SET @ExtraChapterIndex = @ExtraChapterIndex + 1;
        END;
    END;

    SET @ExtraChapterCount = NULL;
    SET @CurrentNovelRow = @CurrentNovelRow + 1;
END;

-- -------------------------------------------------------------------------
-- 7. Insert Payments, Coin Transactions, Chapter Unlocks, Bookmarks, Revenues
-- -------------------------------------------------------------------------
INSERT INTO payments (id, user_id, amount_vnd, coins_received, status, provider, transaction_ref, created_at)
VALUES
(@PaymentId, @UserId, 100000, 1000, 'completed', 'vnpay', 'VNP123456789', DATEADD(DAY, -4, GETDATE()));

INSERT INTO coin_transactions (id, user_id, type, amount, balance_after, ref_id, note, created_at)
VALUES
(NEWID(), @UserId, 'deposit', 1000, 1000, @PaymentId, N'Coin deposit via VNPAY', DATEADD(DAY, -4, GETDATE())),
(NEWID(), @UserId, 'spend', 25, 975, @FirstPaidChapterId, N'Unlocked chapter 6 of Shadow Academy', DATEADD(DAY, -1, GETDATE()));

INSERT INTO chapter_unlocks (id, user_id, chapter_id, coins_spent, unlocked_at)
VALUES
(NEWID(), @UserId, @FirstPaidChapterId, 25, DATEADD(DAY, -1, GETDATE()));

INSERT INTO bookmarks (id, user_id, novel_id, last_chapter_id, is_favorite, last_page, created_at, updated_at)
SELECT TOP 1 NEWID(), @UserId, novel_id, @BookmarkChapterId, 1, 1, DATEADD(DAY, -3, GETDATE()), GETDATE()
FROM @NovelSeeds
WHERE row_num = 1;

INSERT INTO revenues (id, novel_id, author_id, total_coins_earned, free_chapter_count, total_chapter_count, author_share_percent, author_coins, calculated_at)
SELECT
    NEWID(),
    novel_id,
    @AuthorId,
    375,
    5,
    20 + ISNULL(extra_count, 0),
    70.00,
    262,
    GETDATE()
FROM @NovelSeeds ns
LEFT JOIN @ExtraChapterTargets ect ON ect.row_num = ns.row_num;

-- -------------------------------------------------------------------------
-- 8. Verify data insertion
-- Expected minimums from this seed: 20 novels, 520 chapters, 100 free chapters.
-- -------------------------------------------------------------------------
SELECT N'Users count' AS [Table], COUNT(*) AS [Rows] FROM users
UNION ALL
SELECT N'Categories count', COUNT(*) FROM categories
UNION ALL
SELECT N'Novels count', COUNT(*) FROM novels
UNION ALL
SELECT N'Novel - Categories count', COUNT(*) FROM novel_categories
UNION ALL
SELECT N'Chapters count', COUNT(*) FROM chapters
UNION ALL
SELECT N'Free Chapters count', COUNT(*) FROM chapters WHERE status = 'FREE'
UNION ALL
SELECT N'Payments count', COUNT(*) FROM payments
UNION ALL
SELECT N'Coin Transactions count', COUNT(*) FROM coin_transactions
UNION ALL
SELECT N'Chapter Unlocks count', COUNT(*) FROM chapter_unlocks
UNION ALL
SELECT N'Bookmarks count', COUNT(*) FROM bookmarks
UNION ALL
SELECT N'Revenues count', COUNT(*) FROM revenues;

SELECT n.title, COUNT(c.id) AS chapter_count, SUM(CASE WHEN c.status = 'FREE' THEN 1 ELSE 0 END) AS free_chapter_count
FROM novels n
JOIN chapters c ON c.novel_id = n.id
GROUP BY n.title
ORDER BY n.title;
