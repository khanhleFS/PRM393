# DEV 3 — Tài khoản, xác thực và cửa hàng xu

Phạm vi triển khai bám theo phần DEV 3 trong `KE_HOACH_RESTYLE_FLUTTER.md`.

## Các màn hình

- `lib/presentation/screens/splash/splash_screen.dart`: logo, slogan serif, nền giấy; chặn điều hướng lặp khi nhận cả hồ sơ cache và hồ sơ mới.
- `lib/presentation/screens/auth/login_screen.dart`: form theo theme chung, giới hạn chiều rộng, kiểm tra email, autofill và gửi từ bàn phím.
- `lib/presentation/screens/auth/register_screen.dart`: form đăng ký theo theme chung, validation và cuộn khi mở bàn phím.
- `lib/presentation/screens/auth/otp_verification_screen.dart`: sáu ô OTP, chỉ nhận số, dán cả mã, chuyển focus, kiểm tra đủ sáu số trước khi gọi API.
- `lib/presentation/screens/profile/profile_screen.dart`: hồ sơ, nhãn vai trò thực tế, số dư xu, xác nhận đăng xuất và dialog kiểm tra URL máy chủ.
- `lib/presentation/screens/coin/coin_shop_screen.dart`: số dư, gói xu một/hai cột tùy chiều rộng, định dạng tiền Việt Nam, thử lại khi lỗi, xác nhận mua và thông tin thanh toán.

Dùng lại `AppColors`, `AppTypography`, `AppSpacing` và theme hiện có. Không sửa backend hoặc màn hình của DEV 1/DEV 2.

## Luồng demo

1. Khởi động ứng dụng, mở Tài khoản khi chưa đăng nhập.
2. Mở Đăng nhập, thử bỏ trống hoặc nhập email sai để thấy validation.
3. Mở Đăng ký, nhập thông tin hợp lệ theo quy tắc backend, nhận OTP qua email.
4. Dán mã gồm sáu số, kích hoạt tài khoản rồi đăng nhập.
5. Xem hồ sơ và số dư; mở Nạp xu, chọn gói, xác nhận tạo đơn.
6. Sao chép liên kết MoMo và hoàn tất thanh toán trong môi trường backend đã cấu hình.
7. Bấm Kiểm tra số dư để tải lại hồ sơ từ server. Việc tạo đơn không đồng nghĩa thanh toán thành công; client không tự cộng xu.
8. Thử đổi URL backend không hợp lệ và hủy/đồng ý đăng xuất.

## Giới hạn tích hợp

- Backend hiện chưa có endpoint gửi lại OTP đăng ký, vì vậy chưa có nút gửi lại hoặc bộ đếm giả. Cần nhóm backend bổ sung API trước khi nối chức năng này.
- Model tài khoản chưa có trạng thái VIP; badge hiện hiển thị vai trò từ API.
- Model gói xu chưa có thông tin khuyến mãi; giao diện không tự gắn nhãn giảm giá/phổ biến.
- Luồng thanh toán hỗ trợ SePay Test Mode (QR, sao chép mã và kiểm tra trạng thái từ backend), đồng thời giữ nhánh UI MoMo cho cấu hình cũ. Trên Azure hiện chọn SePay; xem `deploy/azure/SEPAY_TEST_MODE.md` để cấu hình webhook và mô phỏng giao dịch.

## Chạy và kiểm tra

Project yêu cầu Dart `^3.13.2`; Flutter cài sẵn trên máy lúc triển khai chỉ có Dart 3.11.5. Dùng SDK Flutter phù hợp (đã chuẩn bị bản 3.47.9 riêng trong `%TEMP%/prm393-flutter-3.47.9`) để chạy:

```powershell
cd E:\PRM393\PRM393\Frontend
& "$env:TEMP/prm393-flutter-3.47.9/bin/flutter.bat" pub get
& "$env:TEMP/prm393-flutter-3.47.9/bin/flutter.bat" analyze
& "$env:TEMP/prm393-flutter-3.47.9/bin/flutter.bat" test
& "$env:TEMP/prm393-flutter-3.47.9/bin/flutter.bat" run
```

`test/widget_test.dart` thay smoke test counter mặc định bằng các tình huống auth, OTP, cấu hình backend và checkout với repository giả; không phát sinh giao dịch thật.

Kết quả kiểm tra cập nhật SePay: `flutter analyze --no-pub` không có issue; `flutter test --no-pub` đạt 10/10 test. Kiểm thử xác nhận đơn PENDING không được báo đã thanh toán, chỉ đóng dialog khi backend trả COMPLETED và nút làm mới cập nhật số dư. APK đã chạy trên máy ảo Android; webhook mô phỏng từ dashboard đã tạo đúng một lần cộng 100 xu trên Azure. Màn hình nạp xu tải lại hồ sơ khi mở/kéo xuống và có nút Làm mới số dư.

Trên Windows, `pub get` tải được dependency nhưng bước tạo symlink cho plugin desktop báo cần Developer Mode. Phân tích code và widget test đã chạy được với `--no-pub`. Nếu build Windows desktop, cần bật Developer Mode; nếu demo Android, chọn emulator/điện thoại Android với SDK phù hợp.

## Lịch sử ví và dữ liệu demo

Có màn hình Lịch sử giao dịch trong Tài khoản và Nạp xu, hỗ trợ dấu +/−, số dư sau giao dịch, thời gian, phân trang và thử lại khi lỗi. Đã sửa model để khớp transactionId/transactionType của API. Kiểm tra mới nhất: 13 Flutter test đạt, analyze không có issue. Backend Azure có 21 truyện, 521 chương, 8 thể loại từ fixtures của repo; dữ liệu ví được giữ nguyên. APK mới đã cài lên máy ảo và cập nhật link tải.
