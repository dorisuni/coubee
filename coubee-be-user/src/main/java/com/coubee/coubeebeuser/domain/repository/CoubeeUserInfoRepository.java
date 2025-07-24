package com.coubee.coubeebeuser.domain.repository;

import com.coubee.coubeebeuser.domain.CoubeeUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoubeeUserInfoRepository extends JpaRepository<CoubeeUserInfo,Long> {

    Optional<CoubeeUserInfo> findByUserId(Long userId);
}
