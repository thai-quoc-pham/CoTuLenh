# Học Cờ Tư Lệnh

Website tĩnh hướng dẫn Cờ Tư Lệnh, được xây lại từ file HTML do người dùng cung cấp. Nội dung mặc định theo phần hướng dẫn cotulenh.vn trong file nguồn; bảng đối chiếu 2017 được tách riêng.

## Chạy project

Mở `index.html` trực tiếp hoặc chạy một HTTP server trong thư mục này:

```bash
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## Cấu trúc

- `index.html`: nội dung và cấu trúc trang.
- `styles.css`: giao diện responsive.
- `script.js`: bộ lọc quân, hộp thông tin, sơ đồ tọa độ, lưới tầm đi và bài kiểm tra.
- `guided.css`, `guided.js`: lộ trình 7 bài, bài tập tọa độ, xếp quân, nhận diện 11 quân, thử nước đi và ván mẫu theo lượt.
- `capture.css`, `capture.js`: bàn tập 9×9 cho 11 ví dụ ăn quân, không ăn được và luật tấn công đặc biệt.
- `scenarios/`: dữ liệu, bộ chấm đáp án, lưu tiến độ và giao diện Phòng luyện tình huống gồm 12 thế cờ thuộc 5 chủ đề.
- `tests/scenario.test.js`: kiểm thử dữ liệu, ngưỡng đạt, chấm lần đầu và khôi phục tiến độ.
- `assets/`: 24 ảnh PNG tải từ thư mục Google Drive được cung cấp, gồm 22 ảnh quân hai phe, một ảnh bàn cờ và một ảnh mẫu. `assets/thumbs/` chứa bản JPEG thu nhỏ của 22 ảnh quân để trang tải nhanh.
- `assets/cutouts/`: 22 ảnh quân 3D nền trong suốt, được tách nền từ ảnh minh họa gốc bằng công cụ ImageGen. `assets/cutouts/board/` có bản thu nhỏ để bàn xếp quân tải nhanh.
- `assets/so-do-xep-quan-ban-dau.svg`: bản sơ đồ tọa độ tĩnh dạng chữ để đối chiếu hoặc in.
- `tools/generate_setup_svg.py`: script tạo lại sơ đồ xếp quân nếu cần chỉnh sửa.

Website không cần bước build hoặc thư viện JavaScript. Kết quả bài kiểm tra và tiến độ chi tiết của 7 bài được lưu cục bộ bằng `localStorage`: bài đang mở, bước trong từng bài, quân đang tập và các đáp án đã hoàn thành. Dữ liệu hoàn thành bài từ phiên bản cũ được chuyển sang định dạng mới khi người học mở trang. Nút “Học lại bài này” chỉ đặt lại bài hiện tại. Ảnh trong `assets/` hoạt động không cần mạng; font Google có font hệ thống dự phòng.

Phòng luyện tình huống lưu riêng theo từng câu. Chế độ có hướng dẫn cho thử lại và xem gợi ý; chế độ tự kiểm tra khóa đáp án đầu tiên và chỉ báo đạt mốc 80% sau khi làm đủ 12 câu. Có thể làm lại riêng một tình huống hoặc toàn bộ phần tự kiểm tra. Chạy kiểm thử bằng `node --test tests/scenario.test.js`.

Trong phần xếp quân, rê chuột hoặc dùng phím Tab để xem tên quân và vị trí; trên màn hình cảm ứng, chạm vào quân. Bàn cờ tự thu vừa màn hình, có nút phóng to và các nút bật/tắt lớp tọa độ, địa hình, quân cờ. Bài 2 cho làm quen với 3 quân; thử thách đầy đủ bên dưới yêu cầu xếp 19 quân phe Đỏ và lưu một thành tích riêng khi hoàn thành. Bàn thử thách hiển thị đủ 12 hàng với biển, sông và cầu bằng màu riêng. Có thể làm lại bàn mà vẫn giữ thành tích đã đạt.

## Giới hạn học liệu

Lưới tầm đi 9×9 và bài tập chọn ô chỉ minh họa hướng, khoảng cách cơ bản trên bàn trống. Bàn tập ăn quân đưa ra một ví dụ ăn được và một ví dụ không ăn được cho từng quân cơ động; Tổng Hành Dinh trạng thái thường không có ví dụ ăn được. Ví dụ Hải quân phân biệt việc tiến vào ô nước với ô đất, không mô phỏng toàn bộ hỏa lực. Ván 6 lượt là chuỗi quyết định có hướng dẫn, không phải ván đấu có đối thủ tự động. Chưa có bộ máy xác thực đầy đủ vật cản, địa hình, thế chiếu, cách ăn quân và các tổ hợp đặc biệt; cần đối chiếu với phiên bản luật đang chơi.

12 thế cờ mới là những câu hỏi cố định theo phiên bản web cộng đồng, không phải một game engine tính nước đi. Câu A03 chỉ phân biệt đi với cơ chế bắn của Pháo; D02 chỉ nhận diện nguy cơ phòng không, không tính chính xác vùng bắn. Khi bổ sung dữ liệu, đặt `verified: false` cho tình huống chưa đối chiếu nguồn để không đưa vào bài tự kiểm tra. Bước thử nghiệm với ba người mới chơi trong kế hoạch Giai đoạn 2 cần được thực hiện riêng với người dùng thật.

Sơ đồ xếp quân ban đầu dùng cách bố trí của bản web tại thời điểm xây dựng. Bảng số lượng quân trong file HTML tham khảo có hai chỗ khác với vị trí khởi đầu của bản game: Công binh là 2 và Tên lửa là 1 quân mỗi phe. Website này đã đối chiếu và dùng số lượng theo bản game web.
