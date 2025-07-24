package com.coubee.coubeebeuser.secret.jwt;


import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.secret.jwt.dto.TokenDto;
import com.coubee.coubeebeuser.secret.jwt.props.JwtConfigProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class TokenGenerator {
    private final JwtConfigProperties configProperties;

    private volatile SecretKey secretKey;

    private SecretKey getSecretKey() {
        if (secretKey == null) {
            synchronized (this) {
                if( secretKey == null) {
                    secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(configProperties.getSecretKey()));
                }
            }
        }
        return secretKey;
    }

//    public TokenDto.AccessToken generateAccessToken(String username, String deviceType) {
//        TokenDto.JwtToken jwtToken = this.generateToken(username, deviceType, false);
//        return new TokenDto.AccessToken(jwtToken);
//    }
//
//    public TokenDto.AccessRefreshToken generateAccessRefreshToken(String username, String deviceType) {
//        TokenDto.JwtToken accessJwtToken = this.generateToken(username, deviceType, false);
//        TokenDto.JwtToken refreshJwtToken = this.generateToken(username, deviceType, true);
//        return new TokenDto.AccessRefreshToken(accessJwtToken, refreshJwtToken);
//    }

    public TokenDto.AccessToken generateAccessToken(CoubeeUser user, String deviceType) {
        TokenDto.JwtToken jwtToken = this.generateToken(user, deviceType, false);
        return new TokenDto.AccessToken(jwtToken);
    }

    public TokenDto.AccessRefreshToken generateAccessRefreshToken(CoubeeUser user, String deviceType) {
        TokenDto.JwtToken accessJwtToken = this.generateToken(user, deviceType, false);
        TokenDto.JwtToken refreshJwtToken = this.generateToken(user, deviceType, true);
        return new TokenDto.AccessRefreshToken(accessJwtToken, refreshJwtToken);
    }

//    public TokenDto.JwtToken generateToken(String username,
//                                           String deviceType,
//                                           boolean refreshToken) {
//        int tokenExpiresIn = tokenExpiresIn(refreshToken, deviceType);
//        String tokenType = refreshToken ? "refresh" : "access";
//
//        String token = Jwts.builder()
//                .issuer("coubee")
//                .subject(username)
//                .claim("username", username)
//                .claim("tokenType", tokenType)
//                .issuedAt(new Date())
//                .expiration(new Date(System.currentTimeMillis() + tokenExpiresIn * 1000L))
//                .signWith(getSecretKey())
//                .header().add("typ", "JWT")
//                .and()
//                .compact();
//
//        return new TokenDto.JwtToken(token, tokenExpiresIn);
//    }
    public TokenDto.JwtToken generateToken(CoubeeUser user,
                                           String deviceType,
                                           boolean refreshToken) {
        int tokenExpiresIn = tokenExpiresIn(refreshToken, deviceType);
        String tokenType = refreshToken ? "refresh" : "access";

        String token = Jwts.builder()
                .issuer("coubee")
                .subject(user.getUsername())
                .claim("userId",user.getUserId().toString())
                .claim("username", user.getUsername())
                .claim("nickname", user.getNickname())
                .claim("role", user.getRole())
                .claim("tokenType", tokenType)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + tokenExpiresIn * 1000L))
                .signWith(getSecretKey())
                .header().add("typ", "JWT")
                .and()
                .compact();
        return new TokenDto.JwtToken(token, tokenExpiresIn);
    }


    public String validateJwtToken(String refreshToken) {
        String username = null;
        final Claims claims = this.verifyAndGetClaims(refreshToken);
        if ( claims == null) {
            return null;
        }
        Date expirationDate = claims.getExpiration();
        if (expirationDate == null || expirationDate.before(new Date())) {
            return null;
        }
        username = claims.get("username", String.class);

        String tokenType = claims.get("tokenType", String.class);
        if (!"refresh".equals(tokenType)) {
            return null;
        }
        return username;
    }

    private Claims verifyAndGetClaims(String token) {
        Claims claims = null;

        try {
            claims = Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            claims = null;
        }

        return claims;
    }

    private int tokenExpiresIn(boolean refreshToken, String deviceType) {
        int expiresIn = 60 * 15;

        if( refreshToken) {
            if( deviceType != null) {
                if( deviceType.equals("WEB")) {
                    expiresIn = configProperties.getExpiresIn();
                } else if( deviceType.equals("MOBILE")) {
                    expiresIn = configProperties.getMobileExpiresIn();
                } else if( deviceType.equals("TABLET")) {
                    expiresIn = configProperties.getTabletExpiresIn();
                } else {
                    expiresIn = configProperties.getExpiresIn();
                }
            } else {
                expiresIn = configProperties.getExpiresIn();
            }
        }

        return expiresIn;
    }
}
