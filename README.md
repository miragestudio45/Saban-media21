# Chiến dịch Plâyme & Ia Drang

Prototype web 3D tương tác dùng React, TypeScript, Vite, Three.js và `@react-three/fiber`.

## Cách chạy

1. Cài Node.js bản LTS nếu máy chưa có.
2. Mở terminal trong thư mục project này.
3. Chạy `npm install`.
4. Chạy `npm run dev`.
5. Mở link local Vite hiển thị trong terminal, thường là `http://127.0.0.1:3007`.

## Căn chỉnh chiến thuật

- Bấm phím `C` để bật nút `CALIBRATE`.
- Bấm `CALIBRATE` để mở bảng căn chỉnh.
- Chọn landmark, bấm `Place selected landmark`, rồi click lên sa bàn để lấy đúng tọa độ 3D từ model.
- Có thể kéo các điểm tròn nhỏ trong chế độ calibration để tinh chỉnh trên bề mặt model.
- Dùng `Save to localStorage` để lưu cho lần mở sau.
- Dùng `Copy JSON` để xuất dữ liệu landmark và mũi tên.

## Tài sản

- Model GLB: `public/models/sa-ban.glb`
- Ảnh tham chiếu UI: `public/refs/ui-reference.jpg`

Nếu model không load, app sẽ hiển thị lỗi rõ trong giao diện. Kiểm tra lại file `public/models/sa-ban.glb`, đường dẫn, hoặc chạy bằng Vite thay vì mở trực tiếp file HTML.
