package com.coubee.coubeebeuser.domain.dto;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteUserRegisterDto {
    @NotBlank(message = "아이디를 입력하세요.")
    private String username;

    @NotBlank(message = "비밀번호를 입력하세요.")
    private String password;

    @NotBlank(message = "닉네임을 입력하세요")
    private String nickName;

    private String role;  // [USER,ADMIN,SUPER_ADMIN]

    public CoubeeUser toEntity() {
        Role role = Role.valueOf("ROLE_"+this.role);
        CoubeeUser coubeeUser = CoubeeUser.builder()
                .username(this.username)
                .password(this.password)
                .nickname(this.nickName)
                .role(role)
                .build();
        return coubeeUser;
    }
}
