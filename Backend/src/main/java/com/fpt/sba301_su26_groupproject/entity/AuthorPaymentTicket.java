package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.common.infrastructure.BaseEntity;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.TicketStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Entity
@Table(name = "author_payment_tickets")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AuthorPaymentTicket extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_profile_id", nullable = false)
    private AuthorProfile authorProfile;

    @Size(max = 20)
    @NotNull
    @Column(name = "month_year", nullable = false, length = 20)
    private String monthYear;

    @NotNull
    @Column(name = "total_coins", nullable = false)
    private Integer totalCoins;

    @NotNull
    @ColumnDefault("1000")
    @Column(name = "coin_rate", nullable = false)
    @Builder.Default
    private Integer coinRate = 1000;

    @NotNull
    @Column(name = "amount_vnd", nullable = false)
    private Integer amountVnd;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.UNPAID;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Size(max = 100)
    @Nationalized
    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;
}
