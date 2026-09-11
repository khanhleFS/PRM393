package com.fpt.sba301_su26_groupproject.entity;

import com.fpt.sba301_su26_groupproject.common.infrastructure.BaseEntity;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    @Column(name = "username", unique = true, nullable = false, length = 255)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone", unique = true, nullable = false)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "coin_balance", nullable = false)
    @Builder.Default
    private Integer coinBalance = 0;

    //add isAuthor field to User entity
    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_author", nullable = false)
    @Builder.Default
    private Boolean isAuthor = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AuthorProfile authorProfile;
}
