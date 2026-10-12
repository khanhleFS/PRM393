# Luminovels Mobile Client (Flutter) — PRM393

Ứng dụng di động đọc truyện trực tuyến có bản quyền **Luminovels**, phát triển bằng **Flutter 3** và kiến trúc **BLoC / Cubit Pattern**, kết nối trực tiếp với backend Spring Boot.

---

## 🚀 Các tính năng chính (Reader Flow)

1. **Xác thực & Người dùng (Authentication)**:
   - Đăng nhập (JWT Access Token & Refresh Token)
   - Đăng ký tài khoản & Kích hoạt qua mã OTP 6 số gửi về Email
   - Đăng xuất & Tự động gia hạn Access Token khi hết hạn (Interceptors)
2. **Khám phá tác phẩm (Home & Explore)**:
   - Danh sách truyện mới cập nhật, truyện nổi bật
   - Lọc tác phẩm theo danh mục / thể loại (Tất cả, Tiên hiệp, Ngôn tình, Trinh thám, v.v.)
   - Xem chi tiết tác phẩm (Ảnh bìa, tác giả, mô tả tóm tắt, số chương, lượt xem)
3. **Tìm kiếm truyện (Search)**:
   - Tìm kiếm theo từ khóa (tên truyện, tác giả)
   - Bộ lọc trạng thái: Đang ra (ONGOING) / Hoàn thành (COMPLETED)
4. **Trình đọc truyện bảo mật (Secure Reader - Hero Feature)**:
   - **Giải mã AES-256-CBC phía Client**: Tự động sinh khóa động `SHA-256(contextId:ivHex)` và giải mã chuỗi HEX `encryptedData` + `iv` nhận từ API backend.
   - **Chống sao chép nội dung**: Vô hiệu hóa bôi đen/copy văn bản (`SelectionContainer.disabled`).
   - **Tùy biến giao diện đọc**: Điều chỉnh cỡ chữ (A- / A+), chuyển đổi font có chân (`Literata Serif`) và không chân (`Plus Jakarta Sans`), đổi chế độ màu (Giấy ngà đọc sách, Ban đêm Night mode, Trắng sáng).
   - **Chương VIP có phí**: Hiển thị bảng khóa chương, kiểm tra số dư xu và thực hiện mở khóa trực tiếp bằng API `POST /unlock`.
   - **Chuyển chương mượt mà**: Nút "Chương trước" / "Chương sau" và tự động cuộn lên đầu trang.
5. **Tủ sách & Tiến độ đọc (Library & Bookmark)**:
   - Lưu truyện yêu thích (yêu thích/bỏ yêu thích)
   - Tự động ghi nhớ chương đang đọc dở và nút "Đọc tiếp" nhanh.
6. **Hệ thống Xu & Nạp tiền (Coin & Shop)**:
   - Hiển thị số dư xu thực tế
   - Danh sách các gói xu nạp
7. **Cấu hình địa chỉ Backend linh hoạt**:
   - Tùy chỉnh `Base URL` trực tiếp ngay trong màn hình Tài khoản (Profile) mà không cần build lại app (hỗ trợ máy ảo Android `10.0.2.2`, máy thật `192.168.x.x`, hoặc web `localhost`).

---

## 📁 Cấu trúc thư mục (`lib/`)

```
lib/
├── core/
│   ├── constants/
│   │   ├── api_endpoints.dart    # Configurable base URL & endpoints
│   │   └── app_colors.dart       # Bảng màu Lumina Scroll Theme
│   ├── network/
│   │   ├── api_client.dart       # Dio HTTP client với JWT Interceptor
│   │   └── api_response.dart     # Standard ApiResponse parser
│   ├── security/
│   │   └── encryption_service.dart # AES-256-CBC Decryption & Key derivation
│   ├── storage/
│   │   └── local_storage.dart    # SharedPreferences lưu token & cài đặt
│   └── theme/
│       └── app_theme.dart        # Plus Jakarta Sans, Literata font Material 3
├── data/
│   ├── models/
│   │   ├── user_model.dart       # UserModel, LoginResponseModel
│   │   ├── novel_model.dart      # NovelModel, CategoryModel, NovelPageResponse
│   │   ├── chapter_model.dart    # ChapterModel, ChapterUnlockResponseModel
│   │   ├── bookmark_model.dart   # BookmarkModel
│   │   └── coin_package_model.dart # CoinPackageModel, CoinTransactionModel
│   └── repositories/
│       ├── auth_repository.dart
│       ├── novel_repository.dart
│       ├── chapter_repository.dart
│       ├── bookmark_repository.dart
│       └── coin_repository.dart
├── bloc/
│   ├── auth/                     # AuthBloc, AuthEvent, AuthState
│   ├── novel/                    # NovelBloc, NovelEvent, NovelState
│   ├── reader/                   # ReaderBloc, ReaderEvent, ReaderState
│   └── bookmark/                 # BookmarkBloc, BookmarkEvent, BookmarkState
├── presentation/
│   ├── widgets/
│   │   ├── novel_card.dart       # Card hiển thị truyện
│   │   └── coin_badge.dart       # Huy hiệu hiển thị xu
│   └── screens/
│       ├── splash/splash_screen.dart
│       ├── auth/
│       │   ├── login_screen.dart
│       │   ├── register_screen.dart
│       │   └── otp_verification_screen.dart
│       ├── main_nav_screen.dart   # Bottom Navigation 4 tab
│       ├── home/home_screen.dart
│       ├── search/search_screen.dart
│       ├── novel_detail/novel_detail_screen.dart
│       ├── reader/reader_screen.dart
│       ├── library/library_screen.dart
│       ├── coin/coin_shop_screen.dart
│       └── profile/profile_screen.dart
└── main.dart                     # Entrypoint (MultiRepository & MultiBloc)
```

---

## 🛠 Hướng dẫn chạy ứng dụng

### 1. Chuẩn bị Backend
Khởi động cụm backend Spring Boot & DB bằng Docker Compose từ thư mục gốc dự án:
```bash
docker compose up -d
```
Backend sẽ lắng nghe tại cổng `http://localhost:8080`.

### 2. Chạy ứng dụng Flutter
Vào thư mục `Frontend`:
```bash
cd Frontend
flutter pub get
```

Chạy trên thiết bị mong muốn:
- **Chạy trên máy ảo Android Emulator**:
  ```bash
  flutter run
  ```
  *(Base URL mặc định trên máy ảo Android là `http://10.0.2.2:8080/api`)*

- **Chạy trên máy thật (USB Debugging / WiFi LAN)**:
  ```bash
  flutter run
  ```
  *(Vào tab **Tài khoản** -> **Cấu hình Backend API IP** -> Nhập `http://<IP_Máy_Tính_Của_Bạn>:8080/api`)*

- **Chạy trên trình duyệt Web (Chrome)**:
  ```bash
  flutter run -d chrome
  ```

- **Build file APK cài đặt cho điện thoại Android**:
  ```bash
  flutter build apk --release
  ```
  File APK sẽ nằm tại `Frontend/build/app/outputs/flutter-apk/app-release.apk`.
