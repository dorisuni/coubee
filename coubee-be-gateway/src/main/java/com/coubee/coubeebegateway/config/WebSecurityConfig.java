package com.coubee.coubeebegateway.config;

import com.coubee.coubeebegateway.security.filter.JwtAuthenticationFilter;
import com.coubee.coubeebegateway.security.handler.CustomAccessDeniedHandler;
import com.coubee.coubeebegateway.security.handler.CustomAuthenticationEntryPoint;
import com.coubee.coubeebegateway.security.jwt.JwtTokenValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                .cors(httpSecurityCorsConfigurer -> {
                    httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
                })
                .csrf(AbstractHttpConfigurer::disable)
                .securityMatcher("/**")
                .sessionManagement(sessionManagementConfigurer ->
                    sessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenValidator),
                        UsernamePasswordAuthenticationFilter.class
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/order/webhook/portone").permitAll()
                        .requestMatchers("/api/user/notification/token/delete").permitAll()
                        .requestMatchers("/api/user/auth/**").permitAll()
                        .requestMatchers("/api/user/images/**").permitAll()
                        .requestMatchers("/api/store/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/store/images/**").permitAll()
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

        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Auth-Token",
                "webhook-signature", // PortOne 서명 헤더 허용
                "webhook-timestamp", // PortOne 타임스탬프 헤더 허용
                "webhook-id" // PortOne 고유 ID 헤더 허용
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
