package com.fpt.sba301_su26_groupproject.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("RefreshToken")
public class RefreshTokenRedis {

    @Id
    private String token;

    private UUID userId;

    private String email;

    @TimeToLive
    private long ttlInSeconds;
}
