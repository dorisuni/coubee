package com.coubee.coubeebeuser.domain.dto;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.CoubeeUserInfo;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteUserInfoDto {
    private String username;
    private String nickname;
    private String name;
    private String email;
    private String phoneNum;
    private String gender;
    private Integer age;
    private String profileImageUrl;
    private Boolean isInfoRegister;

    public static SiteUserInfoDto fromEntity(CoubeeUser coubeeUser, CoubeeUserInfo coubeeUserInfo) {
        SiteUserInfoDto dto = new SiteUserInfoDto();
        dto.username = coubeeUser.getUsername();
        dto.nickname = coubeeUser.getNickname();
        if (coubeeUserInfo != null) {
            dto.name = safeString(coubeeUserInfo.getName());
            dto.email = safeString(coubeeUserInfo.getEmail());
            dto.phoneNum = safeString(coubeeUserInfo.getPhoneNum());
            dto.gender = safeString(coubeeUserInfo.getGender());
            dto.age = coubeeUserInfo.getAge();
            dto.profileImageUrl = safeString(coubeeUserInfo.getProfileImageUrl());
            dto.isInfoRegister = true;
        }else{
            dto.isInfoRegister = false;
        }
        return dto;
    }
    private static String safeString(String value) {
        return (value == null || value.isEmpty()) ? "" : value;
    }
}
