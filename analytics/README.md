# Ghi nhận trình duyệt mở website lần đầu

GitHub Pages chỉ phục vụ tệp tĩnh; mã trong trình duyệt không được cầm khóa ghi GitHub. Vì vậy, `client.js` gọi Cloudflare Worker, còn Worker giữ khóa GitHub ở dạng **Secret** và cập nhật `analytics/data/visitors.json` trong repository của website.

## Phạm vi đếm

- Mỗi trình duyệt lưu một UUID ngẫu nhiên trong `localStorage`. Mở lại cùng trình duyệt không tính thêm lượt; xóa dữ liệu trang, dùng trình duyệt khác hoặc chế độ riêng tư có thể được tính là mới. Đây không phải cách nhận diện chính xác thiết bị vật lý.
- Worker chỉ ghi HMAC của UUID và ngày ghi nhận. Mã UUID gốc và địa chỉ IP không được lưu trong JSON. Trình duyệt bật Global Privacy Control hoặc Do Not Track sẽ không gửi lượt.
- JSON trong repository công khai cũng công khai. Không thêm thông tin cá nhân vào tệp này.

## Thiết lập

1. Đưa toàn bộ website lên repository [`thai-quoc-pham/CoTuLenh`](https://github.com/thai-quoc-pham/CoTuLenh). Repository hiện dùng nhánh `master`; tệp dữ liệu nằm tại `analytics/data/visitors.json` ở gốc project.
2. Tạo nhánh `visitor-data` từ nhánh chứa website. Worker nên ghi vào nhánh này để mỗi lượt mới không kích hoạt bản dựng GitHub Pages của nhánh website. Tệp JSON mẫu phải tồn tại trên nhánh đó.
3. Trên GitHub, tạo **fine-grained personal access token** chỉ áp dụng cho repository website và cấp quyền **Contents: Read and write**. Không đặt token vào bất kỳ tệp nào của website hoặc commit Git.
4. Tạo Cloudflare Worker, dùng nội dung `worker/worker.mjs` làm mã Worker (hoặc triển khai từ `worker/wrangler.toml`). Đặt các biến văn bản:

   | Tên | Ví dụ |
   | --- | --- |
   | `GITHUB_OWNER` | `thai-quoc-pham` |
   | `GITHUB_REPO` | `CoTuLenh` |
   | `GITHUB_BRANCH` | `visitor-data` |
   | `GITHUB_DATA_PATH` | `analytics/data/visitors.json` |
   | `ALLOWED_ORIGIN` | `https://thai-quoc-pham.github.io` |

   Nếu dùng tên miền riêng, đặt `ALLOWED_ORIGIN` là origin của tên miền đó. Có thể cho phép nhiều origin bằng dấu phẩy. Origin chỉ gồm giao thức và tên miền, không gồm đường dẫn trang.

5. Đặt hai **Secret** trong Worker: `GITHUB_TOKEN` là token ở bước 3; `VISITOR_SALT` là chuỗi ngẫu nhiên tối thiểu 32 ký tự. Có thể tạo salt bằng `openssl rand -hex 32`; giữ salt ổn định khi chạy thật vì đổi salt sẽ làm các trình duyệt cũ bị đếm lại.
6. Triển khai Worker. Lấy URL HTTPS của Worker, điền vào `endpoint` trong `analytics/config.js`, rồi đưa thay đổi này lên GitHub Pages. Không thêm `/visit` vào `endpoint`.
7. Mở website trong một trình duyệt chưa từng truy cập, rồi kiểm tra `analytics/data/visitors.json` trên nhánh `visitor-data`. `totalBrowsers` và `byDay` phải tăng 1; tải lại cùng trình duyệt không tăng tiếp. Có thể xem thống kê tổng hợp ở `<URL_WORKER>/stats` khi yêu cầu gửi đúng header `Origin`.

Trang `thong-ke.html` ở website chỉ hiển thị tổng số và lượt theo ngày từ Worker; trang này không công bố mã trình duyệt.

Nếu chưa triển khai Worker, để `endpoint: ''`. Website vẫn chạy bình thường và chưa gửi thống kê.

## Giới hạn vận hành

Mỗi trình duyệt mới tạo một commit lên nhánh dữ liệu. Cách này phù hợp cho website nhỏ; lượng truy cập lớn nên chuyển sang cơ sở dữ liệu có ghi nguyên tử và đồng bộ JSON theo lịch. Worker thử lại khi GitHub báo xung đột SHA, nhưng có thể trả lỗi tạm thời nếu nhiều lượt đến cùng lúc; trình duyệt sẽ thử lại vào lần mở trang tiếp theo.

Kiểm tra `Origin` và CORS giúp giới hạn trình duyệt gửi yêu cầu từ website khác, nhưng không chống được người cố tình gọi API trực tiếp. Hãy bật giới hạn tần suất của Cloudflare khi đưa vào sử dụng công khai. Nếu repository bị spam hoặc chi phí tăng, tắt thống kê bằng cách xóa URL trong `analytics/config.js`.

Chạy kiểm thử: `node --test tests/visitor-analytics.test.mjs` từ thư mục gốc website.
