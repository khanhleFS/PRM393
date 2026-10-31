# Deploy gần $0: Render + Azure SQL + Upstash + Resend

Cấu hình đã chuẩn bị cho Luminovels, ngày 30/10/2026. Hiện chưa tạo tài nguyên cloud hoặc gửi email/giao dịch thật. Không nhập secret vào source code hay gửi secret trong chat; nhập ở Environment của Render.

## 1. Azure SQL Database

Mở [hướng dẫn Azure SQL free tier](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier?view=azuresql). Tạo SQL Database với **Apply free offer/free tier** hiển thị trong portal. Đây là Azure SQL Database, không chọn Managed Instance hoặc SQL Server VM. Chọn chế độ auto-pause đến tháng sau khi hết free quota để tránh tự chuyển sang tính phí.

Ghi lại hostname đầy đủ `...database.windows.net`, tên database, SQL admin login và password. Chọn SQL authentication để khớp backend hiện tại. Region gần Render/Upstash giúp giảm độ trễ nhưng kiểm tra lại region đủ điều kiện free trong portal.

Networking: backend Render cần truy cập Azure SQL qua public endpoint. Chỉ thêm IP máy quản trị và các **outbound IP/range của Render service** trong firewall SQL server. Render hiển thị các range trong trang Connect/Outbound của service; Azure SQL firewall nhận start/end IP, cần chuyển CIDR sang khoảng IP tương ứng. Không dùng localhost/10.0.2.2 làm DB_HOST.

Nếu tài khoản không hiện Apply free offer, dừng trước khi tạo DB có phí. [FAQ eligibility](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier-faq?view=azuresql-db) phân biệt Azure for Students và Students Starter; không mặc định tài khoản sinh viên nào cũng tương thích.

## 2. Upstash Redis

Tạo một Redis database gói Free trong [Upstash Console](https://console.upstash.com), chọn region gần backend. Lấy thông tin **native Redis connection**: Endpoint/hostname, Port và Password. Không lấy REST URL hoặc REST token thay cho chúng.

Profile cloud bật TLS sẵn. Không thêm `https://` vào REDIS_HOST. Mật khẩu cần là password của Redis, không phải token quản trị Upstash. [Doc Redis connection](https://upstash.com/docs/redis/overall/getstarted).

## 3. Resend cho OTP qua HTTPS

Tạo tài khoản [Resend](https://resend.com), tạo API key có quyền gửi email, rồi cấu hình sender.

- Chưa có tên miền: dùng `Luminovels <onboarding@resend.dev>` để test **chỉ với email chủ tài khoản Resend**. Đăng ký trong app phải dùng đúng email đó.
- Muốn OTP cho thành viên/giảng viên/người khác: thêm domain/subdomain mà bạn quản lý DNS, xác minh theo [Resend domain guide](https://resend.com/docs/dashboard/domains/introduction), rồi MAIL_FROM dùng địa chỉ trên domain đã xác minh. Không cần mua mailbox riêng chỉ để gửi từ địa chỉ này, nhưng phải quản lý được DNS của domain.

[Giới hạn sender test](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) không được xử lý bằng cách đổi `to` âm thầm: OTP phải đến đúng email người đăng ký. Code giữ nguyên điều đó. Resend Free hiện có [3.000 email/tháng, 100/ngày](https://resend.com/pricing); kiểm tra quota khi demo.

Không gửi Gmail password cho Resend. Backend cloud không dùng SMTP, và không cần MAIL_USERNAME/MAIL_PASSWORD.

## 4. Đưa code lên Git và tạo Render service

Repo cần nằm trên Git provider mà Render truy cập được; các thay đổi hiện còn ở workspace, chưa được commit/push trong bước này. Chỉ push code/config mẫu, không push `.env`.

Có sẵn `render.yaml` ở gốc repo: Docker backend, Singapore, Free, health check `/api/app/health`, auto-deploy tắt. Tạo Blueprint từ repo/branch chứa file đó. Có thể dùng Render integration trong chat sau khi kết nối tài khoản.

Nếu tạo thủ công Web Service:

1. Chọn repo và branch đúng.
2. Runtime Docker; Dockerfile `Backend/Dockerfile`; Docker build context `Backend`.
3. Chọn Free instance, region gần database; health check `/api/app/health`.
4. Đặt các biến theo `Backend/.env.cloud.example` trước khi deploy. Không import `.env` local.

Biến bắt buộc cho dữ liệu và mail:

```dotenv
SPRING_PROFILES_ACTIVE=cloud
DB_HOST=<Azure SQL hostname>
DB_NAME=<database>
DB_USERNAME=<SQL login>
DB_PASSWORD=<SQL password>
REDIS_HOST=<Upstash native endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=<Upstash Redis password>
MAIL_PROVIDER=resend
RESEND_API_KEY=<Resend send API key>
MAIL_FROM=<verified sender, or test sender for your own email>
JPA_DDL_AUTO=validate
```

Blueprint tự tạo JWT_SECRET ở dạng base64 256-bit. Nhập Cloudinary/Google/MoMo credentials đã có trực tiếp trong Environment nếu cần các chức năng đó. Không chuyển các khóa từ file secret vào Git. Với Web Service tạo thủ công, cần JWT_SECRET ổn định là base64 của 32 bytes ngẫu nhiên và JAVA_TOOL_OPTIONS giống Blueprint để phù hợp RAM.

Render cung cấp PORT và RENDER_EXTERNAL_URL; không nhập một URL `onrender.com` phỏng đoán. Spring sẽ bind đúng PORT.

### Khởi tạo DB mới, không xóa dữ liệu sau restart

- **DB Azure mới hoàn toàn, chưa có bảng**: tạm đặt `JPA_DDL_AUTO=update`, deploy một lần để Hibernate tạo schema từ entity. Sau khi service lên, đổi lại `JPA_DDL_AUTO=validate` và redeploy. Đây là cách bootstrap demo, không phải cơ chế migration production.
- **DB đã import dữ liệu/schema**: giữ `validate`; nếu báo lệch schema thì kiểm tra thay vì chuyển sang create/create-drop.
- Cloud luôn đặt `spring.sql.init.mode=never`; không chạy hai script schema/seed local có DROP/DELETE.
- Muốn demo shop trên DB mới: chạy thủ công `Backend/scripts/seed-cloud-demo-packages.sql` trong Query Editor/SSMS. Script thêm gói mẫu còn thiếu; không tự chạy khi app restart. Chưa thực thi script này trên cloud.
- Chưa có truyện/người dùng nếu chỉ bootstrap schema; nhóm cần đăng ký tài khoản và import/tạo nội dung demo. Không tự tạo admin với mật khẩu mặc định.

Pool Azure SQL tối đa 3 kết nối, minimum-idle=0 và idle timeout 30 giây. Health check không query SQL/Redis để tránh tạo lưu lượng database do probe. Health 200 chỉ xác nhận web process chạy; vẫn phải test đăng ký/đăng nhập để xác nhận kết nối dịch vụ.

## 5. MoMo sau khi Render cấp URL

Profile cloud tự lấy từ RENDER_EXTERNAL_URL:

- Redirect: `<URL-Render>/payment-result.html`.
- IPN: `<URL-Render>/api/orders/momo/callback`.
- Mobile dùng cùng trang HTTPS khi chưa đăng ký App Links.

**Không tạo các biến DEV_MOMO_REDIRECT_URL / DEV_MOMO_IPN_URL có giá trị rỗng trên Render**: một biến tồn tại nhưng trống sẽ ghi đè fallback. Nếu có biến cũ, xóa khỏi Environment; không chỉ xóa nội dung. Chỉ đặt chúng khi muốn dùng URL khác thật sự.

Giữ DEV_MOMO_ENDPOINT và credential cùng môi trường sandbox. Redirect không tự xác nhận thành công; backend vẫn kiểm tra chữ ký IPN và số dư. Tạo đơn sandbox và kiểm tra log resultCode sau khi backend/DB/Redis đã hoạt động.

Render Free có thể ngủ và Azure SQL serverless có thời gian resume: IPN có thể timeout. Luồng Query DR/sync đã có ở backend nhưng giao diện Kiểm tra số dư hiện chỉ tải profile, không gọi sync order. Không quảng bá cấu hình free này là thanh toán production 24/7; chưa thay đổi luồng đối soát trong lần chuẩn bị deploy này.

## 6. APK Android

Code hỗ trợ API_BASE_URL lúc build:

```powershell
cd Frontend
flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-ACTUAL-SERVICE.onrender.com/api
```

Dùng SDK phù hợp yêu cầu Dart của project; SDK tạm đã chuẩn bị ở `%TEMP%/prm393-flutter-3.47.9/bin/flutter.bat` nếu Flutter trong PATH còn cũ. Thay URL minh họa bằng URL thực. Quyền INTERNET đã có trong manifest chính.

Bản cài cũ có thể còn lưu API URL local: đổi trong Tài khoản > Cấu hình Backend hoặc xóa dữ liệu app. URL người dùng lưu được ưu tiên hơn URL lúc build. Chưa build APK gắn domain thật vì Render chưa cấp domain.

Sau khi có APK có thể dùng Firebase App Distribution cho nhóm/giảng viên; app chạy trên điện thoại, không chạy APK trên Render.

## 7. Kiểm tra sau deploy

1. `/api/app/health` trả 200; `/payment-result.html` mở được khi chưa đăng nhập.
2. Đăng ký bằng email được sender cho phép, nhận OTP và xác thực.
3. Đăng nhập, refresh token và logout để kiểm tra Upstash.
4. Restart backend, kiểm tra người dùng/gói xu vẫn còn.
5. Tạo order sandbox, kiểm tra IPN/resultCode, số dư; thử lại sau khi service ngủ.

Không thêm uptime monitor chỉ để giữ service free thức liên tục. Quota Azure SQL/Upstash/Resend vẫn cần theo dõi; các job định kỳ không bảo đảm chạy khi Render ngủ.

## Kiểm tra tại workspace

- Backend: test thanh toán, payload/template email, chọn provider SMTP/Resend, và smoke test profile cloud với H2. Smoke test chạy web/security thực và kiểm tra health/redirect public, không dùng Azure/Upstash thật.
- Flutter: widget tests hiện có và analyze sau thay đổi API_BASE_URL.
- Chưa kết nối tài khoản cloud, chưa phát sinh cloud resource, chưa gửi email/MoMo thật.

Kết quả kiểm tra lần chuẩn bị này: 12/12 test backend và 8/8 test Flutter đạt; JAR package thành công; `render.yaml` hợp lệ theo JSON Schema chính thức từ Render. JAR chạy với cùng giới hạn JVM dự kiến cho Render đạt health UP, dùng khoảng 354 MiB working set lúc sẵn sàng trên máy Windows với H2. Con số này không phải benchmark RAM Azure SQL thực tế, không đảm bảo trần 512 MiB trong mọi tải. Chưa build Docker image hoặc APK có URL Render thật.
