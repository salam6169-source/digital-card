// ============================================================
// Firebase Auth System - Digital Card
// ستحتاج لاستبدال firebaseConfig ببياناتك من Firebase Console
// ============================================================

const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_YOUR_APP_ID"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
// إدارة Modal نظام المصادقة
// ============================================================

function openAuthModal(tab) {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (tab === 'login') showAuthTab('login');
    else showAuthTab('register');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================================
// تسجيل مستخدم جديد
// ============================================================

async function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const msgEl = document.getElementById('reg-msg');

  msgEl.textContent = '';
    if (password !== confirm) {
          msgEl.textContent = 'كلمتا المرور غير متطابقتين';
          msgEl.className = 'auth-msg error';
          return;
    }
    if (password.length < 6) {
          msgEl.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
          msgEl.className = 'auth-msg error';
          return;
    }

  const btn = document.getElementById('reg-btn');
    btn.disabled = true;
    btn.textContent = 'جارٍ الإنشاء...';

  try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });
        await db.collection('users').doc(cred.user.uid).set({
                name: name,
                phone: phone,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        msgEl.textContent = 'تم إنشاء حسابك بنجاح!';
        msgEl.className = 'auth-msg success';
        setTimeout(() => { closeAuthModal(); showProfileSection(cred.user); }, 1200);
  } catch (err) {
        let msg = 'حدث خطأ، حاول مرة أخرى';
        if (err.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مستخدم بالفعل';
        if (err.code === 'auth/invalid-email') msg = 'البريد الإلكتروني غير صحيح';
        msgEl.textContent = msg;
        msgEl.className = 'auth-msg error';
        btn.disabled = false;
        btn.textContent = 'إنشاء حساب';
  }
}

// ============================================================
// تسجيل الدخول
// ============================================================

async function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msgEl = document.getElementById('login-msg');

  msgEl.textContent = '';
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = 'جارٍ الدخول...';

  try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
        showProfileSection(cred.user);
  } catch (err) {
        let msg = 'خطأ في البريد أو كلمة المرور';
        if (err.code === 'auth/user-not-found') msg = 'لا يوجد حساب بهذا البريد';
        if (err.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة';
        if (err.code === 'auth/too-many-requests') msg = 'محاولات كثيرة، حاول لاحقاً';
        msgEl.textContent = msg;
        msgEl.className = 'auth-msg error';
        btn.disabled = false;
        btn.textContent = 'تسجيل الدخول';
  }
}

// ============================================================
// إعادة تعيين كلمة المرور
// ============================================================

async function resetPassword() {
    const email = document.getElementById('login-email').value.trim();
    if (!email) { alert('أدخل بريدك الإلكتروني أولاً'); return; }
    try {
          await auth.sendPasswordResetEmail(email);
          alert('تم إرسال رابط إعادة التعيين إلى ' + email);
    } catch (err) {
          alert('تعذر إرسال البريد، تأكد من صحة الإيميل');
    }
}

// ============================================================
// تسجيل الخروج
// ============================================================

async function logoutUser() {
    await auth.signOut();
    location.reload();
}

// ============================================================
// تحديث بيانات العضو (جوال + كلمة مرور)
// ============================================================

async function updateProfile(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const phone = document.getElementById('profile-phone').value.trim();
    const newPass = document.getElementById('profile-newpass').value;
    const confirmPass = document.getElementById('profile-confirmpass').value;
    const msgEl = document.getElementById('profile-msg');
    msgEl.textContent = '';

  try {
        await db.collection('users').doc(user.uid).update({ phone: phone });

      if (newPass) {
              if (newPass !== confirmPass) {
                        msgEl.textContent = 'كلمتا المرور غير متطابقتين';
                        msgEl.className = 'auth-msg error';
                        return;
              }
              if (newPass.length < 6) {
                        msgEl.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
                        msgEl.className = 'auth-msg error';
                        return;
              }
              await user.updatePassword(newPass);
      }

      msgEl.textContent = 'تم تحديث البيانات بنجاح ✓';
        msgEl.className = 'auth-msg success';
        document.getElementById('profile-newpass').value = '';
        document.getElementById('profile-confirmpass').value = '';
  } catch (err) {
        let msg = 'حدث خطأ أثناء التحديث';
        if (err.code === 'auth/requires-recent-login') {
                msg = 'يرجى تسجيل الدخول مجدداً ثم المحاولة';
        }
        msgEl.textContent = msg;
        msgEl.className = 'auth-msg error';
  }
}

// ============================================================
// عرض قسم ملف العضو بعد الدخول
// ============================================================

async function showProfileSection(user) {
    const profileSection = document.getElementById('profile');
    const authPrompt = document.getElementById('auth-prompt');
    const profileContent = document.getElementById('profile-content');
    if (!profileSection) return;

  const navBtn = document.querySelector('.nav-profile-btn');
    if (navBtn) {
          navBtn.innerHTML = '👤 ' + (user.displayName || 'حسابي');
    }

  try {
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.exists ? doc.data() : {};

      if (authPrompt) authPrompt.style.display = 'none';
        if (profileContent) profileContent.style.display = 'block';

      const nameEl = document.getElementById('profile-display-name');
        const emailEl = document.getElementById('profile-display-email');
        const phoneInput = document.getElementById('profile-phone');

      if (nameEl) nameEl.textContent = data.name || user.displayName || 'المستخدم';
        if (emailEl) emailEl.textContent = user.email;
        if (phoneInput) phoneInput.value = data.phone || '';

      profileSection.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
        console.error('Error loading profile:', err);
  }
}

// ============================================================
// مراقبة حالة المصادقة
// ============================================================

auth.onAuthStateChanged((user) => {
    const navBtn = document.querySelector('.nav-profile-btn');
    const authPrompt = document.getElementById('auth-prompt');
    const profileContent = document.getElementById('profile-content');

                          if (user) {
                                if (navBtn) navBtn.innerHTML = '👤 ' + (user.displayName || 'حسابي');
                                if (authPrompt) authPrompt.style.display = 'none';
                                if (profileContent) profileContent.style.display = 'block';
                                showProfileSection(user);
                          } else {
                                if (navBtn) navBtn.innerHTML = '👤 تسجيل الدخول';
                                if (authPrompt) authPrompt.style.display = 'flex';
                                if (profileContent) profileContent.style.display = 'none';
                          }
});
