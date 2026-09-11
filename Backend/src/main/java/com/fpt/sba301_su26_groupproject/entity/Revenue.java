package com.fpt.sba301_su26_groupproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "revenues")
public class Revenue {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_coins_earned", nullable = false)
    private Integer totalCoinsEarned;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "free_chapter_count", nullable = false)
    private Integer freeChapterCount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_chapter_count", nullable = false)
    private Integer totalChapterCount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "author_share_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal authorSharePercent;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "author_coins", nullable = false)
    private Integer authorCoins;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;

}