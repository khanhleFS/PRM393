package com.fpt.sba301_su26_groupproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "bookmarks")
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_chapter_id")
    private Chapter lastChapter;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "reading_progress_percent", nullable = false)
    private Integer readingProgressPercent = 0;

    public void setReadingProgressPercent(Integer readingProgressPercent) {
        if (readingProgressPercent == null) {
            this.readingProgressPercent = 0;
        } else {
            this.readingProgressPercent = Math.max(0, Math.min(100, readingProgressPercent));
        }
    }

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

}