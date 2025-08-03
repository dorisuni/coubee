package com.coubee.coubeebegateway.gateway.filter;

import com.coubee.coubeebegateway.common.util.HttpUtils;
import com.coubee.coubeebegateway.security.jwt.authentication.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.function.ServerRequest;

import java.util.function.Function;

@Slf4j
public class AuthenticationHeaderFilterFunction {
    public static Function<ServerRequest, ServerRequest> addHeader() {
        return request -> {
            ServerRequest.Builder requestBuilder = ServerRequest.from(request);

            // OPTIONS 요청(프리플라이트)은 인증 헤더 추가 없이 바로 통과
            if ("OPTIONS".equalsIgnoreCase(request.method().name())) {
                log.debug("OPTIONS request detected, skipping authentication header addition for URI: {}", request.uri());
                return requestBuilder.build();
            }

            // 인증 정보가 있는 경우에만 헤더 추가
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
                requestBuilder.header("X-Auth-UserId", userPrincipal.getUserId());
                requestBuilder.header("X-Auth-UserName", userPrincipal.getUsername());
                requestBuilder.header("X-Auth-UserNickName", userPrincipal.getNickName());
                requestBuilder.header("X-Auth-Role", userPrincipal.getRole());
                log.info("role : {}",userPrincipal.getRole());
                // 필요시 권한 정보 입력
                // requestBuilder.header("X-Auth-Authorities", ...);
            } else {
                log.debug("No authentication context found for URI: {}, skipping auth headers", request.uri());
            }

            String remoteAddr = HttpUtils.getRemoteAddr(request.servletRequest());
            requestBuilder.header("X-Client-Address", remoteAddr);

            // org.springframework.boo:spring-boot-starter-mobile:1.5.22.RELEASE

            String device = "WEB";
            requestBuilder.header("X-Client-Device", device);

            return requestBuilder.build();
        };
    }
}
