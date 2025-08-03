package com.coubee.coubeebegateway.config;

import com.coubee.coubeebegateway.security.filter.JwtAuthenticationFilter;
import com.coubee.coubeebegateway.security.handler.CustomAccessDeniedHandler;
import com.coubee.coubeebegateway.security.handler.CustomAuthenticationEntryPoint;
import com.coubee.coubeebegateway.security.jwt.JwtTokenValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenValidator jwtTokenValidator;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain applicationSecurity(HttpSecurity http) throws Exception {
        http
                // CORS는 Spring Cloud Gateway에서 처리하므로 Spring Security에서는 비활성화
                .cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenValidator),
                        UsernamePasswordAuthenticationFilter.class
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                // authorizeHttpRequests는 여기서 한 번만 호출되어야 합니다.
                .authorizeHttpRequests(registry -> registry
                        // OPTIONS 요청 허용 (CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 인증 없이 접근 가능한 엔드포인트
                        .requestMatchers("/api/user/auth/**").permitAll()
                        .requestMatchers("/api/order/payment/config").permitAll()
                        .requestMatchers("/api/order/webhook/**").permitAll()
                        // 관리자 권한이 필요한 엔드포인트
                        .requestMatchers("/api/store/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/store/su/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/product/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/product/su/**").hasRole("SUPER_ADMIN")
                        // 나머지 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // CORS 설정은 Spring Cloud Gateway에서 처리하므로 여기서는 제거
    // Gateway의 globalcors 설정을 통해 CORS가 처리됩니다.
}