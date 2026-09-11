package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.ChapterStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "chapters")
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;

    @NotNull
    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;

    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 300)
    @NotNull
    @Nationalized
    @Column(name = "slug", nullable = false, length = 300)
    private String slug;

    @NotNull
    @Nationalized
    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "audio_url", length = 1000)
    private String audioUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChapterStatus status = ChapterStatus.FREE;

    @Column(name = "coin_price")
    private Integer coinPrice;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updateAt;
}