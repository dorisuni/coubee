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
        String jwtToken = jwtTokenValidator.getToken(request);
        if (jwtToken != null) {
            JwtAuthentication authentication = jwtTokenValidator.validateToken(jwtToken);
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("successfully authenticated user: {}", authentication.getPrincipal());
            }else{
                log.info("authentication is null!!!");
            }
        }
        filterChain.doFilter(request, response);
    }
}
