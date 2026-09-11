package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.NovelStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "novels")
public class Novel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

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

    @Nationalized
    @Lob
    @Column(name = "description")
    private String description;

    @Size(max = 500)
    @Nationalized
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NovelStatus status = NovelStatus.ONGOING;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

}