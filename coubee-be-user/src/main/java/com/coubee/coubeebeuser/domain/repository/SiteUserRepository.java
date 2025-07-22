package com.coubee.coubeebeuser.domain.repository;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteUserRepository extends JpaRepository<CoubeeUser, Long> {
    Optional<CoubeeUser> findByUsername(String username);
    Optional<CoubeeUser> findByNickname(String nickname);
}
