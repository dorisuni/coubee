package com.coubee.coubeebeuser.domain.repository;

import com.coubee.coubeebeuser.domain.NotificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationTokenRepository extends JpaRepository<NotificationToken, Long> {

    List<NotificationToken> findAllByUser_UserId(Long userId);

    Optional<NotificationToken> findByToken(String token);

}
