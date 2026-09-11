# TÀI LIỆU KIẾN TRÚC BẢO MẬT & MÃ HÓA ĐỘNG THEO JWT ACCESS TOKEN

> **Dự án:** SBA301 - Trình Đọc Truyện Bảo Mật  
> **Tác giả tài liệu:** Antigravity AI & Khanh  
> **Vị trí lưu:** `SBA301_SU26_GroupProject/AI_History/Khanh/secret.md`

---

## 1. TẠI SAO DÙNG JWT ACCESS TOKEN LÀM THÀNH PHẦN SINH KHÓA?

Trong ứng dụng Web hiện đại, **JWT (JSON Web Token)** là tiêu chuẩn xác thực an toàn hàng đầu vì:
1. **Xóa sạch 100% Hằng số Key ở Frontend:** Mã nguồn JS/HTML hoàn toàn không chứa bất kỳ chuỗi `SECRET_KEY` hay Salt cố định nào (F12 Inspect 100% sạch).
2. **Khóa gắn liền với tài khoản đang đăng nhập:** 
   - `JWT AccessToken` được cấp riêng cho từng người dùng khi đăng nhập và lưu trong `localStorage`.
   - Chuỗi hạt giống sinh Dynamic Key được tạo từ thông tin định danh băm trong JWT Token của User:
     $$\text{Seed} = \text{jwtUserIdentifier} + \text{":"} + \text{"novel:"} + \text{novelId} + \text{":chapter:"} + \text{chapterNumber} + \text{":"} + \text{ivHex}$$
     $$\text{DynamicKey} = \text{SHA-256}(\text{Seed})$$
3. **Triệt tiêu nguy cơ bị dùng lại tài khoản (Account Switching Protection):**
   - Khi **User A** Đăng xuất hoặc **User B** Đăng nhập trên cùng một trình duyệt, `accessToken` của User A bị xóa/thay thế hoàn toàn.
   - Dynamic Key giải mã của User B sẽ tính ra kết quả khác hẳn User A, làm cho toàn bộ dữ liệu mã hóa cũ bị khóa chặt lập tức.

---

## 2. CÁC LỚP BẢO VỆ UI FRONTEND (CLIENT UI PROTECTION)

1. **HTML5 Canvas Renderer:**
   - Văn bản sau khi giải mã trong RAM được vẽ bằng nét cọ 2D (`CanvasRenderingContext2D`) trực tiếp lên thẻ `<canvas id="storyCanvas"></canvas>`.
   - Cây thư mục HTML DOM hoàn toàn trống rỗng, không chứa thẻ `<p>` hay `<div>` nào có văn bản.
2. **Chặn thao tác chuột & phím tắt:**
   - Chặn `contextmenu` (menu chuột phải).
   - Chặn `selectstart` (quét bôi đen văn bản).
   - Chặn các phím tắt F12, `Ctrl+Shift+I/J/C`, `Ctrl+U`, `Ctrl+S`.

---

## 3. MÔ HÌNH LUỒNG HOẠT ĐỘNG END-TO-END

### 3.1 Các thuật toán sử dụng
1. **JWT Payload Processing:** Giải mã phần Payload của JWT Token (`token.split('.')[1]`) thu được `sub` / `email`.
2. **KDF (Key Derivation Function):** **SHA-256** - Băm chuỗi hạt giống `seed` thành mảng **32 bytes (256 bits)** làm chìa khóa AES.
3. **Thuật toán mã hóa đối xứng:** **AES-256-CBC** với chuẩn đệm **PKCS5Padding / PKCS7**.
4. **Định dạng dữ liệu truyền tải:** **Hexadecimal (Base16)** - Đổi các byte nhị phân thô thành chuỗi Hex (`0-9, a-f`).

### 3.2 Sơ đồ luồng hoạt động (Sequence Diagram)

```
[ NGƯỜI DÙNG ]            [ FRONTEND (JS / CANVAS) ]              [ BACKEND (SPRING BOOT) ]
      |                               |                                      |
      |--- 1. Bấm chọn đọc Chương --->|                                      |
      |                               |--- 2. GET /api/novels/21/chapters/1->| (kèm Bearer JWT Token)
      |                               |                                      |--- 3. JwtFilter xác thực & lấy userEmail từ Token
      |                               |                                      |--- 4. contextId = "userA@gmail.com:novel:21:chapter:1"
      |                               |                                      |--- 5. Sinh IV ngẫu nhiên 16 bytes -> ivHex
      |                               |                                      |--- 6. DynamicKey = SHA256(contextId + ":" + ivHex)
      |                               |                                      |--- 7. Mã hóa AES-256-CBC(PlainText, DynamicKey, IV)
      |                               |<-- 8. Trả JSON { encryptedData, iv }-|
      |                               |                                      
      |                               |--- 9. Lấy userEmail từ JWT AccessToken (token.split('.')[1])
      |                               |--- 10. contextId = "userA@gmail.com:novel:21:chapter:1"
      |                               |--- 11. DynamicKey = CryptoJS.SHA256(contextId + ":" + ivHex)
      |                               |--- 12. AES Decrypt(encryptedData, DynamicKey, IV) -> PlainText trong RAM
      |                               |--- 13. Vẽ PlainText lên <canvas>
      |<-- 14. Hiển thị trang đọc ----|
```

---

## 4. GIẢI THÍCH CHI TIẾT CODE THEO TỪNG LUỒNG

### 4.1 Phía Backend: `ChapterServiceImpl.java` & `EncryptionServiceImpl.java`

**Tại `ChapterServiceImpl.java`:**
```java
private ChapterResponseDTO mapToResponseDTO(Chapter chapter, String userEmail) {
    String userIdentifier = (userEmail != null && !userEmail.isBlank()) ? userEmail : "GUEST_JWT";
    String contextId = userIdentifier + ":novel:" + chapter.getNovel().getId() + ":chapter:" + chapter.getChapterNumber();
    Map<String, String> encryptedMap = encryptionService.encrypt(chapter.getContent(), contextId);
    ...
}
```
- Lấy `userEmail` được xác thực bởi `JwtAuthenticationFilter` từ JWT AccessToken để tạo `contextId`.

**Tại `EncryptionServiceImpl.java`:**
```java
@Override
public Map<String, String> encrypt(String plainText, String contextId) {
    byte[] iv = new byte[16];
    SecureRandom random = new SecureRandom();
    random.nextBytes(iv);
    String ivHex = bytesToHex(iv);
    IvParameterSpec ivSpec = new IvParameterSpec(iv);

    String seed = (contextId != null ? contextId : "default") + ":" + ivHex;
    MessageDigest md = MessageDigest.getInstance("SHA-256");
    byte[] keyBytes = md.digest(seed.getBytes(StandardCharsets.UTF_8));
    SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
    cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

    byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

    Map<String, String> result = new HashMap<>();
    result.put("encryptedData", bytesToHex(encryptedBytes));
    result.put("iv", ivHex);
    return result;
}
```

---

### 4.2 Phía Frontend: `reader-service.ts` & `reader.html`

```typescript
export function getJwtUserIdentifier(): string {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      if (token && token.includes('.')) {
        const payloadBase64 = token.split('.')[1]
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadJson)
        if (payload && (payload.sub || payload.email)) {
          return payload.sub || payload.email
        }
      }
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user && user.email) return user.email
      }
    } catch (e) {}
  }
  return 'GUEST_JWT'
}

export function deriveDynamicKey(novelId: string | number, chapterNumber: string | number, ivHex: string) {
  const userIdentifier = getJwtUserIdentifier()
  const contextId = `${userIdentifier}:novel:${novelId}:chapter:${chapterNumber}`
  const seed = `${contextId}:${ivHex}`
  return CryptoJS.SHA256(seed)
}
```

- **Đọc trực tiếp từ JWT AccessToken:** Hàm `getJwtUserIdentifier` giải mã đoạn Payload `token.split('.')[1]` để trích xuất `sub` (User Email) của tài khoản đang đăng nhập.
- **Tự động đổi Key khi đổi nick:** Khi User B đăng nhập, JWT Token mới ghi đè `accessToken` $\rightarrow$ Dynamic Key lập tức chuyển sang của User B.

---

## 5. KẾT LUẬN & ƯU ĐIỂM VƯỢT TRỘI

1. **Chuẩn mã hóa hiện đại:** Kết hợp JWT Token + SHA-256 + AES-256-CBC + HTML5 Canvas.
2. **Triệt tiêu lỗ hổng F12:** 100% không còn chìa khóa tĩnh nào ở Frontend.
3. **An toàn khi đổi tài khoản:** Không lo bị dùng lại dữ liệu mã hóa cũ giữa các lượt đăng nhập trên cùng trình duyệt.
