package com.coubee.coubeebeuser.domain.dto;

import lombok.Data;

@Data
public class TokenUserInfoDto {
    private String username;
    private String nickName;
    private String role;
}
