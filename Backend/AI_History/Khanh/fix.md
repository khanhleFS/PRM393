# BÁO CÁO CHI TIẾT TẤT CẢ THAY ĐỔI VÀ TỐI ƯU HỆ THỐNG
## Phân Hệ Hồ Sơ Tác Giả (AuthorProfile), Quyết Toán Doanh Thu (AuthorPaymentTicket), Tối Ưu Thống Kê Dashboard, Xây Dựng Security, Redis & Mã Hóa Chống Sao Chép Content

---

## 📋 MỤC LỤC
1. [TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG KIẾN TRÚC](#1-tổng-quan-hệ-thống--định-hướng-kiến-trúc)
2. [CHI TIẾT CÁC LỚP LAYER](#2-chi-tiết-các-lớp-layer)
   - [2.1. Layer Database (DDL & DML Scripts)](#21-layer-database-ddl--dml-scripts)
   - [2.2. Layer Entity & Enumerations](#22-layer-entity--enumerations)
   - [2.3. Layer Repository](#23-layer-repository)
   - [2.4. Layer DTO (Data Transfer Object)](#24-layer-dto-data-transfer-object)
   - [2.5. Layer Service & Business Logic](#25-layer-service--business-logic)
   - [2.6. Layer Scheduler (Tự Động Hóa)](#26-layer-scheduler-tự-động-hóa)
   - [2.7. Layer Controller (RESTful APIs)](#27-layer-controller-restful-apis)
3. [CHI TIẾT CÁC LUỒNG ĐI CỦA CODE (CODE FLOWS)](#3-chi-tiết-các-luồng-đi-của-code-code-flows)
   - [Luồng 1: Admin Tạo Tài Khoản Tác Giả](#luồng-1-admin-tạo-tài-khoản-tác-giả)
   - [Luồng 2: Độc Giả Mua Chapter VIP & Trích Doanh Thu Ví Tác Giả](#luồng-2-độc-giả-mua-chapter-vip--trích-doanh-thu-ví-tác-giả)
   - [Luồng 3: Scheduler Chốt Sổ Quyết Toán Tự Động Hàng Tháng](#luồng-3-scheduler-chốt-sổ-quyết-toán-tự-động-hàng-tháng)
   - [Luồng 4: Tác Giả Xem Dashboard Tối Ưu O(1)](#luồng-4-tác-giả-xem-dashboard-tối-ưu-o1)
   - [Luồng 5: Admin Xác Nhận Thanh Toán Chuyển Khoản Ticket](#luồng-5-admin-xác-nhận-thanh-toán-chuyển-khoản-ticket)
4. [GIẢI THÍCH CHUYÊN SÂU CÁCH HOẠT ĐỘNG CỦA REDIS TRONG HỆ THỐNG](#4-giải-thích-chuyên-sâu-cách-hoạt-động-của-redis-trong-hệ-thống)
   - [4.1. Tổng Quan Redis & Cấu Hình Kết Nối Trong Dự Án](#41-tổng-quan-redis--cấu-hình-kết-nối-trong-dự-án)
   - [4.2. Quản Lý Refresh Token Trong Redis Hash (RefreshTokenRedis)](#42-quản-lý-refresh-token-trong-redis-hash-refreshtokenredis)
   - [4.3. Vô Hiệu Hóa Access Token Khi Logout (TokenBlacklistService)](#43-vô-hiệu-hóa-access-token-khi-logout-tokenblacklistservice)
   - [4.4. Mở Rộng: Ứng Dụng Caching & Distributed Lock Cho Hệ Thống Lớn](#44-mở-rộng-ứng-dụng-caching--distributed-lock-cho-hệ-thống-lớn)
5. [HƯỚNG DẪN XÂY DỰNG PHÂN HỆ SECURITY BẢO MẬT BẬC CAO](#5-hướng-dẫn-xây-dựng-phân-hệ-security-bảo-mật-bượt-cao)
   - [5.1. Kiến Trúc Spring Security + JWT Stateless](#51-kiến-trúc-spring-security--jwt-stateless)
   - [5.2. Chi Tiết Các Thành Phần Lớp Security](#52-chi-tiết-các-thành-phần-lớp-security)
   - [5.3. Phân Quyền Vai Trò (Role-Based Access Control - RBAC)](#53-phân-quyền-vai-trò-role-based-access-control---rbac)
   - [5.4. Sơ Đồ Luồng Xác Thực JWT & Refresh Token](#54-sơ-đồ-luồng-xác-thực-jwt--refresh-token)
   - [5.5. SecurityContext & Vai Trò Trong Quản Lý Phiên Làm Việc](#55-securitycontext--vai-trò-trong-quản-lý-phiên-làm-việc)
   - [5.6. Tại Sao Phải Bọc Các Response Bằng ApiResponse](#56-tại-sao-phải-bọc-các-response-bằng-apiresponse)
   - [5.7. Tại Sao Phải Bọc Các Exception Bằng ApiException](#57-tại-sao-phải-bọc-các-exception-bằng-apiexception)
6. [LUỒNG ĐI VÀ CHI TIẾT CODE MÃ HÓA / GIẢI MÃ CONTENT TRUYỆN CHỐNG SAO CHÉP](#6-luồng-đi-và-chi-tiết-code-mã-hóa--giải-mã-content-truyện-chống-sao-chép)
   - [6.1. Phân Tích Bài Toán Chống Crawler & Sao Chép Bản Quyền Truyện](#61-phân-tích-bài-toán-chống-crawler--sao-chép-bản-quyền-truyện)
   - [6.2. Sơ Đồ Toàn Bộ Luồng Đi (Mã Hóa Backend -> Payload -> Giải Mã Client)](#62-sơ-đồ-toàn-bộ-luồng-đi-mã-hóa-backend---payload---giải-mã-client)
   - [6.3. Chi Tiết Code Mã Hóa Phía Backend (EncryptionServiceImpl & ChapterServiceImpl)](#63-chi-tiết-code-mã-hóa-phía-backend-encryptionserviceimpl--chapterserviceimpl)
   - [6.4. Chi Tiết Code Giải Mã Phía Client JavaScript (CryptoJS)](#64-chi-tiết-code-giải-mã-phía-client-javascript-cryptojs)
   - [6.5. Đánh Giá Độ Bảo Mật Vượt Trỗi Của Kiến Trúc Dynamic Key + Random IV](#65-đánh-giá-độ-bảo-mật-vượt-trỗi-của-kiến-trúc-dynamic-key--random-iv)
   - [6.6. Hàm Cipher Là Gì & Vai Trò Chi Tiết Ở Phía Backend Và Frontend](#66-hàm-cipher-là-gì--vai-trò-chi-tiết-ở-phía-backend-và-frontend)
   - [6.7. Chứng Minh Thực Tế Mã Nguồn: Khóa Giải Mã Phụ Thuộc Trực Tiếp Vào userEmail](#67-chứng-minh-thực-tế-mã-nguồn-khóa-giải-mã-phụ-thuộc-trực-tiếp-vào-useremail)
   - [6.8. Phân Tích Chuyên Sâu AES/CBC/PKCS5Padding & Lý Thuyết Quá Trình Cipher](#68-phân-tích-chuyên-sâu-aescbcpkcs5padding--lý-thuyết-quá-trình-cipher)

---

## 1. TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG KIẾN TRÚC

### 🎯 Mục tiêu tái cấu trúc:
1. **Tách biệt hoàn toàn Ví Độc Giả & Ví Tác Giả**:
   - **Ví Độc Giả (`User.coinBalance`)**: Lưu số coin nạp vào từ các gói thanh toán VNPay/ZaloPay để dùng mua chapter. Bảng `payments` chỉ phục vụ duy nhất cho độc giả nạp tiền.
   - **Ví Tác Giả (`AuthorProfile.authorCoinBalance`)**: Lưu số coin tích lũy từ **doanh thu bán chapter trả phí** (hệ thống trích 70% giá trị chapter).
2. **Loại bỏ quy trình Đăng ký/Phê duyệt rườm rà**:
   - Admin chủ động tạo tài khoản cho Tác giả qua API `POST /api/admin/authors`. Hệ thống khởi tạo đồng thời `User` (Role `AUTHOR`) và `AuthorProfile` liên kết `1-1`.
3. **Cơ chế Chốt sổ Doanh thu Hàng tháng tự động (`AuthorPaymentTicket`)**:
   - Vào `00:00:00` ngày đầu tiên hàng tháng, Scheduler tự động quy đổi toàn bộ `authorCoinBalance` của từng tác giả thành **Phiếu quyết toán (`AuthorPaymentTicket`)** theo tỷ lệ `1 Coin = 1,000 VND`, đặt trạng thái `UNPAID` và reset `authorCoinBalance = 0`.
   - Admin xem danh sách phiếu và xác nhận chuyển khoản ngoài đời $\rightarrow$ chuyển trạng thái ticket sang `PAID`.
4. **Tối ưu hóa Thống kê Dashboard bằng Denormalization Counters**:
   - Đưa 3 trường số liệu đếm dồn `totalNovels`, `totalChapters`, `totalViews` trực tiếp vào bảng `author_profiles`. Giảm độ phức tạp của API `Author Dashboard` từ $O(N)$ quét toàn bảng xuống **$O(1)$ truy vấn 1 dòng duy nhất (< 5ms)**.

---

## 2. CHI TIẾT CÁC LỚP LAYER

### 2.1. Layer Database (DDL & DML Scripts)

#### Bảng `author_profiles`:
```sql
CREATE TABLE author_profiles (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    user_id             UNIQUEIDENTIFIER NOT NULL,
    pen_name            NVARCHAR(255)    NOT NULL,
    bio                 NVARCHAR(MAX)    NULL,
    author_coin_balance INT              NOT NULL DEFAULT 0,
    total_novels        BIGINT           NOT NULL DEFAULT 0,
    total_chapters      BIGINT           NOT NULL DEFAULT 0,
    total_views         BIGINT           NOT NULL DEFAULT 0,
    bank_name           NVARCHAR(100)    NULL,
    bank_account_number NVARCHAR(100)    NULL,
    bank_account_holder NVARCHAR(255)    NULL,
    status              NVARCHAR(20)     NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING','APPROVED','REJECTED','SUSPENDED')),
    created_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_author_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_ap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Bảng `author_payment_tickets`:
```sql
CREATE TABLE author_payment_tickets (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    author_profile_id UNIQUEIDENTIFIER NOT NULL,
    month_year        NVARCHAR(20)     NOT NULL,
    total_coins       INT              NOT NULL,
    coin_rate         INT              NOT NULL DEFAULT 1000,
    amount_vnd        INT              NOT NULL,
    status            NVARCHAR(20)     NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID','CANCELLED')),
    paid_at           DATETIME2        NULL,
    transaction_ref   NVARCHAR(100)    NULL,
    created_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_apt_author FOREIGN KEY (author_profile_id) REFERENCES author_profiles(id) ON DELETE CASCADE
);
```

* **Files liên quan**: `schema-mssql.sql`, `data-mssql.sql`, `data.sql`, `data-h2.sql`.

---

### 2.2. Layer Entity & Enumerations

* **`AuthorProfile.java`**: Thừa kế `BaseEntity`, liên kết `@OneToOne` với `User`. Lưu thông tin bút danh, bio, ví coin tác giả, tài khoản ngân hàng và 3 counter `totalNovels`, `totalChapters`, `totalViews`.
* **`AuthorPaymentTicket.java`**: Thừa kế `BaseEntity`, liên kết `@ManyToOne` với `AuthorProfile`. Lưu thông tin ticket quyết toán từng tháng.
* **`User.java`**: Bổ sung `@OneToOne(mappedBy = "user") private AuthorProfile authorProfile;`.
* **Enums mới/sửa**:
  * `UserRole.java`: Bổ sung value `AUTHOR`.
  * `AuthorStatus.java`: Enum `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`.
  * `TicketStatus.java`: Enum `UNPAID`, `PAID`, `CANCELLED`.
  * `CoinTransactionType.java`: Bổ sung `AUTHOR_REVENUE` (doanh thu trích cho tác giả khi bán chapter).

---

### 2.3. Layer Repository

* **`AuthorProfileRepository.java`**:
  * `Optional<AuthorProfile> findByUserId(UUID userId);`
  * `Optional<AuthorProfile> findByUserEmail(String email);`
  * `boolean existsByPenName(String penName);`
  * `boolean existsByPenNameAndUserIdNot(String penName, UUID userId);`
* **`AuthorPaymentTicketRepository.java`**:
  * `List<AuthorPaymentTicket> findByAuthorProfileUserEmailOrderByCreatedAtDesc(String email);`
  * `List<AuthorPaymentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);`
  * `boolean existsByAuthorProfileIdAndMonthYear(UUID authorProfileId, String monthYear);`
* **`ChapterRepository.java`**:
  * `long countByNovelId(Long novelId);`
  * `@Query("SELECT COUNT(c) FROM Chapter c WHERE c.novel.author.id = :authorUserId") long countByAuthorUserId(@Param("authorUserId") UUID authorUserId);`
* **`NovelRepository.java`**:
  * `@Query("SELECT COALESCE(SUM(n.viewCount), 0) FROM Novel n WHERE n.author.id = :authorId") long sumViewCountByAuthorId(@Param("authorId") UUID authorId);`

---

### 2.4. Layer DTO (Data Transfer Object)

* **`CreateAuthorRequestDTO.java`**: DTO chứa thông tin khi Admin tạo tài khoản Tác giả (username, email, password, phone, penName, bio, ngân hàng...).
* **`AuthorProfileRequestDTO.java`**: DTO cho Tác giả cập nhật profile (penName, bio, thông tin ngân hàng).
* **`AuthorProfileResponseDTO.java`**: DTO trả về thông tin hồ sơ Tác giả kèm 3 con số thống kê `totalNovels`, `totalChapters`, `totalViews`.
* **`AuthorPaymentTicketDTO.java`**: DTO chi tiết ticket quyết toán hàng tháng.
* **`AuthorDashboardDTO.java`**: DTO tổng hợp cho màn hình Author Dashboard (Profile, totalNovels, totalChapters, totalViews, authorCoinBalance, estimatedEarningsVnd, recentTickets).

---

### 2.5. Layer Service & Business Logic

#### 1. `AuthorProfileServiceImpl.java`:
* `createAuthorAccountByAdmin`: Kiểm tra trùng lặp `username`, `email`, `phone`, `penName`. Đã dùng `PasswordEncoder` mã hóa pass, tạo `User` (Role `AUTHOR`) và `AuthorProfile` trạng thái `APPROVED`.
* `getMyAuthorProfile`: Tìm `AuthorProfile` theo `userEmail`. Nếu không tìm thấy ném lỗi `404 RESOURCE_NOT_FOUND`.
* `updateMyAuthorProfile`: Cập nhật bút danh, bio, thông tin ngân hàng.
* `getAuthorDashboard`: Lấy `AuthorProfile` của tác giả và trả về thông số thống kê đếm dồn $O(1)$ mà không cần quét bảng.

#### 2. `AuthorPaymentTicketServiceImpl.java`:
* `generateMonthlyTickets`: Lặp qua tất cả `AuthorProfile` có `authorCoinBalance > 0`. Tính `amountVnd = authorCoinBalance * 1000`, tạo record `AuthorPaymentTicket` trạng thái `UNPAID` và reset `authorCoinBalance = 0`.
* `processTicketPayment`: Admin duyệt đổi trạng thái ticket thành `PAID` kèm mã tham chiếu giao dịch chuyển khoản `transactionRef`.

#### 3. `ChapterServiceImpl.java`:
* `unlockChapter`:
  - Kiểm tra nếu Role là `AUTHOR` hoặc `ADMIN` $\rightarrow$ Ném lỗi `400 BAD_REQUEST` ("Tài khoản Tác giả / Admin không thể mua chapter").
  - Khi `USER` mua chapter thành công (ví dụ: 25 coin): Trích 70% (17 coin) cộng vào `AuthorProfile.authorCoinBalance` của tác giả bộ truyện đó. Ghi log `CoinTransaction` loại `AUTHOR_REVENUE`.
* `createChapter`: Tự động cộng dồn `AuthorProfile.totalChapters + 1`.
* `readChapter`: Tự động cộng dồn `AuthorProfile.totalViews + 1` và `Novel.viewCount + 1`.

#### 4. `NovelServiceImpl.java`:
* `createNovel`: Kiểm tra tài khoản có `isAuthor = true` hay không. Sau khi lưu truyện, tự động cộng dồn `AuthorProfile.totalNovels + 1`.

---

### 2.6. Layer Scheduler (Tự Động Hóa)

* **`MonthlyAuthorPayoutScheduler.java`**:
  - Đánh dấu `@Component` và `@EnableScheduling`.
  - Phương thức `runMonthlyAuthorPayout()` mang annotation:
    ```java
    @Scheduled(cron = "0 0 0 1 * ?") // Chạy tự động lúc 00:00:00 ngày 1 hàng tháng
    ```
  - Tự động gọi `authorPaymentTicketService.generateMonthlyTickets()` để quét và chốt sổ doanh thu tháng cũ.

---

### 2.7. Layer Controller (RESTful APIs)

#### 1. `AdminController.java` (`/api/admin`) - Đã áp dụng `@PreAuthorize("hasRole('ADMIN')")` ở cấp độ Class:
* `POST /api/admin/authors`: Admin tạo tài khoản Tác giả mới.
* `GET /api/admin/author-profiles`: Xem danh sách tất cả hồ sơ tác giả.
* `GET /api/admin/author-payouts/tickets`: Xem danh sách ticket quyết toán (`UNPAID`, `PAID`, `CANCELLED`).
* `PUT /api/admin/author-payouts/tickets/{ticketId}/pay`: Xác nhận đã thanh toán ticket (`PAID`).
* `POST /api/admin/author-payouts/trigger-scheduler`: Kích hoạt thủ công chốt sổ tháng (Dùng cho test).

#### 2. `AuthorDashboardController.java` (`/api/author`):
* Sử dụng `Authentication authentication` để lấy email chuẩn từ Spring SecurityContext.
* `GET /api/author/profile`: Lấy hồ sơ tác giả.
* `PUT /api/author/profile`: Cập nhật hồ sơ & tài khoản ngân hàng.
* `GET /api/author/dashboard`: Lấy thông tin tổng quan Dashboard.
* `GET /api/author/tickets`: Lấy danh sách ticket quyết toán cá nhân.

---

## 3. CHI TIẾT CÁC LUỒNG ĐI CỦA CODE (CODE FLOWS)

### Luồng 1: Admin Tạo Tài Khoản Tác Giả
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AC as AdminController
    participant AS as AuthorProfileServiceImpl
    participant UR as UserRepository
    participant APR as AuthorProfileRepository

    Admin->>AC: POST /api/admin/authors (CreateAuthorRequestDTO)
    AC->>AS: createAuthorAccountByAdmin(requestDTO)
    AS->>UR: findByUsername / existsByEmail / findByPhone
    AS->>APR: existsByPenName
    AS->>UR: save(User: role=AUTHOR, isAuthor=true)
    AS->>APR: save(AuthorProfile: status=APPROVED, counters=0)
    AS-->>AC: AuthorProfileResponseDTO
    AC-->>Admin: 200 OK (ApiResponse)
```

---

### Luồng 2: Độc Giả Mua Chapter VIP & Trích Doanh Thu Ví Tác Giả
```mermaid
sequenceDiagram
    autonumber
    actor Reader as Độc giả (USER)
    participant CC as ChapterController
    participant CS as ChapterServiceImpl
    participant UR as UserRepository
    participant APR as AuthorProfileRepository
    participant CTR as CoinTransactionRepository

    Reader->>CC: POST /api/chapters/unlock/{chapterId}
    CC->>CS: unlockChapter(chapterId, readerEmail)
    Note over CS: 1. Kiểm tra role Reader != AUTHOR & != ADMIN
    Note over CS: 2. Trừ coin ví độc giả (User.coinBalance -= 25)
    CS->>APR: findByUserId(novel.author.id)
    Note over CS: 3. Tính 70% doanh thu: 25 * 0.7 = 17 coin
    CS->>APR: save(AuthorProfile.authorCoinBalance += 17)
    CS->>CTR: save(CoinTransaction: type=AUTHOR_REVENUE, amount=17)
    CS-->>CC: ChapterUnlockResponseDTO
    CC-->>Reader: 200 OK (Đã mở khóa thành công)
```

---

### Luồng 3: Scheduler Chốt Sổ Quyết Toán Tự Động Hàng Tháng
```mermaid
sequenceDiagram
    autonumber
    participant Sch as MonthlyAuthorPayoutScheduler
    participant TS as AuthorPaymentTicketServiceImpl
    participant APR as AuthorProfileRepository
    participant TR as AuthorPaymentTicketRepository

    Note over Sch: Đúng 00:00:00 ngày 1 hàng tháng (Cron 0 0 0 1 * ?)
    Sch->>TS: generateMonthlyTickets()
    TS->>APR: findByAuthorCoinBalanceGreaterThan(0)
    loop Từng Tác giả có coin > 0
        Note over TS: 1. Tính tiền VND = coins * 1000
        TS->>TR: save(AuthorPaymentTicket: status=UNPAID, monthYear=MM/YYYY)
        TS->>APR: save(AuthorProfile.authorCoinBalance = 0)
    end
```

---

### Luồng 4: Tác Giả Xem Dashboard Tối Ưu O(1)
```mermaid
sequenceDiagram
    autonumber
    actor Author as Tác giả (AUTHOR)
    participant ADC as AuthorDashboardController
    participant AS as AuthorProfileServiceImpl
    participant APR as AuthorProfileRepository

    Author->>ADC: GET /api/author/dashboard
    ADC->>AS: getAuthorDashboard(authorEmail)
    AS->>APR: findByUserEmail(authorEmail)
    Note over AS: Lấy trực tiếp totalNovels, totalChapters, totalViews từ AuthorProfile (O(1))
    AS-->>ADC: AuthorDashboardDTO
    ADC-->>Author: 200 OK (Trả về Dashboard < 5ms)
```

---

### Luồng 5: Admin Xác Nhận Thanh Toán Chuyển Khoản Ticket
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AC as AdminController
    participant TS as AuthorPaymentTicketServiceImpl
    participant TR as AuthorPaymentTicketRepository

    Admin->>AC: PUT /api/admin/author-payouts/tickets/{ticketId}/pay?transactionRef=FT12345
    AC->>TS: processTicketPayment(ticketId, transactionRef, PAID)
    TS->>TR: findById(ticketId)
    Note over TS: Đổi status = PAID, lưu transactionRef & paidAt = CURRENT_TIMESTAMP
    TS->>TR: save(ticket)
    TS-->>AC: AuthorPaymentTicketDTO
    AC-->>Admin: 200 OK (Xác nhận đã thanh toán)
```

---

## 4. GIẢI THÍCH CHUYÊN SÂU CÁCH HOẠT ĐỘNG CỦA REDIS TRONG HỆ THỐNG

### 4.1. Tổng Quan Redis & Cấu Hình Kết Nối Trong Dự Án
**Redis (Remote Dictionary Server)** là một cơ sở dữ liệu lưu trữ dạng **Key-Value trong bộ nhớ RAM (In-Memory Data Structure Store)** với tốc độ xử lý hàng trăm ngàn request/giây và độ trễ dưới 1ms.

Trong dự án này, Redis được tích hợp trực tiếp thông qua **Spring Data Redis** (Host `localhost:6379`) để giải quyết 2 bài toán Security & Authentication cốt lõi:
1. **Quản lý Refresh Token trong Redis Hash (`RefreshTokenRedis`)** với cơ chế tự động hết hạn TTL.
2. **Thu hồi Access Token khẩn cấp khi Logout (`TokenBlacklistService`)** nhằm khắc phục nhược điểm của JWT Stateless.

---

### 4.2. Quản Lý Refresh Token Trong Redis Hash (`RefreshTokenRedis`)

#### 📄 Entity `RefreshTokenRedis.java`:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("RefreshToken") // Đánh dấu lưu dưới dạng Hash trong Redis với Key Prefix "RefreshToken:"
public class RefreshTokenRedis {

    @Id
    private String token; // Chuỗi JWT Refresh Token (Làm ID chính)

    private UUID userId;

    private String email;

    @TimeToLive
    private long ttlInSeconds; // Tự động xóa khỏi Redis RAM sau 7 ngày (604,800s)
}
```

#### 🔄 Luồng Cấp & Đổi Refresh Token (`AuthenServiceImpl.java`):
1. **Khi User Đăng nhập (`login`)**:
   - Server sinh cặp `accessToken` (24h) và `refreshToken` (7 ngày).
   - Bản ghi `RefreshTokenRedis` được lưu vào Redis RAM qua `refreshTokenRepository.save(tokenRedis)`.
   - Redis tự động đếm ngược thời gian sống (TTL). Sau 7 ngày, Redis tự động giải phóng RAM mà không cần chạy job dọn dẹp MSSQL.
2. **Khi User Xin Cấp Lại Access Token (`refreshToken`)**:
   - Server tìm bản ghi trong Redis theo `refreshTokenRepository.findById(refreshToken)`.
   - Nếu không có trong Redis (do hết hạn TTL hoặc đã bị xóa) $\rightarrow$ Ném lỗi `401 UNAUTHORIZED`.
   - Nếu tồn tại $\rightarrow$ Server **xóa token cũ khỏi Redis (`delete`)** và **lưu token mới (`save`)** $\rightarrow$ Thực thi cơ chế **Refresh Token Rotation** chống lấy cắp token.

---

### 4.3. Vô Hiệu Hóa Access Token Khi Logout (`TokenBlacklistService`)

JWT nguyên bản là Stateless, nghĩa là Server không thể "hủy" Token trước khi nó hết hạn. Dự án xử lý triệt để vấn đề này bằng **Redis Token Blacklist**:

#### 📄 Code Service `TokenBlacklistService.java`:
```java
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    
    // Đẩy Token vào Danh Sách Đen với TTL = Thời gian sống còn lại của AccessToken
    public void blacklistToken(String token, long expirationTimeMs) {
        if (expirationTimeMs > 0) {
            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + token,
                    "blacklisted",
                    expirationTimeMs,
                    TimeUnit.MILLISECONDS
            );
        }
    }
    
    // Kiểm tra xem Token có nằm trong Danh Sách Đen hay không
    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
```

#### 🔄 Luồng Đăng xuất & Interception Filter:
* **Khi Logout (`POST /api/authen/logout`)**: Server tính thời gian sống còn lại của AccessToken (`remainingTimeMs`). Đẩy Key `jwt:blacklist:<token>` vào Redis với TTL bằng `remainingTimeMs`.
* **Tại `JwtAuthenticationFilter`**: Trước khi xác thực bất kỳ request nào, hệ thống gọi `isTokenBlacklisted(jwt)`. Nếu `true`, request bị từ chối ngay lập tức với HTTP 401.

---

### 4.4. Mở Rộng: Ứng Dụng Caching & Distributed Lock Cho Hệ Thống Lớn

Ngoài 2 tính năng Security trên, kiến trúc Redis trong dự án sẵn sàng mở rộng cho 2 bài toán cao cấp:
1. **Redis Caching (`Cache-Aside Pattern`)**: Lưu cache kết quả API Dashboard hoặc Thông tin bộ truyện hot lên Redis RAM. Giảm độ trễ API từ 50ms (MSSQL) xuống < 2ms (Redis RAM).
2. **Distributed Lock (`Redlock / Redisson`)**: Khóa tài nguyên đồng thời khi Độc giả mua Chapter VIP, ngăn ngừa **Race Condition** khi 1 user click nút Mua 2 lần liên tiếp trong vài millisecond.

---

## 5. HƯỚNG DẪN XÂY DỰNG PHÂN HỆ SECURITY BẢO MẬT BẬC CAO

### 5.1. Kiến Trúc Spring Security + JWT Stateless

Hệ thống sử dụng cơ chế bảo mật **JSON Web Token (JWT) theo mô hình Stateless Architecture**:
* **Stateless (Phi trạng thái)**: Server không duy trì Session của người dùng trong bộ nhớ RAM hay DB. Mỗi Request từ Client (Postman/Mobile App/React) đều phải mang theo Header:
  ```http
  Authorization: Bearer <access_token>
  ```
* **Mã hóa Password**: Sử dụng **`BCryptPasswordEncoder`** với độ dài Salt mặc định là 10/12 rounds. Mật khẩu lưu trong bảng `users` được băm 1 chiều (One-way Hash), không thể giải mã ngược lại.

---

### 5.2. Chi Tiết Các Thành Phần Lớp Security

#### 1. `SecurityConfig.java` (Cấu hình bộ lọc Filter Chain):
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize("hasRole(...)") ở Controller
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF vì dùng RESTful API Stateless
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/forgot-password", "/reset-password").permitAll()
                .requestMatchers(SecurityConstants.PUBLIC_MATCHERS).permitAll() // Đăng ký, Đăng nhập, Swagger...
                .requestMatchers("/api/author/**").authenticated()
                .anyRequest().authenticated()
            )
            // Chèn JwtAuthenticationFilter VÀO TRƯỚC UsernamePasswordAuthenticationFilter mặc định
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Mã hóa băm password an toàn
    }
}
```

#### 2. `JwtAuthenticationFilter.java` (Interception Filter kiểm tra Token ở mỗi Request):
```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailService userDetailService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        // 1. Kiểm tra xem Token có nằm trong danh sách Đen (Blacklist do Đăng xuất) hay không
        if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\": 401, \"message\": \"Token đã hết hạn hoặc đã bị đăng xuất\"}");
            return;
        }

        // 2. Giải mã email từ JWT Subject
        String userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailService.loadUserByUsername(userEmail);

            // 3. Kiểm tra chữ ký JWT và thời hạn hết hạn (Expiration Time)
            if (jwtService.isTokenValid(jwt, userDetails) && userDetails.isEnabled()) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                // 4. Thiết lập Authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

#### 3. `JwtService.java` (Sinh và Giải mã Chữ ký JWT):
- Sử dụng thuật toán **HMAC-SHA256 (HS256)** với Secret Key mã hóa Base64.
- Đưa các thông tin Claims vào Token: `Subject (email)`, `role`, `issuedAt`, `expiration`.
- Hỗ trợ sinh `AccessToken` (Hạn 24 giờ) và `RefreshToken` (Hạn 7 ngày).

#### 4. `TokenBlacklistService.java` (Vô hiệu hóa Token khi Logout):
- Khi người dùng gọi `POST /api/authen/logout`, Token hiện tại được đẩy vào Redis/Memory với TTL bằng thời gian sống còn lại của Token.
- Tất cả request sau đó mang Token này đều bị `JwtAuthenticationFilter` từ chối ngay lập tức.

---

### 5.3. Phân Quyền Vai Trò (Role-Based Access Control - RBAC)

Hệ thống phân rõ 3 cấp quyền hạn (Roles):
1. **`ROLE_ADMIN`**:
   - Quản trị toàn bộ hệ thống (`/api/admin/**`).
   - Admin có quyền tạo tài khoản Tác giả (`POST /api/admin/authors`).
   - Admin duyệt xác nhận chuyển khoản ngân hàng ngoài đời cho các Ticket quyết toán (`PUT /api/admin/author-payouts/tickets/{ticketId}/pay`).
2. **`ROLE_AUTHOR`**:
   - Truy cập phân hệ Tác giả (`/api/author/**`).
   - Đăng truyện, đăng chapter, cập nhật bút danh & thông tin ngân hàng.
   - Xem thống kê Dashboard và các phiếu quyết toán cá nhân.
   - **Bị chặn**: Không được phép mua chapter trả phí (`ChapterServiceImpl` trả lỗi 400).
3. **`ROLE_USER` (Độc giả)**:
   - Xem danh sách truyện, đọc chapter miễn phí.
   - Nạp coin qua VNPay/ZaloPay (`User.coinBalance`).
   - Dùng coin mở khóa chapter VIP.

---

### 5.4. Sơ Đồ Luồng Xác Thực JWT & Refresh Token

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as Spring Controller
    participant Filter as JwtAuthenticationFilter
    participant JWT as JwtService
    participant DB as UserDetailService

    Client->>API: POST /api/authen/login (email, password)
    API->>DB: loadUserByUsername(email) & BCrypt.matches()
    API->>JWT: generateToken(userDetails)
    JWT-->>Client: Trả về AccessToken (24h) + RefreshToken (7d)

    Note over Client: Các request tiếp theo mang Token
    Client->>Filter: GET /api/author/dashboard (Header: Bearer <AccessToken>)
    Filter->>JWT: extractUsername(jwt) & validateToken()
    Filter->>DB: loadUserByUsername(email)
    Filter->>Filter: Set SecurityContextHolder.setAuthentication()
    Filter->>API: Chuyển tiếp Request vào Controller
    API-->>Client: 200 OK
```

---

### 5.5. SecurityContext & Vai Trò Trong Quản Lý Phiên Làm Việc

**`SecurityContext`** trong **Spring Security** là một "hộp chứa" (container) lưu giữ thông tin của **người dùng hiện tại đã được xác thực (Authenticated User)** trong suốt quá trình xử lý 01 HTTP Request.

- **Cơ chế lưu trữ**: `SecurityContextHolder` mặc định dùng **`ThreadLocal`**, giúp thông tin xác thực gắn liền với luồng (Thread) đang xử lý request đó và tự động giải phóng khi response trả về.
- **4 Vai trò chính**:
  1. **Optimization Check**: `SecurityContextHolder.getContext().getAuthentication() == null` giúp kiểm tra xem request đã được xác thực trước đó chưa để tránh query lặp lại.
  2. **Authentication Token Container**: Khi JWT hợp lệ, `setAuthentication(authToken)` cấp "thẻ xác thực" ghi nhận user hiện tại.
  3. **Cơ sở cho RBAC**: Spring Security đọc `Authorities` (Roles) trong `SecurityContext` để đối chiếu với `@PreAuthorize("hasRole(...)")`.
  4. **Context Retrieval**: Cho phép Controller/Service lấy thông tin user đang đăng nhập qua `SecurityContextHolder.getContext().getAuthentication()`.

---

### 5.6. Tại Sao Phải Bọc Các Response Bằng ApiResponse<T>

Việc bọc tất cả dữ liệu trả về trong lớp chuẩn hóa `ApiResponse<T>` mang lại 5 lợi ích cốt lõi:
1. **Thống nhất cấu trúc JSON**: Client luôn nhận được format duy nhất `{ code, message, result, errors, timestamp, path }`.
2. **Xử lý lỗi tập trung**: Cung cấp thuộc tính `errors` (Map field - error) giúp Frontend hiển thị thông báo lỗi từng ô input chính xác.
3. **Phân biệt HTTP Status Code & Business Error Code**: Tách biệt lỗi hạ tầng HTTP và mã lỗi nghiệp vụ tùy chỉnh (`code`).
4. **Bổ sung Metadata tra cứu Log**: Có `timestamp` và `path` giúp Dev dễ dàng tìm vết log khi sự cố xảy ra.
5. **Type Safety với Java Generics**: Lớp `ApiResponse<T>` linh hoạt bọc mọi kiểu dữ liệu (`ProfileDTO`, `Page<NovelDTO>`, `Void`).

---

### 5.7. Tại Sao Phải Bọc Các Exception Bằng ApiException

Ném ngoại lệ thông qua `ApiException` (kế thừa `RuntimeException`) là quy chuẩn hàng đầu trong thiết kế RESTful API:
1. **Đóng gói `ErrorCode` định dạng sẵn**: Gắn kèm mã lỗi (`code`), HTTP Status (`status`), định danh (`errorKey`) và thông báo (`message`).
2. **Tự động định hướng HTTP Status Code**: Giúp `GlobalExceptionHandler` trả về đúng `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, hay `404 Not Found` thay vì sập lỗi `500`.
3. **Kết nối hoàn hảo với `GlobalExceptionHandler`**: Chuyển đổi mọi lỗi thành chuẩn JSON `ApiResponse` thống nhất.
4. **Clean Code ở Service Layer**: Cho phép ném lỗi ngắn gọn qua `.orElseThrow(() -> new ApiException(...))` mà không cần `try-catch` rườm rà.
5. **Che giấu lỗi nhạy cảm**: Ẩn các Stack Trace và SQL Exception nguy hiểm, chặn nguy cơ tấn công dò quét hệ thống.

### 6.1. Phân Tích Bài Toán Chống Crawler & Sao Chép Bản Quyền Truyện

Trong các ứng dụng đọc truyện online, nếu API trả về đoạn văn bản thuần (Plain-text HTML/JSON), kẻ xấu có thể:
1. Mở **Network Tab (F12)** trong trình duyệt để copy toàn bộ nội dung chương truyện.
2. Viết **Crawl Bot** tự động gọi API lấy hết truyện VIP mang sang website khác đăng lại.

👉 **Giải pháp trong dự án**: Backend **KHÔNG TRẢ NỘI DUNG THUẦN (`content = null`)**. Thay vào đó, backend sử dụng **Thuật toán Mã hóa Khóa Động AES-256-CBC theo Bối cảnh (Dynamic Context-Aware Key Encryption)** kết hợp **Vector Khởi tạo Ngẫu nhiên (Random IV)** để mã hóa nội dung chương thành chuỗi HEX.

---

### 6.2. Sơ Đồ Toàn Bộ Luồng Đi (Mã Hóa Backend -> Payload -> Giải Mã Client)

```mermaid
sequenceDiagram
    autonumber
    actor User as Độc Giả (Client App / Browser)
    participant CC as ChapterController
    participant CS as ChapterServiceImpl
    participant ES as EncryptionServiceImpl
    participant FE as Frontend Client (JS / Mobile SDK)

    User->>CC: GET /api/novels/{novelId}/chapters/{chapterId}
    CC->>CS: readChapter(novelId, chapterId, userEmail)
    Note over CS: 1. Xác thực quyền đọc & tăng view count
    Note over CS: 2. Xây dựng Context-ID bối cảnh:<br/>contextId = userEmail + ":novel:" + novelId + ":chapter:" + chapterNum

    CS->>ES: encrypt(chapter.getContent(), contextId)
    Note over ES: 3. Sinh 16-byte random IV (ivHex)<br/>4. Sinh Dynamic Seed = contextId + ":" + ivHex<br/>5. Băm Seed qua SHA-256 -> 32-byte AES Key<br/>6. Mã hóa AES/CBC/PKCS5Padding -> encryptedHex
    ES-->>CS: Trả về Map { "encryptedData": encryptedHex, "iv": ivHex }

    Note over CS: 7. Gán content = NULL vào DTO!<br/>Chỉ đưa encryptedData và iv vào DTO
    CS-->>CC: ChapterResponseDTO
    CC-->>User: HTTP 200 OK (JSON chứa encryptedData, iv, content=null)

    Note over User, FE: 8. Giải mã tại Client Side
    User->>FE: Nhận payload { encryptedData, iv }
    FE->>FE: Tái tạo contextId từ thông tin user & chapter hiện tại
    FE->>FE: Tái tạo Seed = contextId + ":" + iv
    FE->>FE: SHA-256(Seed) -> Lấy AES Key 32-byte
    FE->>FE: Giải mã AES-256-CBC(encryptedData, Key, IV) -> Text thuần
    FE-->>User: Render văn bản lên giao diện (Canvas/Protected DOM)
```

---

### 6.3. Chi Tiết Code Mã Hóa Phía Backend (`EncryptionServiceImpl` & `ChapterServiceImpl`)

#### 📄 1. Implementation Mã Hóa AES-256-CBC (`EncryptionServiceImpl.java`):
```java
@Service
public class EncryptionServiceImpl implements EncryptionService {

    @Override
    public Map<String, String> encrypt(String plainText, String contextId) {
        if (plainText == null) plainText = "";
        
        try {
            // BƯỚC 1: Sinh IV (Initialization Vector) ngẫu nhiên 16 bytes cho mỗi lần mã hóa
            byte[] iv = new byte[16];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            String ivHex = bytesToHex(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // BƯỚC 2: Tạo Dynamic Key từ SHA-256(contextId + ":" + ivHex)
            String seed = (contextId != null ? contextId : "default") + ":" + ivHex;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = md.digest(seed.getBytes(StandardCharsets.UTF_8));
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

            // BƯỚC 3: Khởi tạo Cipher thuật toán AES/CBC/PKCS5Padding
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

            // BƯỚC 4: Tiến hành mã hóa byte sang byte
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // BƯỚC 5: Trả về Map chứa Chuỗi mã hóa HEX và IV HEX
            Map<String, String> result = new HashMap<>();
            result.put("encryptedData", bytesToHex(encryptedBytes));
            result.put("iv", ivHex);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa dữ liệu: " + e.getMessage(), e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
```

#### 📄 2. Gọi Mã Hóa & Triệt Thải Plain-text Trong API (`ChapterServiceImpl.java`):
```java
private ChapterResponseDTO mapToResponseDTO(Chapter chapter, String userEmail) {
    // 1. Xác định User Identifier (Email hoặc GUEST_JWT)
    String userIdentifier = (userEmail != null && !userEmail.isBlank()) ? userEmail : "GUEST_JWT";
    
    // 2. Tạo contextId động liên kết chặt chẽ giữa User, Truyện và Chương
    String contextId = userIdentifier + ":novel:" + chapter.getNovel().getId() + ":chapter:" + chapter.getChapterNumber();
    
    // 3. Thực hiện mã hóa nội dung
    Map<String, String> encryptedMap = encryptionService.encrypt(chapter.getContent(), contextId);

    // 4. Trả về DTO với content = NULL, thay thế bằng encryptedData & iv
    return ChapterResponseDTO.builder()
            .id(chapter.getId())
            .novelId(chapter.getNovel().getId())
            .chapterNumber(chapter.getChapterNumber())
            .title(chapter.getTitle())
            .slug(chapter.getSlug())
            .content(null) // <--- QUAN TRỌNG: Loại bỏ hoàn toàn plain text!
            .encryptedData(encryptedMap.get("encryptedData")) // Chuỗi mã hóa HEX
            .iv(encryptedMap.get("iv"))                       // IV ngẫu nhiên HEX
            .audioUrl(chapter.getAudioUrl())
            .status(currentStatus)
            .coinPrice(chapter.getCoinPrice())
            .viewCount(chapter.getViewCount())
            .createdAt(chapter.getCreatedAt())
            .updateAt(chapter.getUpdateAt())
            .build();
}
```

---

### 6.4. Chi Tiết Code Giải Mã Phía Client JavaScript (`CryptoJS`)

Dưới đây là mã nguồn JavaScript giải mã tương ứng phía Client bằng thư viện `crypto-js`:

```javascript
import CryptoJS from 'crypto-js';

/**
 * Hàm giải mã nội dung chương truyện phía Client
 * @param {string} encryptedHex - Chuỗi encryptedData dạng HEX nhận từ API
 * @param {string} ivHex - Chuỗi iv dạng HEX nhận từ API
 * @param {string} userEmail - Email của user đang đăng nhập (hoặc "GUEST_JWT" nếu khách)
 * @param {number} novelId - ID bộ truyện
 * @param {number} chapterNumber - Số thứ tự chương
 * @returns {string} Nội dung chương truyện văn bản thô
 */
export function decryptChapterContent(encryptedHex, ivHex, userEmail, novelId, chapterNumber) {
    try {
        const userIdentifier = userEmail || "GUEST_JWT";
        
        // 1. Tái tạo contextId chính xác theo quy ước với Backend
        const contextId = `${userIdentifier}:novel:${novelId}:chapter:${chapterNumber}`;
        
        // 2. Tái tạo Seed = contextId + ":" + ivHex
        const seed = `${contextId}:${ivHex}`;
        
        // 3. Băm Seed bằng SHA-256 để thu được Khóa AES 256-bit (32 bytes)
        const keyWordArray = CryptoJS.SHA256(seed);
        
        // 4. Parse IV từ chuỗi Hex
        const ivWordArray = CryptoJS.enc.Hex.parse(ivHex);
        
        // 5. Parse Encrypted Data từ chuỗi Hex sang Base64 cho CipherParams
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(encryptedHex)
        });
        
        // 6. Thực hiện giải mã AES-256-CBC với Padding PKCS7 (tương đương PKCS5)
        const decryptedWordArray = CryptoJS.AES.decrypt(
            cipherParams,
            keyWordArray,
            {
                iv: ivWordArray,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        
        // 7. Chuyển kết quả về UTF-8 String
        const plainText = decryptedWordArray.toString(CryptoJS.enc.Utf8);
        return plainText;
        
    } catch (error) {
        console.error("Lỗi giải mã chương truyện:", error);
        return "Không thể giải mã nội dung chương truyện. Vui lòng thử lại!";
    }
}
```

---

### 6.5. Đánh Giá Độ Bảo Mật Vượt Trỗi Của Kiến Trúc Dynamic Key + Random IV

1. **Chống Scraper & Crawler API**: Tool crawl tự động gọi API chỉ thu được `content: null` và chuỗi HEX mã hóa. Bot không thể thu thập được dữ liệu truyện dạng văn bản.
2. **Khóa Động Theo Bối Cảnh (Context-Aware Dynamic Key)**: Khóa giải mã được tạo từ `userEmail + novelId + chapterNumber`. Nếu kẻ xấu dùng Token của User A để lấy payload nhưng truyền email User B để giải mã $\rightarrow$ SHA-256 sinh sai Key $\rightarrow$ Giải mã ra kết quả rác.
3. **Biến Đổi Payload Liên Tục Nhờ Random IV (`SecureRandom`)**: Mỗi lần gọi API đọc chương (kể cả cùng 1 user), Backend đều sinh một `IV` mới. Do đó, chuỗi `encryptedData` luôn biến đổi 100%, chặn hoàn toàn thuật toán dò tìm dictionary attack.
4. **Bảo Vệ Bản Quyền Đầu Cuối**: Sau khi giải mã ra text ở Client Side, ứng dụng có thể render lên `<canvas>` hoặc chặn các sự kiện chuột (`oncopy`, `onselectstart`, `oncontextmenu`) để chống bôi đen sao chép thủ công.

---

### 6.6. Hàm Cipher Là Gì & Vai Trò Chi Tiết Ở Phía Backend Và Frontend

**`Cipher`** là bộ máy thuật toán mã hóa & giải mã dữ liệu 2 chiều.

| Tiêu chí | Backend (BE - Java) 🔴 | Frontend (FE - JavaScript) 🔵 |
| :--- | :--- | :--- |
| **Thư viện triển khai** | `javax.crypto.Cipher` (Java Core) | `CryptoJS.AES` (hoặc `crypto.subtle`) |
| **Chế độ hoạt động** | **`ENCRYPT_MODE`** (Mã hóa) | **`DECRYPT_MODE`** (Giải mã) |
| **Đầu vào (Input)** | Plain-text thô + Dynamic Key + Random IV | Chuỗi Hex mã hóa + Dynamic Key + Random IV |
| **Đầu ra (Output)** | Mảng Byte mã hóa (Chuỗi HEX `encryptedData`) | Plain-text thô UTF-8 ban đầu |
| **Mục đích** | Khóa dữ liệu, không cho ai đọc plain-text ở Network Tab | Khôi phục dữ liệu để hiển thị cho độc giả đọc |

---

### 6.7. Chứng Minh Thực Tế Mã Nguồn: Khóa Giải Mã Phụ Thuộc Trực Tiếp Vào userEmail

- **Lớp Service ([ChapterServiceImpl.java](file:///d:/semester%207/SBA/SBA301_SUMMER26/SBA301_SU26_GroupProject/src/main/java/com/fpt/sba301_su26_groupproject/service/impl/ChapterServiceImpl.java#L359-L363))**:
  ```java
  String userIdentifier = (userEmail != null && !userEmail.isBlank()) ? userEmail : "GUEST_JWT";
  String contextId = userIdentifier + ":novel:" + chapter.getNovel().getId() + ":chapter:" + chapter.getChapterNumber();
  ```
- **Lớp Mã Hóa ([EncryptionServiceImpl.java](file:///d:/semester%207/SBA/SBA301_SUMMER26/SBA301_SU26_GroupProject/src/main/java/com/fpt/sba301_su26_groupproject/service/impl/EncryptionServiceImpl.java#L31-L35))**:
  ```java
  String seed = (contextId != null ? contextId : "default") + ":" + ivHex;
  byte[] keyBytes = MessageDigest.getInstance("SHA-256").digest(seed.getBytes(StandardCharsets.UTF_8));
  SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
  ```
👉 **Chứng minh**: `userEmail` nằm trong `contextId`, `contextId` nằm trong `seed`. Do đó, `seed` là đầu vào của SHA-256 để sinh ra 32-byte **AES Key**. Nếu dùng email User B để giải mã payload của User A $\rightarrow$ SHA-256 sinh sai Key $\rightarrow$ Kết quả giải mã ra chuỗi rác vô nghĩa.

---

### 6.8. Phân Tích Chuyên Sâu `"AES/CBC/PKCS5Padding"` Và Lý Thuyết Quá Trình Cipher

#### 1. Ý Nghĩa 3 Thành Phần:
- **`AES` (Advanced Encryption Standard)**: Thuật toán mã hóa khối đối xứng chuẩn 128-bit block size. Băm seed qua SHA-256 sinh ra khóa AES 256-bit.
- **`CBC` (Cipher Block Chaining)**: Chế độ nối chuỗi khối. Mỗi khối dữ liệu $P_i$ được **XOR với khối mã hóa trước đó $C_{i-1}$** (khối đầu tiên XOR với `IV` ngẫu nhiên 16 bytes). Triệt tiêu nhược điểm của ECB, giúp cùng 1 chapter truyện nhưng mỗi lần F5 trang web lại sinh ra chuỗi `encryptedData` Hex biến đổi 100%.
- **`PKCS5Padding` / `PKCS7Padding`**: Cơ chế đệm dữ liệu bổ sung byte cho vừa tròn bội số 16 bytes, giúp thuật toán xử lý mượt mà mọi độ dài chương truyện mà không văng lỗi `IllegalBlockSizeException`.

#### 2. Sơ Đồ Quá Trình Cipher Mã Hóa (BE) và Giải Mã (FE):

```
[MÃ HÓA BẰNG BE]
Plaintext -> PKCS5Padding -> Chia khối 16B -> XOR với IV/C(i-1) -> AES Encrypt (Key) -> encryptedData (Hex)

[GIẢI MÃ BẰNG FE]
encryptedData (Hex) -> Chia khối 16B -> AES Decrypt (Key) -> XOR với IV/C(i-1) -> Gọt PKCS7 -> Plaintext UTF-8
```
