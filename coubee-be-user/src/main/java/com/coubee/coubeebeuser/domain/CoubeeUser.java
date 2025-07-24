package com.coubee.coubeebeuser.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Entity
@Table(name = "coubee_user")
@NoArgsConstructor
public class CoubeeUser extends BaseTimeEntity{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter @Setter
    private Long userId;

    @Column(name = "user_id", unique = true, nullable = false)
    @Getter @Setter
    private String username;

    @Column(name = "password", nullable = false)
    @Getter @Setter
    private String password;

    @Column(name="nickname", nullable = false)
    @Getter @Setter
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Getter @Setter
    private Role role;


    @Builder
    public CoubeeUser(String username, String password,String nickname, Role role) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
    }
}
