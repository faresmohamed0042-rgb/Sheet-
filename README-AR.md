# تطبيق متابعة عودات الإجازات (Firebase + GitHub Pages)

بيشتغل كبرنامج على الموبايل، بدون نت يحفظ على الجهاز، وأول ما النت يرجع بيتزامن مع باقي الأجهزة.

## أولًا: Firebase (مرة واحدة)
1. ادخل https://console.firebase.google.com ← Add project.
2. من القائمة: Build ← **Firestore Database** ← Create database (اختر أقرب منطقة، وابدأ بـ Production mode).
3. Build ← **Authentication** ← Get started ← فعّل **Email/Password**. بعدها من تبويب Users اضغط Add user وأنشئ حساب لكل مستخدم (بريد + كلمة مرور).
4. Firestore ← تبويب **Rules** ← امسح الموجود والصق محتوى ملف `firestore.rules` ← Publish.
5. Project settings (⚙) ← Your apps ← أيقونة الويب `</>` ← سجّل التطبيق ← انسخ قيم `firebaseConfig`.
6. افتح ملف `firebase-config.js` والصق القيم مكان `PASTE_HERE`.

## ثانيًا: GitHub Pages
1. أنشئ حساب على https://github.com ← New repository (اسمه مثلًا `returns`، Public).
2. ارفع كل ملفات المجلد (Add file ← Upload files): index.html, app.js, firebase-config.js, sw.js, manifest.webmanifest, icon-192.png, icon-512.png.
3. Settings ← **Pages** ← Source: Deploy from a branch ← Branch: main ← Save.
4. بعد دقيقة هيظهر الرابط: `https://اسمك.github.io/returns/`
5. ارجع Firebase ← Authentication ← Settings ← **Authorized domains** ← Add domain ← اكتب `اسمك.github.io`.

## ثالثًا: التثبيت على الموبايل
1. افتح الرابط في Chrome **وانت متصل بالنت**، وسجّل الدخول.
2. قائمة Chrome (⋮) ← **Add to Home screen / Install app**.
3. سيب التطبيق مفتوح كام ثانية بعد أول دخول عشان يخزّن نفسه. بعدها يشتغل بدون نت.
4. على آيفون: Safari ← مشاركة ← Add to Home Screen.

## ملاحظات
- أول فتح لازم يكون بنت. بعد كده يشتغل بدونه.
- الإدخال بدون نت بيظهر "⏳ بانتظار المزامنة" وبيترفع لوحده لما النت يرجع.
- قيم `firebaseConfig` مش سرية. الحماية الحقيقية من قواعد Firestore وحسابات الدخول.
- اللي مسجّل دخول بيشوف ويعدّل نفس البيانات. لو عايز صلاحيات مختلفة (عرض فقط مثلًا) قولي.
- لتحديث التطبيق بعد أي تعديل: غيّر `V='returns-v1'` في sw.js إلى `v2` قبل الرفع.
