package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.common.infrastructure.BaseEntity;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.AuthorStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "author_profiles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AuthorProfile extends BaseEntity {

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "pen_name", nullable = false)
    private String penName;

    @Nationalized
    @Lob
    @Column(name = "bio")
    private String bio;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "author_coin_balance", nullable = false)
    @Builder.Default
    private Integer authorCoinBalance = 0;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_novels", nullable = false)
    @Builder.Default
    private Long totalNovels = 0L;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_chapters", nullable = false)
    @Builder.Default
    private Long totalChapters = 0L;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_views", nullable = false)
    @Builder.Default
    private Long totalViews = 0L;

    @Size(max = 100)
    @Nationalized
    @Column(name = "bank_name")
    private String bankName;

    @Size(max = 100)
    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Size(max = 255)
    @Nationalized
    @Column(name = "bank_account_holder")
    private String bankAccountHolder;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AuthorStatus status = AuthorStatus.PENDING;
}
