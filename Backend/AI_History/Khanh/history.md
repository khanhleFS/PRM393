# Nhật Ký Trao Đổi AI & Khanh - Ngày 03/06/2026

Tài liệu này ghi lại toàn bộ nội dung thảo luận, phân tích và đề xuất giải pháp kỹ thuật giữa AI và bạn Khanh trong ngày hôm nay liên quan đến tái cấu trúc Controller, thiết lập JWT + Redis và làm việc với thực thể Cơ sở dữ liệu.

---

## 1. Tải cấu trúc phản hồi của Controller (`ApiResponse`)

### Đề xuất bọc các API trong `ApiResponse`
Tất cả các API khi phản hồi về Client nên được bọc bởi `ApiResponse<T>` để đảm bảo:
* **Tính đồng bộ (Consistency):** Frontend luôn nhận một cấu trúc JSON đồng nhất (`code`, `message`, `result`, `errors`, `timestamp`, `path`).
* **Quản lý lỗi tập trung:** Trả về các mã lỗi HTTP tương ứng kèm thông điệp rõ ràng thay vì các chuỗi String thô.

### Các API cụ thể được phân tích:
1. **Quên & Đặt lại mật khẩu (`/forgot-password`, `/reset-password`):** Rất nên bọc. Mặc dù chỉ là thao tác thông báo, nhưng việc bọc giúp Frontend dễ dàng bắt được kết quả thay vì nhận Plain Text thô.
2. **Thông tin cá nhân (`/profile` - GET & PUT):** Bắt buộc cần bọc. Giúp Frontend lấy trực tiếp DTO từ trường `result` và nhận phản hồi cập nhật thành công dưới dạng JSON chuẩn.
3. **Xác thực OTP đăng ký (`/verify-register-otp`):** Rất nên bọc để trả về trạng thái xác thực rõ ràng.

### Code mẫu bọc `ApiResponse`:
```java
// Endpoint lấy profile
@GetMapping("/profile")
public ResponseEntity<ApiResponse<ProfileDTO>> getProfile(@AuthenticationPrincipal CustomUserDetail userDetail) {
    try {
        if (userDetail == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileDTO>builder()
                    .code(400)
                    .message("Người dùng chưa đăng nhập")
                    .build());
        }
        ProfileDTO profile = authenService.getProfile(userDetail.getUser().getId());
        return ResponseEntity.ok(ApiResponse.<ProfileDTO>builder()
                .code(200)
                .message("Lấy thông tin cá nhân thành công")
                .result(profile)
                .build());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(ApiResponse.<ProfileDTO>builder().code(400).message(e.getMessage()).build());
    }
}
```

### Các lưu ý đặc biệt về DTO mới tạo:
* **`ResetPasswordResponseDTO`:** Có các trường `email`, `message`, `userId`, `redirectUrl`. Khi gọi từ Controller, có thể truyền `null` cho `userId` và `redirectUrl` vì chúng là kiểu Object (`UUID` và `String`). Để code sạch hơn, nên khai báo một **Constructor phụ (Overloaded Constructor)** trong Record:
  ```java
  public record ResetPasswordResponseDTO(String email, String message, UUID userId, String redirectUrl) {
      public ResetPasswordResponseDTO(String email, String message) {
          this(email, message, null, null);
      }
  }
  ```
* **`ForgotPasswordResponseDTO`:** Trường `success` trong DTO này là kiểu dữ liệu nguyên thủy `boolean` (chữ viết thường) nên **không được phép truyền `null`** (sẽ gây lỗi biên dịch). Bạn bắt buộc phải truyền giá trị `true`/`false`.
* **Cấu hình `minutesToExpire` trong `forgotPassword`:** Vì hàm `forgotPassword` hiện tại của bạn sinh mật khẩu mới ngẫu nhiên và lưu đè vĩnh viễn vào DB (không có thời gian hết hạn như OTP), nên truyền `null` cho `minutesToExpire` là chính xác nhất ở thời điểm hiện tại.

---

## 2. Thiết lập Hệ thống Xác thực JWT (Chuyển đổi từ Session sang JWT)

Để chuyển từ cơ chế Session sang JWT tích hợp bộ nhớ đệm Redis, chúng ta sử dụng kiến trúc gồm 7 file chính:

### Vai trò các Class trong sơ đồ bảo mật JWT + Redis:
1. **`JwtProperties.java`**: Đọc các cấu hình JWT từ file `application.properties` (như secret key, thời gian hết hạn Access Token / Refresh Token).
2. **`JwtService.java`**: Cung cấp các hàm tiện ích để tạo token, giải mã lấy thông tin người dùng (claims), kiểm tra tính hợp lệ và thời gian hết hạn còn lại của token.
3. **`UserDetailService.java`**: Lấy thông tin user từ SQL DB dựa trên `email` (tham số nhận vào của Spring Security mặc định tên là `username`, nhưng ta dùng email để truy vấn). Nạp thông tin dưới dạng `CustomUserDetail`.
4. **`JwtAuthenticationFilter.java`**: Bộ lọc chính trích xuất JWT từ Authorization Header (`Bearer <token>`), kiểm tra tính hợp lệ qua `JwtService` và cấu hình đăng nhập tạm thời trong `SecurityContext`.
5. **`TokenBlacklistService.java`**: Tương tác trực tiếp với Redis để lưu các token đã logout (Blacklist) kèm thời gian sống (TTL) bằng thời hạn còn lại của token đó.
6. **`BlackListFilter.java`**: Chạy trước filter xác thực chính nhằm chặn đứng các request chứa token nằm trong Blacklist của Redis, trả về `401 Unauthorized` lập tức.
7. **`RefreshTokenRedis.java`**: Thực thể ánh xạ Key-Value lưu trên Redis đại diện cho Refresh Token để quản lý các phiên đăng nhập dài hạn của người dùng.

### Những thành phần cần chuẩn bị thêm khi dùng Redis:
* **Thư viện Maven:** Thêm `spring-boot-starter-data-redis` trong `pom.xml`.
* **Phần mềm:** Chạy Redis Server (qua Docker hoặc cài đặt trực tiếp trên Windows ở cổng mặc định `6379`).
* **Cấu hình:** Thêm thông tin `spring.data.redis.host=localhost` vào `application.properties`.
* **Repository:** Tạo interface `RefreshTokenRedisRepository extends CrudRepository<RefreshTokenRedis, String>`.

### Trường hợp không muốn dùng Redis:
* Bạn sẽ **loại bỏ** `BlackListFilter`, `TokenBlacklistService` và `RefreshTokenRedis`.
* Hệ thống sẽ chạy JWT Stateless cơ bản (xác thực chữ ký trực tiếp trên RAM rất nhanh, nhưng việc đăng xuất sẽ hoàn toàn dựa vào Frontend tự xóa token đi). Nếu muốn duy trì tính năng Refresh Token mà không có Redis, bạn phải tạo bảng SQL thực tế (`refresh_tokens`) dưới database để lưu trữ, dẫn tới tốc độ truy vấn chậm hơn một chút.

### Cải tiến trong `AuthController` khi dùng JWT:
* Loại bỏ `SecurityContextRepository` (Session repository).
* Trong API `/login`, sau khi xác thực thành công qua `AuthenticationManager`, dùng `jwtService` sinh Access Token và Refresh Token, lưu Refresh Token vào Redis, và trả về cho client qua DTO.
* Thêm API `/logout` để đưa Access Token vào blacklist trên Redis và xóa Refresh Token để hủy phiên.

---

## 3. Tìm hiểu Logic Thực thể Cơ sở dữ liệu (`NovelCategory` & `NovelCategoryId`)

### Tại sao lại dùng 2 lớp này?
Quan hệ giữa `Novel` (Truyện) và `Category` (Thể loại) là quan hệ **Nhiều - Nhiều (Many-to-Many)**. 
* Trong CSDL quan hệ, cách tốt nhất để thể hiện mối quan hệ này là dùng một bảng trung gian tên là `novel_categories`.
* **`NovelCategory.java`**: Entity đại diện cho bảng trung gian này giúp chúng ta dễ dàng tùy chỉnh, thêm bớt các thuộc tính sau này.
* **`NovelCategoryId.java`**: Khóa chính của bảng trung gian này là sự kết hợp của `novel_id` và `category_id` (Composite Primary Key). JPA yêu cầu ta tạo một lớp đại diện riêng có gắn `@Embeddable` và implement `Serializable`.

### Logic xóa Novel hoặc Category:
Do ràng buộc khóa ngoại (Foreign Key Constraints) từ bảng trung gian trỏ về bảng chính, ta không thể xóa trực tiếp Novel hoặc Category khi chúng còn đang liên kết với nhau.
Vì thực thể `Novel.java` và `Category.java` hiện tại **không chứa cấu hình Cascade** trỏ về bảng trung gian, nên ta có 2 phương án thực hiện:
1. **Xóa bằng code (Khuyên dùng):** Trong Service Layer, trước khi xóa thực thể chính, ta phải xóa toàn bộ liên kết của nó trong bảng trung gian trước:
   * Xóa truyện `X`: Gọi `novelCategoryRepository.deleteByNovelId(X)` trước, sau đó gọi `novelRepository.deleteById(X)`.
   * Xóa thể loại `Y`: Gọi `novelCategoryRepository.deleteByCategoryId(Y)` trước, sau đó gọi `categoryRepository.deleteById(Y)`.
2. **Xóa bằng Cascade DB:** Cấu hình khóa ngoại ở database là `ON DELETE CASCADE` để khi xóa bảng chính, hệ quản trị CSDL tự động xóa liên kết ở bảng trung gian.
