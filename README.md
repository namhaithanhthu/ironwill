# ⚔️ IRONWILL — THE DISCIPLINE RPG
> **Slogan:** *Luyện Kỷ Luật Thép • Đập Tan Trì Hoãn*  
> **Tác giả & Chủ dự án:** Nguyễn Nam Hải ([@namhaithanhthu](https://github.com/namhaithanhthu))  
> **Demo Local:** `http://localhost:5173`

---

## 📖 Giới Thiệu Dự Án

**IronWill** là ứng dụng web kết hợp giữa **To-Do List cam kết** và **Nhật ký tự soi chiếu mỗi tối**, được xây dựng theo phong cách **Game Hóa (Gamification / RPG)** nhằm rèn luyện và duy trì tính kỷ luật thép cho người dùng.

Thay vì quản lý công việc theo cách khô khan, IronWill biến hành trình mỗi ngày thành một trò chơi nhập vai:
- Làm việc để nhận **Điểm Kinh Nghiệm (EXP)** và thăng cấp danh hiệu chiến binh.
- Duy trì **Chuỗi Kỷ Luật (Streak 🔥)** liên tục nhiều ngày.
- Bắn **Pháo Hoa (Confetti)** và phát **Âm thanh Retro 8-bit** mỗi khi vượt qua thử thách.
- Dành 3 phút mỗi tối viết **Cuộn Sách Soi Chiếu** để hồi phục thanh Ý Chí (HP).

---

## ✨ Tính Năng Nổi Bật

- 🛡️ **Bảng Chỉ Số Nhân Vật (HUD):** 6 Cấp độ (Tân Binh -> Chiến Thần -> Bất Tử Sắt Đá), thanh EXP động, thanh Ý Chí (HP) và Chuỗi ngày Streak.
- ⚔️ **Nhiệm Vụ Kỷ Luật (Quests):** Phân chia rõ việc Cốt lõi (Boss Quest - thưởng +100 EXP), Thói quen lành mạnh, và Việc phụ.
- 📜 **Nhật Ký Tự Soi Chiếu (Daily Reflection):** Đánh giá điểm kỷ luật 1-10 ⭐, ghi chép chiến tích, nhận diện quái vật xao nhãng và cam kết cho ngày mai (+150 EXP).
- 🏆 **Huy Hiệu Danh Vọng (Achievements):** Mở khóa tự động theo thành tích thực tế (*Bước Đầu Thép, Ngọn Lửa Kiên Trì, Kẻ Tiêu Diệt Trì Hoãn...*).
- 🔊 **Âm Thanh & Hiệu Ứng Game:** Tích hợp bộ tổng hợp âm thanh Web Audio API và pháo hoa đồ họa tương tác.
- 💾 **Lưu Trữ Tự Động:** Dữ liệu được lưu trữ tự động trên thiết bị của người dùng (LocalStorage).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v4 (Dark Theme / Cyberpunk Glow)
- **Icons:** Lucide React
- **Sound Engine:** Web Audio API (Synthesizer 8-bit)
- **Effects:** Canvas Confetti

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/namhaithanhthu/ironwill.git
   cd ironwill
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Khởi chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:5173`
