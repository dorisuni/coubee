package com.coubee.coubeebeuser.remote.alim.dto;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SendSmsDto {
    @Getter
    @Setter
    public static class Request {
        private String username;
        private String phoneNumber;
        private String title;
        private String message;

        public static Request fromEntity(CoubeeUser siteUser) {
            Request request = new Request();

            request.username = siteUser.getUsername();
            request.title = "가입축하 메시지 타이틀";
            request.message = "가입축하 메시지";

            return request;
        }
    }

    @Getter @Setter
    public static class Response {
        private String result;
    }
}
