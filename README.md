# 🌕 WEB 3D TRUNG THU TẶNG NGƯỜI YÊU (MID-AUTUMN 3D LOVE GIFT)

Món quà công nghệ 3D lãng mạn, đậm chất Tết Trung Thu truyền thống kết hợp hiện đại bằng **Three.js** dành tặng cho người thương / người yêu / crush.

---

## ✨ Các tính năng nổi bật

1. **Mặt Trăng Cung Trăng 3D:** Khổng lồ, chân thực với các miệng hố va chạm (Craters), bóng Thỏ Ngọc và vầng hào quang dạ quang phát sáng bồng bềnh.
2. **Đèn Ông Sao 3D Truyền Thống Việt Nam:** Ngôi sao 5 cánh viền tre vàng, giấy kiếng đỏ phát sáng với ngọn nến lung linh bên trong cùng tua rua ngũ sắc đung đưa theo gió.
3. **Đàn Thiên Đăng (Đèn Trời):** Hàng chục chiếc đèn lồng mang ánh lửa ấm áp bay lơ lửng lên bầu trời đêm.
4. **Tính Năng "Thả Đèn Trời Ước Nguyện":** Người yêu có thể gõ trực tiếp điều ước của mình hoặc chọn nhanh gợi ý ngọt ngào, chiếc đèn sẽ in dòng chữ đó và bay vút lên Cung Trăng kèm tiếng chuông điều ước lung linh.
5. **Bức Thư Tình Cung Trăng (Love Letter):** Hiệu ứng gõ chữ máy đánh chữ (Typewriter) từng dòng lãng mạn, nút gửi ngàn nụ hôn bung tỏa trái tim và pháo hoa rực rỡ.
6. **Bầu Trời Ngàn Sao, Sao Băng & Pháo Hoa:** Sao băng vút qua bầu trời theo chu kỳ, chạm/click bất kỳ đâu trên màn hình để bắn pháo hoa ánh sáng.
7. **Nhạc Nền Tình Ca Lãng Mạn:** Tích hợp sẵn nhạc Mp3 du dương, kèm hệ thống dự phòng Hộp Âm Nhạc / Piano Chime ngũ cung không bao giờ lỗi.
8. **Tương thích hoàn hảo:** Xoay 360 độ cực mượt trên cả điện thoại (cảm ứng) và máy tính (chuột).

---

## 🛠️ Hướng dẫn tùy biến thông tin của bạn (`js/config.js`)

Mở file `js/config.js` để chỉnh sửa các thông tin theo ý muốn:

- `senderName`: Tên của bạn (ví dụ: `"Hoàng"`).
- `receiverName`: Tên người yêu của bạn (ví dụ: `"Mai Ánh"`, `"Em Yêu"`).
- `title`: Tiêu đề web.
- `anniversaryDate`: Ngày bắt đầu yêu nhau theo định dạng `"YYYY-MM-DD"` (ví dụ: `"2023-11-20"`). Web sẽ tự động tính số ngày bên nhau!
- `letter`: Nội dung bức thư tình (tiêu đề, các đoạn văn tình cảm, chữ ký).
- `wishPresets`: Các câu chúc / điều ước mẫu khi thả đèn.
- `music.audioUrl`: Link bài hát bạn muốn phát (hoặc chép file `.mp3` vào thư mục `assets/audio/`).

---

## 🚀 Cách mở và chạy thử trên máy tính

Vì Three.js sử dụng ES Modules (`type="module"`), bạn nên mở bằng một local web server nhỏ:

### Cách 1: Dùng Python (Có sẵn trên hầu hết máy Mac/Windows)
Mở Terminal trong thư mục này và gõ:
```bash
python3 -m http.server 8000
```
Sau đó mở trình duyệt vào địa chỉ: `http://localhost:8000`

### Cách 2: Dùng VS Code Live Server
Nếu bạn dùng Visual Studio Code:
1. Cài extension **Live Server**.
2. Nhấp chuột phải vào file `index.html` -> Chọn **Open with Live Server**.

### Cách 3: Dùng Node.js
```bash
npx serve .
```

---

## 🌐 Cách đưa lên mạng miễn phí để gửi link cho người yêu

Để người yêu của bạn có thể mở xem trực tiếp trên điện thoại ở bất kỳ đâu:

### Cách nhanh nhất: Dùng Vercel (Miễn phí 100% trong 1 phút)
1. Đăng ký tài khoản tại [vercel.com](https://vercel.com).
2. Kéo thả toàn bộ thư mục `WEB_3D_TRUNG_THU` vào trang dashboard của Vercel (hoặc liên kết với GitHub).
3. Vercel sẽ cấp ngay cho bạn một link cực đẹp (ví dụ: `trung-thu-tang-em.vercel.app`) để gửi ngay cho người yêu!

### Cách dùng GitHub Pages:
1. Tạo một repository mới trên GitHub (ví dụ: `trung-thu-tang-em`).
2. Tải toàn bộ các file trong thư mục này lên repository.
3. Vào mục **Settings** -> **Pages** -> Tại nhánh chọn `main` -> Nhấn **Save**.
4. Link web sẽ có dạng: `https://ten-ban.github.io/trung-thu-tang-em/`.

---

❤️ *Chúc hai bạn có một mùa Tết Trung Thu thật ấm áp, ngọt ngào và hạnh phúc bên nhau!*
