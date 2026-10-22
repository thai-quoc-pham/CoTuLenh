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
- `intersection-boards.css`, `assets/board-intersections-*.svg`: đường giao điểm cho các bàn luyện tập 9×9 và 7×6.
- `script.js`: bộ lọc quân, hộp thông tin, sơ đồ tọa độ, lưới tầm đi và bài kiểm tra.
- `guided.css`, `guided.js`: lộ trình 7 bài, bài tập tọa độ, xếp quân, nhận diện 11 quân, thử nước đi và ván mẫu theo lượt.
- `capture.css`, `capture.js`: bàn tập 9×9 cho 11 ví dụ ăn quân, không ăn được và luật tấn công đặc biệt.
- `scenarios/`: dữ liệu, bộ chấm đáp án, lưu tiến độ và giao diện Phòng luyện tình huống gồm 12 thế cờ thuộc 5 chủ đề.
- `play/`: engine nước đi dùng chung cho người và AI, Minimax với Alpha-Beta Pruning, Web Worker và giao diện ván đấu.
- `analytics/`: mã ghi nhận trình duyệt mới, Cloudflare Worker và tệp JSON thống kê; xem `analytics/README.md` để triển khai khi dùng GitHub Pages.
- `tests/scenario.test.js`: kiểm thử dữ liệu, ngưỡng đạt, chấm lần đầu và khôi phục tiến độ.
- `tests/play.test.js`: kiểm thử luật di chuyển, vật cản, chở quân, chiếu bí, giữ căn cứ và ba mức AI.
- `tests/visitor-analytics.test.mjs`: kiểm thử ghi một lần, ẩn mã gốc và xử lý xung đột cập nhật JSON.
- `assets/`: 24 ảnh PNG tải từ thư mục Google Drive được cung cấp, gồm 22 ảnh quân hai phe, một ảnh bàn cờ và một ảnh mẫu. `assets/thumbs/` chứa bản JPEG thu nhỏ của 22 ảnh quân để trang tải nhanh.
- `assets/cutouts/`: 22 ảnh quân 3D nền trong suốt, được tách nền từ ảnh minh họa gốc bằng công cụ ImageGen. `assets/cutouts/board/` có bản thu nhỏ để bàn xếp quân tải nhanh.
- `assets/so-do-xep-quan-ban-dau.svg`: bản sơ đồ tọa độ tĩnh dạng chữ để đối chiếu hoặc in.
- `tools/generate_setup_svg.py`: script tạo lại sơ đồ xếp quân nếu cần chỉnh sửa.

Website không cần bước build hoặc thư viện JavaScript. Kết quả bài kiểm tra và tiến độ chi tiết của 7 bài được lưu cục bộ bằng `localStorage`: bài đang mở, bước trong từng bài, quân đang tập và các đáp án đã hoàn thành. Dữ liệu hoàn thành bài từ phiên bản cũ được chuyển sang định dạng mới khi người học mở trang. Nút “Học lại bài này” chỉ đặt lại bài hiện tại. Ảnh trong `assets/` hoạt động không cần mạng; font Google có font hệ thống dự phòng.

Phòng luyện tình huống lưu riêng theo từng câu. Chế độ có hướng dẫn cho thử lại và xem gợi ý; chế độ tự kiểm tra khóa đáp án đầu tiên và chỉ báo đạt mốc 80% sau khi làm đủ 12 câu. Có thể làm lại riêng một tình huống hoặc toàn bộ phần tự kiểm tra. Chạy kiểm thử bằng `node --test tests/scenario.test.js`.

## Đấu với AI

Vào mục **Đấu với AI** trên trang. Chọn Đỏ hoặc Xanh, chọn Dễ/Trung bình/Khó, tùy chọn đồng hồ và bấm **Ván mới**. Các mức lần lượt tìm sâu 1/2/3 lượt với giới hạn nhánh ở các mức sâu hơn. AI chạy trong Web Worker khi trang mở qua HTTP; mở file trực tiếp sẽ dùng JavaScript trên luồng chính. Có thể hoàn tác một cặp lượt hoặc đầu hàng. Chạy toàn bộ kiểm thử bằng `node --test tests/*.test.js`.

Bàn cờ được vẽ theo ảnh tham chiếu: 11 × 12 giao điểm trên khung rộng 10 khoảng, cao 11 khoảng. Khoảng ngang dài hơn khoảng dọc, nên khung bàn rộng hơn chiều cao theo ảnh mẫu. Dải xanh bên trái tới đường cột C và dải xanh giữa hàng 6–7 là mặt nước; cầu ở F và H. Engine vẫn dùng phân loại tọa độ của phiên bản web: A–B là nước, C cùng D6/E6/D7/E7 là ven nước, F6/F7/H6/H7 là cầu.

Engine dùng một tập luật công khai cho cả người chơi và AI: quân chắn và địa hình, chở/tách quân, tiến vào hoặc bắn tại chỗ, an toàn Chỉ huy, chiếu bí và giữ căn cứ. Bản chơi thử quy ước Pháo/Tên lửa bắn xuyên tối đa một quân chắn, máy bay không đi vào vùng Phòng không/Tên lửa/Hải quân địch và giữ căn cứ tính sau mỗi lượt của bên kiểm soát. Những chi tiết luật gốc không được công khai đầy đủ cần được đối chiếu với engine của cotulenh.vn trước khi dùng để thi đấu chính thức.

Trong phần xếp quân, rê chuột hoặc dùng phím Tab để xem tên quân và vị trí; trên màn hình cảm ứng, chạm vào quân. Bàn cờ tự thu vừa màn hình, có nút phóng to và các nút bật/tắt lớp tọa độ, địa hình, quân cờ. Bài 2 cho làm quen với 3 quân; thử thách đầy đủ bên dưới yêu cầu xếp 19 quân phe Đỏ và lưu một thành tích riêng khi hoàn thành. Bàn thử thách hiển thị đủ 12 hàng với nước, ô hỗn hợp và cầu bằng màu riêng. Có thể làm lại bàn mà vẫn giữ thành tích đã đạt.

Quân trên các bàn tập đứng tại giao điểm của đường kẻ. Vùng bấm quanh từng giao điểm vẫn đủ rộng cho chuột, bàn phím và cảm ứng; địa hình cùng dấu nước đi nằm dưới hình quân.

## Giới hạn học liệu

Lưới tầm đi 9×9 và bài tập chọn ô chỉ minh họa hướng, khoảng cách cơ bản trên bàn trống. Bàn tập ăn quân đưa ra một ví dụ ăn được và một ví dụ không ăn được cho từng quân cơ động; Tổng Hành Dinh trạng thái thường không có ví dụ ăn được. Ví dụ Hải quân phân biệt việc tiến vào ô nước với ô đất, không mô phỏng toàn bộ hỏa lực. Ván 6 lượt là chuỗi quyết định có hướng dẫn. Bàn đấu AI là một phần riêng, có engine nước đi; các quy ước chưa xác minh đầy đủ được nêu ngay trong giao diện.

12 thế cờ mới là những câu hỏi cố định theo phiên bản web cộng đồng, không phải một game engine tính nước đi. Câu A03 chỉ phân biệt đi với cơ chế bắn của Pháo; D02 chỉ nhận diện nguy cơ phòng không, không tính chính xác vùng bắn. Khi bổ sung dữ liệu, đặt `verified: false` cho tình huống chưa đối chiếu nguồn để không đưa vào bài tự kiểm tra. Bước thử nghiệm với ba người mới chơi trong kế hoạch Giai đoạn 2 cần được thực hiện riêng với người dùng thật.

Sơ đồ xếp quân ban đầu dùng cách bố trí của bản web tại thời điểm xây dựng. Bảng số lượng quân trong file HTML tham khảo có hai chỗ khác với vị trí khởi đầu của bản game: Công binh là 2 và Tên lửa là 1 quân mỗi phe. Website này đã đối chiếu và dùng số lượng theo bản game web.
