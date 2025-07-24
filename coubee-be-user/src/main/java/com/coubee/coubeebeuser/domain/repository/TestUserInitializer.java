package com.coubee.coubeebeuser.domain.repository;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.Role;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestUserInitializer {

    private final SiteUserRepository siteUserRepository;

    @PostConstruct
    public void init() {
        String testUsername = "test_user";
        String testAdminName = "test_admin";
        String testSuperAdminName = "test_super_admin";
        if(siteUserRepository.findByUsername(testUsername).isEmpty()
                &&siteUserRepository.findByUsername(testAdminName).isEmpty()
                &&siteUserRepository.findByUsername(testSuperAdminName).isEmpty()){
            CoubeeUser testUser = CoubeeUser.builder()
                    .username(testUsername)
                    .password("1234")
                    .nickname("테스트유저")
                    .role(Role.ROLE_USER)
                    .build();
            siteUserRepository.save(testUser);
            CoubeeUser testAdmin = CoubeeUser.builder()
                    .username(testAdminName)
                    .password("1234")
                    .nickname("테스트점장")
                    .role(Role.ROLE_ADMIN)
                    .build();
            siteUserRepository.save(testAdmin);
            CoubeeUser testSuperAdmin = CoubeeUser.builder()
                    .username(testSuperAdminName)
                    .password("1234")
                    .nickname("테스트관리자")
                    .role(Role.ROLE_SUPER_ADMIN)
                    .build();
            siteUserRepository.save(testSuperAdmin);
            System.out.println("✅ 테스트 고객 유저 생성 완료: " + testUsername);
            System.out.println("✅ 테스트 점장 유저 생성 완료: " + testAdminName);
            System.out.println("✅ 테스트 관리자 유저 생성 완료: " + testSuperAdminName);
        }else {
            System.out.println("ℹ️ 테스트 유저 이미 존재함");
        }
    }
}