package com.coubee.coubeebeuser.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteUserInfoRegisterDto {

    private String name;

    private String email;

    private String phoneNum;

    private String gender;  // Female, Male

    private Integer age;

    private String profileImageUrl;
}
