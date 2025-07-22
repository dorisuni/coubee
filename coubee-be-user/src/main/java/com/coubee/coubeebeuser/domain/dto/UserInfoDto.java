package com.coubee.coubeebeuser.domain.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class UserInfoDto {
    @Getter @Setter
    public static class Request {
        private String userId;
    }

    @Getter @Setter
    public static class Response {
        private String username;
        private String nickname;
    }
}
