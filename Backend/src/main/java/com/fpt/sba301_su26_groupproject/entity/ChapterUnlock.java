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
@Table(name = "chapter_unlocks")
public class ChapterUnlock {
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
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @NotNull
    @Column(name = "coins_spent", nullable = false)
    private Integer coinsSpent;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt;

}