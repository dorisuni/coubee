package com.coubee.coubeebeuser.domain.dto;

import com.coubee.coubeebeuser.secret.jwt.dto.TokenDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteUserLoginResponseDto {
    private SiteUserInfoDto userInfo;
    private TokenDto.AccessRefreshToken accessRefreshToken;
}
