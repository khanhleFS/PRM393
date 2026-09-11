package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.CoinTransactionType;
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
@Table(name = "coin_transactions")
public class CoinTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Nationalized
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private CoinTransactionType type;

    @NotNull
    @Column(name = "amount", nullable = false)
    private Integer amount;

    @NotNull
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(name = "ref_id")
    private UUID refId;

    @Size(max = 255)
    @Nationalized
    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coin_package_id")
    private CoinPackage coinPackage;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}