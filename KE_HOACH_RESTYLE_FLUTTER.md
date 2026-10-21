# 🎨 KẾ HOẠCH PHÂN CHIA TASK RESTYLE GIAO DIỆN FLUTTER (LUMINOVELS)

Tài liệu này tổng hợp danh sách toàn bộ các trang (pages/screens) hiện có trong ứng dụng Flutter và phân chia nhiệm vụ thiết kế lại (restyle) cho **3 thành viên**, bám sát theo bộ quy chuẩn [Design Tokens — Flutter Project.md](./Design%20Tokens%20%E2%80%94%20Flutter%20Project.md).

---

## 📌 I. TỔNG QUAN HỆ THỐNG MÀN HÌNH

Hiện tại ứng dụng gồm **10 màn hình chính**, **1 thanh điều hướng đáy** và **các Bottom Sheet/Dialog**:

| Nhóm chức năng | Tên màn hình | File Code tương ứng |
| :--- | :--- | :--- |
| **Hệ thống & Shell** | Splash Screen | `lib/presentation/screens/splash/splash_screen.dart` |
| | Main Nav Bar | `lib/presentation/screens/main_nav_screen.dart` |
| **Xác thực (Auth)** | Đăng nhập (Login) | `lib/presentation/screens/auth/login_screen.dart` |
| | Đăng ký (Register) | `lib/presentation/screens/auth/register_screen.dart` |
| | Xác thực OTP | `lib/presentation/screens/auth/otp_verification_screen.dart` |
| **Nội dung & Khám phá** | Trang chủ / Khám phá | `lib/presentation/screens/home/home_screen.dart` |
| | Tìm kiếm & Bộ lọc | `lib/presentation/screens/search/search_screen.dart` |
| | Tủ sách cá nhân | `lib/presentation/screens/library/library_screen.dart` |
| | Chi tiết tác phẩm | `lib/presentation/screens/novel_detail/novel_detail_screen.dart` |
| **Trải nghiệm đọc** | Trình đọc truyện (Reader) | `lib/presentation/screens/reader/reader_screen.dart` |
| **Tài khoản & Xu** | Thông tin cá nhân | `lib/presentation/screens/profile/profile_screen.dart` |
| | Nạp xu / Shop | `lib/presentation/screens/coin/coin_shop_screen.dart` |
| **Widget dùng chung** | Card truyện, Badge xu | `lib/presentation/widgets/novel_card.dart`, `coin_badge.dart` |

---

## 🎯 II. QUY CHUẨN DESIGN TOKENS BẮT BUỘC ÁP DỤNG

Mọi màn hình khi restyle phải tuân thủ nghiêm ngặt các token sau (tránh hardcode màu ngẫu nhiên):

- **Bảng màu chủ đạo:**
  - `Background`: `#DDDBBB` (Màu nền vàng ấm vintage)
  - `Surface / Card / Sheet`: `#FFFDF2` (Màu nền phụ cho card, dialog, bottom sheet tách khỏi nền)
  - `Primary / Accent`: `#884730` (Nâu đỏ đất / Terra cotta)
  - `Text / Dark`: `#282932` (Màu chữ chính - tương phản cao trên nền giấy)
  - `Divider`: `rgba(40, 41, 50, 0.14)`
- **Màu Semantic (Phản hồi trạng thái):**
  - `Success`: `#4C7A4C` | `Warning`: `#B4791F` | `Error`: `#A53F3F` | `Info`: `#3F6FA5` | `Disabled`: `#9C998A`
- **Typography:**
  - Tiêu đề (Headings): `Times New Roman` (font có chân hoài niệm, sang trọng)
  - Nội dung / Body / Input: `Arial` (hoặc font sans dễ đọc, sạch sẽ)
- **Thước đo Spacing (Bội số 8):**
  - `xs: 4` | `sm: 8` | `md: 16` | `lg: 24` | `xl: 32` | `2xl: 40`
- **Border Radius:**
  - `sm: 4` | `md: 8` (Card nhỏ/Bìa truyện) | `lg: 12` (Card lớn) | `xl: 16` (Sheet/Modal) | `full: 24` (Chip/Button pill)

---

## ⚡ BƯỚC 0: SETUP CHUNG (LÀM TRƯỚC TIÊN - 1 NGƯỜI LÀM)

> **Mục tiêu:** Cập nhật file màu & theme gốc để cả team kéo về dùng chung hằng số, tránh xung đột màu.

- [ ] Cập nhật file `lib/core/constants/app_colors.dart`:
  - Thêm đầy đủ mã màu token mới: `background (#DDDBBB)`, `surface (#FFFDF2)`, `primary (#884730)`, `textDark (#282932)`, các màu semantic.
- [ ] Cập nhật file `lib/core/theme/app_theme.dart`:
  - Cấu hình `scaffoldBackgroundColor`, `colorScheme`, `appBarTheme`, `cardTheme`, `elevatedButtonTheme` đồng bộ.
- [ ] Restyle 2 widget dùng chung:
  - `lib/presentation/widgets/novel_card.dart`: Bo góc `8px`, bóng mờ `elevation 1`, màu chữ `#282932`.
  - `lib/presentation/widgets/coin_badge.dart`: Đồng bộ tone vàng đất/cam ấm hài hòa với `#884730`.
- [ ] **Commit & Merge vào nhánh chung (`dev`/`main`) để 3 người kéo về trước khi bắt đầu.**

---

## 👥 III. PHÂN CHIA NHIỆM VỤ CHO 3 THÀNH VIÊN

```
                                  [Nhánh DEV đã có Theme mới]
                                        /         |         \
                                       /          |          \
                    ┌─────────────────┐   ┌────────────────┐   ┌──────────────────┐
                    │     DEV 1       │   │     DEV 2      │   │      DEV 3       │
                    │ Core Reading &  │   │  Browsing &    │   │  User Account &  │
                    │  Novel Detail   │   │    Library     │   │   Monetization   │
                    └─────────────────┘   └────────────────┘   └──────────────────┘
```

---

### 👤 DEV 1: TRẢI NGHIỆM ĐỌC & CHI TIẾT TÁC PHẨM
> **Độ phức tạp:** Cao (Trọng tâm về Typography, UX đọc và Modal cài đặt)  
> **Nhánh đề xuất:** `feature/restyle-reader-detail`

#### 1. Màn hình Chi tiết truyện (`novel_detail_screen.dart`)
- [ ] **Header sách:**
  - Bìa truyện có bóng đổ nhẹ (`elevation 1`), bo góc `8px`.
  - Tiêu đề dùng font `Times New Roman`, chữ đậm `#282932`.
  - Hiển thị chip thể loại với viền mỏng và nền `#FFFDF2`.
- [ ] **Thanh nút hành động:**
  - Nút *Đọc ngay / Đọc tiếp* nổi bật với nền `#884730`, chữ trắng/vàng kem.
  - Nút *Yêu thích* (Bookmark) đổi màu viền và icon theo trạng thái đã lưu/chưa lưu.
- [ ] **Danh sách chương:**
  - Phân tách rõ ràng giữa chương Miễn phí và chương VIP (icon ổ khóa + giá xu).
  - Item chương có hiệu ứng hover/pressed đổi màu nhẹ `rgba(40,41,50,0.06)`.

#### 2. Màn hình Trình đọc truyện (`reader_screen.dart`)
- [ ] **Không gian đọc:**
  - Khoảng cách lề trái/phải chuẩn `16px` (`spacing.md`), chiều cao dòng `1.5` - `1.6` giúp mắt không bị mỏi.
- [ ] **Bottom Sheet "Cài đặt giao diện đọc":**
  - Nền sheet `#FFFDF2`, bo góc trên `16px` (`radius.xl`).
  - Thanh chọn cỡ chữ (+ / -) và đổi font chữ (Serif Times New Roman vs Sans).
  - 3 nút tròn chọn màu nền đọc: *Giấy ngà (`#DDDBBB`)*, *Ban đêm (`#141416`)*, *Sáng (`#FFFDF2`)*.
- [ ] **Card Mở khóa chương VIP:**
  - Viền màu cảnh báo nhẹ, hiển thị số xu cần để mở khóa và số dư hiện có.
  - Nút bấm *Mở khóa ngay* màu `#884730`.
- [ ] **Thanh chuyển chương dưới chân:**
  - Nút *Chương trước* (outline/ghost) và *Chương sau* (solid primary) cách điệu tinh tế.

---

### 👤 DEV 2: KHÁM PHÁ, TÌM KIẾM & TỦ SÁCH
> **Độ phức tạp:** Vừa (Trọng tâm về Bố cục Grid, Filter Chips và Empty States)  
> **Nhánh đề xuất:** `feature/restyle-discovery-library`

#### 1. Khung điều hướng chính (`main_nav_screen.dart`)
- [ ] Cập nhật màu thanh `NavigationBar` đáy app: Nền đồng bộ `#FFFDF2` hoặc `#DDDBBB`.
- [ ] Đổi màu icon active và text label sang màu `#884730`.

#### 2. Màn hình Trang chủ / Khám phá (`home_screen.dart`)
- [ ] **AppBar:**
  - Tên app "Luminovels" dùng font `Times New Roman`, màu `#884730`.
  - Icon sách và [CoinBadge] căn chỉnh ngay ngắn.
- [ ] **Thanh cuộn chọn Thể loại (Category Chips):**
  - Chip được chọn: Nền `#884730`, chữ trắng, bo góc `24px` (`radius.full`).
  - Chip chưa chọn: Nền `#FFFDF2`, viền mỏng mờ, chữ `#282932`.
- [ ] **Lưới tác phẩm (Novels Grid):**
  - Khoảng cách giữa các card là `16px`.
  - Bọc `RefreshIndicator` với spinner màu `#884730`.
  - Màn hình lỗi mạng (Error State) với nút *Thử lại* bo tròn thẩm mỹ.

#### 3. Màn hình Tìm kiếm (`search_screen.dart`)
- [ ] Ô `TextField` tìm kiếm: Nền `#FFFDF2`, viền bo góc `12px`, icon kính lúp màu `#884730`.
- [ ] Bộ lọc trạng thái (*Đang ra* / *Hoàn thành*) dạng ChoiceChip đồng bộ.
- [ ] Màn hình khi chưa gõ tìm kiếm và khi không tìm thấy kết quả (Empty illustration/icon).

#### 4. Màn hình Tủ sách (`library_screen.dart`)
- [ ] Giao diện khi chưa đăng nhập: Card thông báo mời đăng nhập với icon mở sách trang nhã.
- [ ] Danh sách truyện đã lưu: Card dạng hàng ngang (bìa trái, tên + chương đang đọc dở + % tiến độ bên phải).
- [ ] Nút xóa / bỏ theo dõi nhẹ nhàng, tránh bấm nhầm.

---

### 👤 DEV 3: TÀI KHOẢN, XÁC THỰC & CỬA HÀNG XU
> **Độ phức tạp:** Vừa (Trọng tâm về Form Input, Validation, Dialogs và Giao dịch)  
> **Nhánh đề xuất:** `feature/restyle-auth-profile-shop`

#### 1. Màn hình Splash (`splash_screen.dart`)
- [ ] Nền `#DDDBBB`, logo Luminovels ở giữa với bóng đổ nhẹ.
- [ ] Slogan chữ `Times New Roman` màu `#282932`. Loading indicator màu `#884730`.

#### 2. Cụm màn hình Xác thực (Auth)
- [ ] **Đăng nhập (`login_screen.dart`):**
  - Nền `#DDDBBB` hoặc `#FFFDF2`.
  - Ô nhập Email / Mật khẩu: Viền bo góc `8px`, màu focus viền `#884730`.
  - Nút *Đăng nhập*: Nền `#884730`, chữ trắng in hoa nhẹ (`letter-spacing 0.3px`).
  - Text link *Chưa có tài khoản? Đăng ký ngay*.
- [ ] **Đăng ký (`register_screen.dart`):**
  - Form tương đồng với màn Đăng nhập, thông báo lỗi màu đỏ `#A53F3F`.
- [ ] **Xác thực OTP (`otp_verification_screen.dart`):**
  - 6 ô nhập mã OTP tách rời, viền toát lên phong cách cổ điển, bộ đếm ngược gửi lại mã.

#### 3. Màn hình Tài khoản (`profile_screen.dart`)
- [ ] Header thông tin: Avatar tròn, tên tài khoản (Times New Roman), Badge VIP nổi bật.
- [ ] Card số dư Xu: Nền thẻ màu `#FFFDF2`, số xu to màu vàng đất, có nút *Nạp xu* kế bên.
- [ ] Danh sách mục menu (Cài đặt, Đổi máy chủ backend, Đăng xuất): Phong cách danh sách tối giản với divider mỏng.
- [ ] Restyle **Dialog cấu hình Base URL**.

#### 4. Màn hình Cửa hàng Xu (`coin_shop_screen.dart`)
- [ ] Thẻ tổng quan số dư xu hiện tại trên đầu trang.
- [ ] Lưới các gói nạp xu:
  - Thẻ gói nạp nền `#FFFDF2`, viền nổi bật nếu là gói "Khuyến mãi / Phổ biến nhất".
  - Số xu nhận được màu `#884730`, giá VNĐ định dạng rõ ràng (`100,000 đ`).
- [ ] Restyle **Dialog Xác nhận nạp tiền**: Nền dialog `#FFFDF2`, bo góc `16px`.

---

## 🛠️ IV. NGUYÊN TẮC PHỐI HỢP GIT ĐỂ KHÔNG CONFLICT

1. **Tuân thủ quy ước nhánh:**
   - Dev 1: `git checkout -b feature/restyle-reader-detail`
   - Dev 2: `git checkout -b feature/restyle-discovery-library`
   - Dev 3: `git checkout -b feature/restyle-auth-profile-shop`
2. **Không sửa chéo file của nhau:**
   - Mỗi dev chỉ làm việc trong đúng các file đã được phân chia ở trên.
   - Nếu cần thêm hằng số màu hoặc style dùng chung, thông báo lên nhóm để thống nhất bổ sung vào `app_colors.dart` hoặc `app_theme.dart`.
3. **Kiểm tra độ tương phản (Accessibility - WCAG):**
   - ⚠️ **Lưu ý quan trọng từ tài liệu Design Tokens:** Không dùng chữ nhỏ màu `#884730` đè trực tiếp lên nền `#DDDBBB` (tỉ lệ tương phản thấp, khó đọc). Hãy dùng chữ màu tối `#282932` cho nội dung thông thường, chỉ dùng `#884730` cho nút bấm nền đặc hoặc icon/tiêu đề lớn.

---

## ✅ V. CHECKLIST ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE)

- [ ] Không còn màu tím mặc định của Flutter Material 3 hay màu cam/xanh hardcode cũ.
- [ ] Mọi màn hình đều đúng chuẩn nền `#DDDBBB` kết hợp thẻ phụ `#FFFDF2`.
- [ ] Font chữ áp dụng đúng: Tiêu đề dùng `Times New Roman`, nội dung dùng `Arial`.
- [ ] Khoảng cách lề, padding đều là bội số của 8 (8, 16, 24).
- [ ] App chạy mượt mà trên cả máy ảo và Device Preview, không bị lỗi tràn màn hình (Overflow/Yellow tape).
