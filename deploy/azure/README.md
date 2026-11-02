# Luminovels — Azure VM

## Sửa lỗi Swagger và API trả 500 do Metaspace ngày 31 tháng 10 năm 2026

Log thực tế ghi `OutOfMemoryError: Metaspace` trong khi SQL/Redis vẫn healthy và
endpoint liveness rẻ vẫn trả UP. Giới hạn 128 MiB quá chật khi Springdoc sinh schema.
Đã tăng MaxMetaspaceSize lên 256 MiB và container backend lên 896 MiB, giữ heap 320 MiB,
code cache 64 MiB, thêm ExitOnOutOfMemoryError để JVM lỗi có thể được restart policy phục hồi.

`verify-runtime.sh` nay thực sự tải và parse `/v3/api-docs`, sau đó kiểm tra JSON cấu hình
app, truy vấn thư viện và API được bảo vệ; không chỉ kiểm tra HTML Swagger hoặc liveness.
Đã warm schema 60 paths và kiểm tra liên tiếp 5 vòng schema/config/library trên HTTPS.
Smoke test H2 bổ sung kiểm tra sinh OpenAPI và các endpoint JSON sau đó, đạt 5 test.
`.gitattributes` giữ script bash ở LF để không lỗi `pipefail\r` sau checkout trên Windows.
Không thay đổi schema hay dữ liệu ví trong lần sửa cấu hình này; không cần APK mới.

## Lịch sử ví và thư viện mẫu

- APK có Lịch sử giao dịch ở Tài khoản và icon trên Nạp xu: số xu có dấu +/−,
  thời gian, ghi chú, mã giao dịch, số dư sau giao dịch, kéo làm mới và Xem thêm.
- DTO lịch sử thêm `balanceAfter`, `note`, `refId`, giữ trường cũ. Flutter đọc đúng
  `transactionId`/`transactionType`, phân biệt lỗi mạng với danh sách rỗng.
- SQL đã backup vào `luminovels-before-library.bak` trước khi import.
- `Backend/scripts/build-cloud-library-seed.py` chỉ tách thể loại/truyện/chương từ
  `data-mssql.sql` thành `seed-cloud-library.sql`; không chạy script reset gốc.
- Import chỉ thêm bản ghi thiếu, ánh xạ ID qua slug, dùng author demo không thể đăng nhập,
  không tạo giao dịch mẫu vào ví người dùng. Chạy hai lần vẫn 21 truyện / 521 chương / 8 thể loại.
- Sửa `NovelServiceImpl` để ánh xạ DTO trong transaction khi OSIV tắt, khắc phục
  LazyInitializationException/HTTP 500 khi thư viện đã có dữ liệu.
- HTTPS đã kiểm tra danh sách, chi tiết truyện, danh sách chương và giải mã chương miễn phí
  thành công (1.142 ký tự). Shadow Academy chương 6 LOCKED, giá 25 xu.
- APK đã cài đè bằng ADB, giữ dữ liệu đăng nhập; Downloads trên Windows và link Azure đã cập nhật.

## Cập nhật SePay Test Mode — 31/10/2026

Backend hiện dùng `PAYMENT_PROVIDER=sepay` với tài khoản mô phỏng Vietcombank
`0000000001`. Hướng dẫn dashboard và mô phỏng: [SEPAY_TEST_MODE.md](SEPAY_TEST_MODE.md).
Các ghi chú MoMo phía dưới là kết quả triển khai trước khi chuyển provider.

SQL đã backup trước khi chạy migration thêm `sepay_test_receipts`; hiện có 16 bảng,
giữ `JPA_DDL_AUTO=validate`. HTTPS webhook đã kiểm tra thực tế: unsigned 401,
HMAC hợp lệ với giao dịch không liên quan 200, body bị sửa 401. Sau khi cấu hình
API Key và VA, giao dịch mô phỏng từ dashboard đã hoàn tất: order COMPLETED,
payment SUCCESS, số dư 100 xu, đúng một receipt và một lần cộng xu.

Kiểm thử: 32 backend test đạt (gồm HTTP/H2 commit, replay, API Key/VA, lịch sử ví và API thư viện có dữ liệu), 13 Flutter test đạt,
`flutter analyze --no-pub` không có issue. QR image endpoint trả 200 `image/png`.

APK SePay mới: `https://luminovels-prm393-demo.japaneast.cloudapp.azure.com/downloads/luminovels-sepay-test.apk`.
Kích thước 60,518,450 bytes; SHA-256 local và VM khớp:
`359da29a11272dec792c58cd7f587c043878a862f6095f2d1267226d3c58470b`.
ZIP integrity hợp lệ, gồm arm64-v8a / armeabi-v7a / x86_64. Chưa chạy trên thiết bị Android.

Người dùng chọn xác thực **API Key** trên dashboard. Runtime chuyển sang
`SEPAY_WEBHOOK_AUTH_MODE=apikey`; giá trị key lưu riêng trong `.env`, không ghi trong tài liệu.
Kết quả HMAC nêu trên thuộc cấu hình trước đó. Sau khi chuyển mode, kiểm tra bằng
`python deploy/azure/probe-sepay-webhook.py` (key đúng 200, thiếu/sai key 401).

Tài khoản Vietcombank hộ kinh doanh trên dashboard yêu cầu VA. Đã cấu hình
`SEPAY_VIRTUAL_ACCOUNT=SBSEPAYPENKMHSVIRUK`; webhook phải khớp cả tài khoản gốc và VA.
QR của đơn tạo mới dùng VA làm người nhận. Trước bản sửa, request có VA trả 400
`Unexpected test bank account.` do backend chỉ chấp nhận `subAccount` rỗng.
Đã xác minh HTTPS sau triển khai: đúng VA + mã đơn không tồn tại trả 200 (không cộng xu),
sai hoặc thiếu VA trả 400; thiếu/sai API Key trả 401. Giao dịch thực cần được SePay
gửi lại hoặc phát lại từ dashboard để hoàn tất đơn đang chờ.

Đã xác nhận giao dịch từ dashboard hoàn tất trong SQL. Số dư cũ trên app là vấn đề
làm mới hồ sơ: màn hình nạp xu nay có nút **Làm mới số dư**, và tải lại hồ sơ khi
vào màn hình hoặc kéo xuống. Widget test xác minh số dư thay đổi sau khi bấm làm mới.

Máy Azure for Students đã tạo ngày 31/10/2026 (Asia/Saigon): `luminovels-vm`, Japan East, x86-64, 2 vCPU / 4 GiB, Public IP `20.46.180.165`. IP hiện tại không thay thế cho hostname HTTPS.

## Đã triển khai

- SSH: `azureuser@20.46.180.165`; private key nằm trên máy Windows ở `E:/PRM393/luminovels-vm_key.pem`, không nằm trong repo.
- Thư mục máy chủ: `/home/azureuser/luminovels`.
- Docker Engine và Docker Compose cài từ repository chính thức Docker.
- Backend JAR chạy bằng image Java 21, profile `azure-vm`; backend chỉ bind host loopback `127.0.0.1:8080`.
- SQL Server 2022 Developer cho demo môn học, database `luminovels`, volume `luminovels_sql_data`.
- Redis có password và AOF, volume `luminovels_redis_data`.
- Không public cổng SQL/Redis. Caddy sẽ public 80/443 sau khi có DNS.
- Schema đã tạo từ entity, sau đó chuyển `JPA_DDL_AUTO=validate`; `spring.sql.init.mode=never` không chạy seed/script DROP local.
- Đã thêm hai gói xu mẫu và thư viện từ fixtures trong repo: 21 truyện, 521 chương, 8 thể loại. Không import/reset tài khoản hoặc ví của người dùng.
- Secret riêng của VM ở `deploy/azure/.env` (gitignored) và `/home/azureuser/luminovels/.env` (mode 600). Không paste nội dung ra chat hoặc đưa vào Git.
- Gmail SMTP dùng cấu hình mail hiện có. Chưa gửi email, tạo user hoặc thực hiện giao dịch MoMo thật để kiểm tra.

## Xác minh thực tế trên VM

`verify-runtime.sh` đã chạy đạt:
- Redis trả PONG.
- SQL có 15 bảng, 2 gói xu; dữ liệu còn sau khi recreate backend ở chế độ validate.
- `http://127.0.0.1:8080/api/app/health` trả `{"status":"UP"}`.
- API gói xu yêu cầu đăng nhập, trả 401 khi gọi không có token.
- Mẫu RAM sau khởi động: backend khoảng 307 MiB, SQL 632 MiB, Redis 14 MiB; đây không phải benchmark dưới tải.

## DNS và HTTPS đã nối

1. Azure Portal > VM > bấm Public IP > Configuration > đặt DNS name label và Save. Dùng FQDN Azure cấp, không tự đoán suffix.
2. VM > Networking > Network settings > NSG inbound: cho phép TCP 80 và 443 từ Internet. SSH 22 nên giới hạn IP quản trị khi thuận tiện. Không cần mở 8080, 1433 hoặc 6379.
3. Sau khi có hostname thật, chạy từ gốc repo:

```powershell
python deploy/azure/prepare-env.py --public-host YOUR-ACTUAL-FQDN
scp -i E:/PRM393/luminovels-vm_key.pem deploy/azure/.env azureuser@20.46.180.165:/home/azureuser/luminovels/.env
ssh -i E:/PRM393/luminovels-vm_key.pem azureuser@20.46.180.165 'cd /home/azureuser/luminovels && chmod 600 .env && sudo docker compose up -d backend caddy'
```

Script giữ nguyên password DB/Redis đã có, chỉ cập nhật hostname/base URL. Không xóa rồi tạo lại `.env` sau khi SQL volume đã tồn tại vì sẽ mất đồng bộ password.

Caddy tự cấp và gia hạn certificate cho hostname public khi DNS đã trỏ đúng VM và cổng challenge mở. Caddy đã chạy với hostname `luminovels-prm393-demo.japaneast.cloudapp.azure.com`. Health và trang redirect đều trả 200 từ Internet, TLS được xác minh mà không bỏ kiểm tra certificate.

## Callback và APK sau HTTPS

Profile azure-vm lấy `PUBLIC_BASE_URL`:
- redirect: `/payment-result.html`.
- IPN: `/api/orders/momo/callback`.

Không cần ngrok, Render, Azure SQL managed, Upstash hoặc Resend để chạy stack này. Các profile cũ vẫn giữ riêng để dùng lại nếu cần.

Sau khi HTTPS hoạt động, build APK bằng SDK phù hợp project:

```powershell
cd Frontend
flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-ACTUAL-FQDN/api
```

Nếu app đã cài giữ URL local, đổi lại trong Tài khoản > Cấu hình Backend. URL lưu trên máy ưu tiên hơn URL lúc build.

## Lệnh vận hành

```powershell
ssh -i E:/PRM393/luminovels-vm_key.pem azureuser@20.46.180.165 'cd /home/azureuser/luminovels && sudo docker compose ps -a'
ssh -i E:/PRM393/luminovels-vm_key.pem azureuser@20.46.180.165 'bash /home/azureuser/luminovels/verify-runtime.sh'
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu. Trước khi cập nhật/migrate DB, cần backup; không chạy schema-mssql.sql/data-mssql.sql local trên DB đã có dữ liệu.

Tắt VM bằng Stop trong Azure Portal và kiểm tra trạng thái Stopped (deallocated) khi không dùng để giảm tiền compute; disk/Public IP vẫn có thể phát sinh phí. MoMo callback không hoạt động khi VM tắt. Auto-shutdown/budget chưa được cấu hình trong lần triển khai này.

## Kết quả sau khi nối HTTPS

Base URL public: `https://luminovels-prm393-demo.japaneast.cloudapp.azure.com`.

- API: `/api`; health: `/api/app/health`; Swagger: `/swagger-ui/index.html`.
- Redirect: `/payment-result.html`; IPN: `/api/orders/momo/callback`.
- Gmail SMTP port 587 truy cập được từ VM; chưa gửi email thật để kiểm thử.
- Thử tạo link MoMo trên sandbox chính thức với URL mới vẫn trả `resultCode=99`, `payUrl` không có. Không thực hiện thanh toán hoặc trừ tiền. Ba credential hiện tại trùng giá trị mặc định trong MomoConfig của repo. Việc hai file .env dùng cùng khóa là có chủ đích và không chứng minh khóa sai; nguồn gốc/hiệu lực khóa chưa được xác minh. Không được coi deploy HTTPS là đã sửa được lỗi gateway.
- Nếu có credential mới, sửa trực tiếp `deploy/azure/.env` rồi upload/recreate backend. Không gửi khóa vào chat; giữ nguyên DB_PASSWORD/REDIS_PASSWORD.
- APK release đã build thành công với API_BASE_URL trỏ hostname thật. Bản demo hiện dùng debug signing config của project; không phải cấu hình ký phát hành Play Store.

MoMo sandbox cũng đã được thử từ chính VM Azure, kết quả vẫn là 99; không chỉ là kết quả từ mạng máy Windows. Chứng chỉ HTTPS public được Let's Encrypt cấp và client xác minh thành công. Swagger public đã kiểm tra trả 200.

## APK đã phát hành cho demo

- Tải HTTPS: `https://luminovels-prm393-demo.japaneast.cloudapp.azure.com/downloads/luminovels-azure.apk`.
- File local: `Frontend/build/app/outputs/flutter-apk/app-release.apk`.
- Kích thước: 60,305,370 bytes (~57.5 MiB), gồm 3 ABI.
- SHA-256 local và file VM khớp: `67ed189b39341b8ad153d96406dff47cdfed10884097cecb1710377975fdab1b`.
- APK ZIP integrity hợp lệ, có quyền INTERNET và hostname Azure được nhúng trong AOT library.
- HTTPS HEAD trả 200, Content-Length đúng; tải Range trả 206. App config API trả link tải này.
- Không có điện thoại/emulator ADB kết nối, nên chưa xác minh thao tác trên thiết bị thật.
- Bản build đầu gặp lỗi incremental cache Kotlin khác ổ đĩa C:/E:. Đã tắt Kotlin incremental compilation và dùng in-process compiler trong `Frontend/android/gradle.properties`; build lại đạt. Script `deploy/azure/build-apk.ps1` dùng đúng SDK và các flag này để build lại.
- Caddy chỉ phục vụ thư mục downloads riêng, không phục vụ file .env hoặc private key.
