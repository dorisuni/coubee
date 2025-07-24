const crypto = require('crypto');

// JWT 시크릿 키 (application-local.yml에서 가져온 값)
const SECRET_KEY = 'AADfaskllewstdjfhjwhreawrkewjr32dsfasdTG764Gdslkj298GsWg86G';

// Base64URL 인코딩 함수
function base64UrlEncode(data) {
    return Buffer.from(data)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// JWT 토큰 생성 함수
function generateTestToken(userId, username, nickname, role) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (15 * 60); // 15분 후 만료
    
    // JWT Header
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    
    // JWT Payload
    const payload = {
        "iss": "coubee",
        "sub": username,
        "userId": userId.toString(),
        "username": username,
        "nickname": nickname,
        "role": role,
        "tokenType": "access",
        "iat": now,
        "exp": exp
    };
    
    // Base64URL 인코딩
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // 서명 생성
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(signatureData)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    // 최종 JWT 토큰
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    return {
        token: token,
        expiresAt: new Date(exp * 1000).toISOString(),
        payload: payload
    };
}

// 테스트 사용자들의 토큰 생성
console.log('=== Coubee 테스트 JWT 토큰 생성 ===\n');

// 1. 일반 사용자 토큰
const userToken = generateTestToken(1, 'test_user', '테스트유저', 'ROLE_USER');
console.log('1. 일반 사용자 (test_user):');
console.log(`   Token: ${userToken.token}`);
console.log(`   Expires: ${userToken.expiresAt}`);
console.log('');

// 2. 관리자 토큰  
const adminToken = generateTestToken(2, 'test_admin', '테스트점장', 'ROLE_ADMIN');
console.log('2. 관리자 (test_admin):');
console.log(`   Token: ${adminToken.token}`);
console.log(`   Expires: ${adminToken.expiresAt}`);
console.log('');

// 3. 슈퍼 관리자 토큰
const superAdminToken = generateTestToken(3, 'test_super_admin', '테스트관리자', 'ROLE_SUPER_ADMIN');
console.log('3. 슈퍼 관리자 (test_super_admin):');
console.log(`   Token: ${superAdminToken.token}`);
console.log(`   Expires: ${superAdminToken.expiresAt}`);
console.log('');

console.log('=== 사용법 ===');
console.log('HTTP 요청 헤더에 다음과 같이 추가:');
console.log('Authorization: Bearer <위의 토큰 중 하나>');
console.log('');
console.log('JavaScript에서 사용 예시:');
console.log(`const token = "${userToken.token}";`);
console.log(`
fetch('https://dorisuni.store/api/orders', {
    method: 'POST',
    headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
});`);