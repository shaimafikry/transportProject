const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const { TransportTrips } = require("./config"); // ✅ Import model directly

const checkAndSendEmails = async () => {
    try {
        console.log("🔍 Checking for overdue trips...");

    // ✅ Query the database directly instead of using fetch()
    const trips = await TransportTrips.findAll({
      where: { aging_date: null }, // Only trips without aging_date
    });

        if (!trips || trips.length === 0) return; // لا توجد بيانات للتحقق

        const today = new Date();

        // 2️⃣ فلترة الرحلات التي مر عليها 9 أيام من تاريخ التحميل للشركة
        const overdueTrips = trips.filter(trip => {
            if (!trip.company_loading_date) return false; // تأكد من وجود التاريخ
            const loadingDate = new Date(trip.company_loading_date);
            const diffDays = Math.floor((today - loadingDate) / (1000 * 60 * 60 * 24));
            return trip.aging_date === null && diffDays >= 9;
        });

        if (overdueTrips.length === 0) return; // لا توجد رحلات متأخرة

        // 3️⃣ إعداد بيانات البريد الإلكتروني بأمان عبر متغيرات البيئة
        const managerEmail = process.env.MANAGER_EMAIL;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 4️⃣ إرسال بريد إلكتروني لكل رحلة متأخرة
        for (const trip of overdueTrips) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: managerEmail,
                subject: "تنبيه: رحلة متأخرة تحتاج للتعتيق",
                text: `FO: ${trip.fo_number} رحلة رقم
                تحتاج للتعتيق، مر عليها أكثر من 9 أيام منذ التحميل.
                تفاصيل الرحلة:
                السائق: ${trip.driver_name}
                الجهة: ${trip.destination}
                تاريخ التحميل: ${trip.company_loading_date}
                `,
                html: `
                <p>رحلة رقم FO: <strong>${trip.fo_number}</strong> تحتاج للتعتيق، مر عليها أكثر من 9 أيام منذ التحميل.</p>
                <p><strong>تفاصيل الرحلة:</strong></p>
                <ul>
                    <li><strong>السائق:</strong> ${trip.driver_name} </li>
                    <li><strong>الجهة:</strong> ${trip.destination} </li>
                    <li><strong>تاريخ التحميل:</strong> ${trip.company_loading_date} </li>
                </ul>
                <p> يرجى اتخاذ الإجراء اللازم. </p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 تم إرسال البريد الإلكتروني للرحلة رقم FO: ${trip.fo_number}`);
        }
    } catch (error) {
        console.error("❌ خطأ أثناء التحقق من الرحلات المتأخرة:", error);
    }
};

// 5️⃣ تشغيل الفحص تلقائيًا عند دخول المستخدم بعد 5 ثوانٍ
setTimeout(checkAndSendEmails, 10000);

 module.exports = checkAndSendEmails;
