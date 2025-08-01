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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
                        // --- 디버깅을 위해 모든 요청을 열고 싶을 때 ---
                        // .anyRequest().permitAll()

                        // --- 최종 보안 규칙 적용 ---
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/user/auth/**").permitAll()
                        .requestMatchers("/api/order/payment/config").permitAll()
                        .requestMatchers("/api/store/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/store/su/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/product/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/product/su/**").hasRole("SUPER_ADMIN")
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        // 와일드카드 '*' 대신 신뢰하는 출처를 명시적으로 등록합니다.
        config.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501",
                "http://127.0.0.1:3000",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}