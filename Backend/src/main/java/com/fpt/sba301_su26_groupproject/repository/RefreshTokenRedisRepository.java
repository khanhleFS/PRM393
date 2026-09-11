package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.entity.RefreshTokenRedis;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRedisRepository extends CrudRepository<RefreshTokenRedis, String> {
}
