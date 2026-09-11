package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.entity.Enumeration.PaymentStatus;
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
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @NotNull
    @Column(name = "amount_vnd", nullable = false)
    private Integer amountVnd;

    @NotNull
    @Column(name = "coins_received", nullable = false)
    private Integer coinsReceived;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Nationalized
    @Column(name = "status", nullable = false, length = 10)
    private PaymentStatus status;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @Column(name = "provider", nullable = false, length = 20)
    private String provider;

    @Size(max = 100)
    @Nationalized
    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "paid_at")
    private Instant paidAt;
}
