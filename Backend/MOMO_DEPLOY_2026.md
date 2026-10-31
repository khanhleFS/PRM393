# MoMo và deployment cho PRM393

Đối chiếu tài liệu chính thức ngày 30/10/2026. Giá là giá niêm yết, chưa mặc định gồm thuế, tên miền hoặc dịch vụ phụ. Không có hạ tầng cloud nào được tạo trong lần sửa này.

## Lỗi hiện tại và thay đổi đã làm

`code: 3003` thuộc `CommonErrorCode.EXTERNAL_SERVICE_ERROR` của ứng dụng. Backend trước đây bỏ mất `resultCode` gốc của MoMo nên riêng JSON này chưa xác định được nguyên nhân từ phía MoMo. Không thể khẳng định thay URL sẽ xử lý được lỗi từ chối chung.

Đã xóa giá trị redirect localhost của web cũ và IPN ngrok cũ khỏi `Backend/.env`; ba biến redirect/IPN/mobile hiện để trống vì chưa có hostname public thật. Giữ nguyên các khóa thanh toán. Thanh toán sẽ báo thiếu cấu hình rõ ràng; không coi trạng thái này là đã sửa xong kết nối MoMo.

Backend đã được sửa để trả kèm `MoMo resultCode=...` khi gateway từ chối và ghi log mã gốc cùng requestId, không ghi khóa/signature. URL thiếu hoặc sai định dạng được phát hiện trước khi tạo Payment/gọi gateway. Android chưa đăng ký scheme `novelapp://`, nên bỏ mặc định này; mobile dùng web redirect khi biến mobile trống.

Có thêm trang public `/payment-result.html`, chỉ hướng dẫn quay lại app và kiểm tra số dư. Trang này không đọc query string để tự xác nhận thành công hoặc cộng xu. Số dư vẫn dựa trên xác minh giao dịch ở backend.

Tài liệu MoMo:
- [Thanh toán captureWallet, redirectUrl, ipnUrl và chữ ký](https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime/).
- [IPN server-to-server và xử lý kết quả](https://developers.momo.vn/v3/vi/docs/payment/api/result-handling/notification/).
- [Mã kết quả gốc của MoMo](https://developers.momo.vn/v3/docs/payment/api/result-handling/resultcode/).

## Khi có hostname public

Chạy từ thư mục gốc repo, thay hostname minh họa bằng hostname thật:

```powershell
./Backend/scripts/configure-momo.ps1 -BackendPublicUrl 'https://YOUR-REAL-HOST' -WhatIf
./Backend/scripts/configure-momo.ps1 -BackendPublicUrl 'https://YOUR-REAL-HOST'
```

Script đặt:
- `DEV_MOMO_REDIRECT_URL` = `https://YOUR-REAL-HOST/payment-result.html`.
- `DEV_MOMO_IPN_URL` = `https://YOUR-REAL-HOST/api/orders/momo/callback`.
- `DEV_MOMO_MOBILE_REDIRECT_URL` = rỗng để dùng trang web trên.

Có thể truyền `-RedirectUrl` nếu nhóm có trang kết quả web riêng. `BackendPublicUrl` là gốc backend, không thêm `/api` vì script tự ghép route. Script không kiểm tra DNS hoặc khả năng truy cập thực tế; cần kiểm tra từ Internet sau khi deploy.

Quan trọng: backend hiện không có cơ chế tự nạp file `.env` trong Spring. Nếu chạy bằng IDE, phải dùng cấu hình EnvFile/environment variables tương ứng; nếu Docker, dùng `env_file` hoặc cấu hình biến môi trường của nhà cung cấp. Đổi file rồi phải reload môi trường và restart backend.

Hai compose hiện tại nạp `.env` ở GỐC repo, không nạp `Backend/.env`. Nếu dùng chúng, chọn đúng file:

```powershell
./Backend/scripts/configure-momo.ps1 -BackendPublicUrl 'https://YOUR-REAL-HOST' -EnvPath ./.env
```

Compose gốc còn tham chiếu frontend React đã chuyển chỗ và mount SQL ở đường dẫn project cũ. Cần chuẩn bị compose triển khai riêng cho Flutter hiện tại trước khi dùng trên VPS.

Sau khi deploy: mở trang redirect, bảo đảm callback POST public không bị login/challenge/proxy chặn, tạo giao dịch sandbox, lấy `resultCode` gốc và kiểm tra IPN/chữ ký cùng số dư. Chỉ dùng credential đúng môi trường sandbox/production. Chưa gửi giao dịch thật trong lần kiểm tra này.

## Phương án ưu tiên cho sinh viên: Azure for Students

[Azure for Students](https://learn.microsoft.com/azure/education-hub/about-azure-for-students) cung cấp $100 credit có hạn một năm, không yêu cầu thẻ tín dụng, nếu đủ điều kiện và xác minh được email trường. Đây là credit có hạn, không phải toàn bộ máy chủ miễn phí vĩnh viễn. Có thể dùng một VM Linux x86-64 để chạy backend, Redis và SQL Server bằng Docker; chọn dung lượng/region theo số tiền portal ước tính và thời gian demo.

Đây là hướng nên thử đầu tiên cho đồ án nếu tài khoản FPT đủ điều kiện. [Azure cho phép authenticated SMTP port 587](https://learn.microsoft.com/azure/virtual-network/troubleshoot-outbound-smtp-connectivity), nên không cần chuyển Gmail OTP sang HTTPS API chỉ vì chọn Azure VM. Nếu ngân sách credit không đủ cho VM chạy liên tục, có thể tắt VM khi không demo; khi tắt, endpoint/IPN không hoạt động và storage/IP vẫn có thể tính phí.

## VPS trả phí thấp: gom backend + MSSQL + Redis

Với stack hiện tại, nên chọn Linux x86-64, 4 GB RAM cho demo nhỏ; 8 GB thoải mái hơn. Đây là đề xuất cấu hình cho cả stack, không phải benchmark. [SQL Server Linux](https://learn.microsoft.com/sql/linux/install-upgrade/setup) cần tối thiểu 2 GB RAM và x64; [container SQL Server](https://learn.microsoft.com/sql/linux/install-upgrade/quickstart-install-docker) không hỗ trợ host ARM/emulation.

[Giá Hetzner sau điều chỉnh 15/06/2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) ở Đức/Phần Lan: CX23 4 GB €5.49/tháng, CX33 8 GB €8.49/tháng. [IPv4](https://docs.hetzner.com/cloud/servers/primary-ips/overview/) thêm €0.50/tháng. Tổng tương ứng €5.99 hoặc €8.99/tháng trước thuế, chưa tên miền/backup. Trang [Cost-Optimized](https://www.hetzner.com/cloud/cost-optimized/) hiện hiển thị không sẵn hàng cho CX23/CX33, nên đây là mốc giá tham khảo, không đảm bảo mua được ngay; giá Singapore khác EU.

[Hetzner không chặn port 587](https://docs.hetzner.com/cloud/servers/faq/) nhưng mặc định chặn 25/465, nên dùng Gmail STARTTLS 587 như cấu hình hiện có.

Mô hình triển khai: Caddy/Nginx HTTPS public -> Spring Boot; Spring Boot -> MSSQL và Redis qua Docker network riêng. Dữ liệu MSSQL có volume và backup. Không cần public cổng 1433/6379. Redis dùng cho token phải giữ trạng thái phù hợp, không chỉ coi là cache có thể bỏ tùy ý.

## Gần $0: tách dịch vụ và chấp nhận thay đổi

- [Render Free](https://render.com/docs/free): backend có HTTPS public nhưng ngủ sau 15 phút không có traffic, thức dậy khoảng một phút; không có disk bền vững. Điều này có thể làm IPN hết thời gian chờ. Chặn SMTP 25/465/587, nên Gmail OTP qua `JavaMailSender` hiện tại phải chuyển sang nhà cung cấp email HTTPS API hoặc gói khác.
- [Azure SQL Database Free](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier?view=azuresql) và [FAQ](https://learn.microsoft.com/azure/azure-sql/database/free-offer-faq): mỗi DB có 100,000 vCore-seconds/tháng, 32 GB data và 32 GB backup; tối đa 10 DB/subscription. Đây là dịch vụ Azure SQL Database, không phải một SQL Server VM đầy đủ. Cần kiểm tra tương thích schema, quyền, dialect và URL JDBC; chọn auto-pause khi hết quota nếu muốn tránh phát sinh phí. Không phải mọi loại subscription sinh viên đều tương thích.
- [Upstash Redis Free](https://upstash.com/pricing/redis): 256 MB, 500K commands/tháng. Spring dùng kết nối Redis TCP/TLS và credential của Redis; REST URL/token không tự thay thế cho Lettuce. Cấu hình trên cloud bằng `SPRING_DATA_REDIS_*` (host/port/password/ssl.enabled) hoặc URL rediss thích hợp.

Mô hình này không đảm bảo MoMo hoạt động ổn định 24/7 ở mức $0, và không phải chỉ đổi hai URL là dùng được ngay.

## Railway

[Free/Hobby pricing](https://railway.com/pricing): trial $5/30 ngày, sau đó Free có $1 credit/tháng và giới hạn 0.5 GB RAM/service; không đủ để chứa SQL Server yêu cầu 2 GB. Hobby là mức sử dụng tối thiểu $5/tháng, vượt tài nguyên thì trả thêm; không phải $5 trọn bộ backend + MSSQL + Redis. [Free/Trial/Hobby đều chặn SMTP](https://docs.railway.com/networking/outbound-networking), nên vẫn phải đổi cách gửi OTP. Railway thuận tiện vận hành nhưng không nên coi là lựa chọn miễn phí cho nguyên stack này.

## Oracle Free và ARM

[Tài liệu Always Free hiện tại](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) ghi Ampere A1 ARM tương đương tổng 2 OCPU/12 GB RAM cho Always Free tenancy; không áp dụng máy móc hướng dẫn cũ nói 4 OCPU/24 GB. Máy AMD micro miễn phí chỉ có 1 GB RAM mỗi VM. ARM chạy Spring/Redis được nếu image phù hợp nhưng không phải host được hỗ trợ cho SQL Server container; phải đưa SQL sang dịch vụ khác. Vì vậy không ưu tiên Oracle Free nếu muốn gom đúng stack hiện tại lên một máy.

## Android phát hành riêng

Backend/DB/Redis chạy trên server; ứng dụng Android chạy trên điện thoại. Build APK release, cấu hình API base URL HTTPS rồi phát hành cho nhóm/giảng viên bằng [Firebase App Distribution](https://firebase.google.com/docs/app-distribution), là [sản phẩm không tính phí](https://firebase.google.com/pricing). Không cần thuê một server để chạy APK. Đã bổ sung quyền INTERNET trong manifest chính để bản release có thể gọi API; trước đây quyền này chỉ có trong debug/profile.

## Xác minh thay đổi

Chạy Java 21 cho Maven, vì JAVA_HOME hiện tại trên máy trỏ Java 17 dù `java -version` ngoài PATH là 21:

```powershell
$env:JAVA_HOME = 'C:/Program Files/Java/jdk-21'
cd Backend
mvn -q -Dtest=PaymentServiceImplTest test
```

Bốn test thanh toán đã đạt: thiếu redirect, thiếu/sai IPN, mobile fallback về web, và giữ `resultCode` gateway khi bị từ chối. HTTP giả chỉ chạy localhost, không gọi MoMo thật. Script cấu hình đã kiểm tra giữ nguyên biến khác, ghép đúng URL, chế độ WhatIf và từ chối HTTP localhost.
