package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByNovelIdOrderByChapterNumberAsc(Long novelId);
    
    @Query("SELECT COALESCE(MAX(c.chapterNumber), 0) FROM Chapter c WHERE c.novel.id = :novelId")
    Integer findMaxChapterNumberByNovelId(@Param("novelId") Long novelId);

    Optional<Chapter> findByNovelIdAndChapterNumber(Long novelId, Integer chapterNumber);
    Optional<Chapter> findByNovelIdAndId(Long novelId, Long id);

    boolean existsByNovelIdAndChapterNumber(Long novelId, Integer chapterNumber);

    @Query("SELECT c.viewCount FROM Chapter c WHERE c.novel.id = :novelId AND c.chapterNumber = (SELECT MAX(c2.chapterNumber) FROM Chapter c2 WHERE c2.novel.id = :novelId)")
    Integer findLatestChapterViewCountByNovelId(@Param("novelId") Long novelId);

//    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.novel.id = :novelId")
//    long countByNovelId(@Param("novelId") Long novelId);
//
//    @Query("SELECT COALESCE(SUM(c.viewCount), 0) FROM Chapter c WHERE c.novel.id = :novelId")
//    Long sumChapterViewCountByNovelId(@Param("novelId") Long novelId);
//
//    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.novel.author.id = :authorUserId")
//    long countByAuthorUserId(@Param("authorUserId") UUID authorUserId);
}