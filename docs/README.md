# 🎓 Learning Style Finder (ILS & MBTI)

Энэхүү систем нь оюутны суралцах хэв маягийг **ILS (Index of Learning Styles)** болон **MBTI** тестүүдээр тодорхойлох зорилготой веб аппликейшн юм.

## ⚙️ Технологийн стек
- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3 (Neon/Street Aesthetic), JavaScript (Vanilla)
- **Database:** JSON (data/ хавтас дотор хадгалагдана)
- **Visualization:** Chart.js

## 🚀 Ажиллуулах заавар

1. **Хавтас руу орох:**
   ```bash
   cd student-learning-system
   ```

2. **Хамааралтай сангуудыг суулгах:**
   ```bash
   npm install
   ```

3. **Серверийг асаах:**
   ```bash
   npm start
   ```

4. **Веб рүү хандах:**
   Браузер дээрээ `http://localhost:3000` хаягаар орно уу.

## 📌 Үндсэн функцууд
- **Auth:** Бүртгүүлэх болон нэвтрэх хэсэг.
- **Tests:** 
  - ILS (Active/Reflective, Sensing/Intuitive, Visual/Verbal, Sequential/Global)
  - MBTI (16 төрлийн зан төлөв)
- **Dashboard:** Өмнөх тестийн түүх болон үр дүнг график (Radar Chart) хэлбэрээр харах.
- **UI/UX:** Dark/Light mode toggle, Neon/Graffiti/Goth aesthetic дизайн.

## 📂 Хавтасны бүтэц
- `server.js` - Backend сервер
- `public/` - Frontend файлууд (HTML, CSS, JS)
- `data/` - Хэрэглэгч болон тестийн үр дүн хадгалах JSON файлууд
- `package.json` - Төслийн тохиргоо
