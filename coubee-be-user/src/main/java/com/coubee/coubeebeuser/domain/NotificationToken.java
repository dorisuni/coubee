package com.coubee.coubeebeuser.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class NotificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tokenId;

    @ManyToOne()
    @JoinColumn(name = "user_id", nullable = false)
    private CoubeeUser user;

    private String token;


    @Builder
    public NotificationToken(CoubeeUser user, String token) {
        this.user = user;
        this.token = token;
    }
}
