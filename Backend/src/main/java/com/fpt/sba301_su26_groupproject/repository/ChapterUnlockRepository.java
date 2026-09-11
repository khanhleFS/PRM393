package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.ChapterUnlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ChapterUnlockRepository extends JpaRepository<ChapterUnlock, UUID> {
    boolean existsByUserIdAndChapterId(UUID userId, Long chapterId);

    @Query("SELECT c.id, COALESCE(SUM(cu.coinsSpent), 0) FROM ChapterUnlock cu JOIN cu.chapter c WHERE c.novel.id = :novelId GROUP BY c.id")
    List<Object[]> findRevenueByChapterGroupId(@Param("novelId") Long novelId);

    @Query("SELECT c.id, COUNT(cu.id) FROM ChapterUnlock cu JOIN cu.chapter c WHERE c.novel.id = :novelId GROUP BY c.id")
    List<Object[]> findUnlockCountByChapterGroupId(@Param("novelId") Long novelId);

    @Query("SELECT cu.chapter.id FROM ChapterUnlock cu WHERE cu.user.id = :userId AND cu.chapter.novel.id = :novelId")
    List<Long> findUnlockedChapterIdsByUserIdAndNovelId(@Param("userId") UUID userId, @Param("novelId") Long novelId);
}
