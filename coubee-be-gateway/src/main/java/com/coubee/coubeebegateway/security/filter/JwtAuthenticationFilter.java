package com.coubee.coubeebegateway.security.filter;

import com.coubee.coubeebegateway.security.jwt.JwtTokenValidator;
import com.coubee.coubeebegateway.security.jwt.authentication.JwtAuthentication;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenValidator jwtTokenValidator;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // OPTIONS 요청(프리플라이트)은 JWT 검증 없이 바로 통과
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("OPTIONS request detected, skipping JWT authentication for URI: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = jwtTokenValidator.getToken(request);

        if (jwtToken != null) {
            // 토큰이 존재하면 유효성 검증 시도
            JwtAuthentication authentication = jwtTokenValidator.validateToken(jwtToken);
            if (authentication != null) {
                // 토큰이 유효하면 SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Successfully authenticated user: {}", authentication.getPrincipal());
            } else {
                // 토큰이 유효하지 않은 경우(만료, 서명 불일치 등) 경고 로그만 남기고 넘어감
                // SecurityContext는 비어있게 되며, 이후 AuthorizationFilter가 처리함
                log.warn("Invalid JWT token received for URI: {}", request.getRequestURI());
            }
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
