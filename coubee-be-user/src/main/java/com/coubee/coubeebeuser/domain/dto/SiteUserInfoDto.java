package com.coubee.coubeebeuser.domain.dto;


import com.coubee.coubeebeuser.domain.CoubeeUser;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteUserInfoDto {
    private String username;
    private String nickname;
    public static SiteUserInfoDto fromEntity(CoubeeUser coubeeUser) {
        SiteUserInfoDto dto = new SiteUserInfoDto();
        dto.username = coubeeUser.getUsername();
        dto.nickname = coubeeUser.getNickname();
        return dto;
    }
}
