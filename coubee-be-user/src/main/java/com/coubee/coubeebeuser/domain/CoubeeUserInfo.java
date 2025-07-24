package com.coubee.coubeebeuser.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_info")
@NoArgsConstructor
public class CoubeeUserInfo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userInfoId;

    // OneToOne 관계 매핑 대신 단순 Id 참조로 선택
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name")
    @Getter
    @Setter
    private String name;

    @Column(name = "email")
    @Getter
    @Setter
    private String email;

    @Column(name = "phone_num")
    @Getter
    @Setter
    private String phoneNum;

    @Column(name = "gender")
    @Getter
    @Setter
    private String gender;

    @Column(name = "age")
    @Getter
    @Setter
    private Integer age;

    @Column(name = "profile_image_url")
    @Getter
    @Setter
    private String profileImageUrl;

    @Builder
    public CoubeeUserInfo(Long userId, String name, String email, String phoneNum, String gender, Integer age, String profileImageUrl) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phoneNum = phoneNum;
        this.gender = gender;
        this.age = age;
        this.profileImageUrl = profileImageUrl;
    }

}
