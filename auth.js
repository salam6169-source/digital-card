// ============================================================
// Firebase Auth System - Digital Card
// استبدل firebaseConfig بالقيم الحقيقية من Firebase Console
// ============================================================

const firebaseConfig = {
        apiKey: "AIzaSyCwUxnt6rmxA7bu7avAwk8WBXK-xWrXbPk",
        authDomain: "digital-card-7edcc.firebaseapp.com",
        projectId: "digital-card-7edcc",
        storageBucket: "digital-card-7edcc.firebasestorage.app",
        messagingSenderId: "829825531652",
        appId: "1:829825531652:web:9ad12852e0b77a36ff1a51",
        measurementId: "G-QCSM1LQMH5"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
// نظام إدارة Modal المصادقة
// ============================================================

function openAuthModal(tab) {
        const modal = document.getElementById('authModal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (tab) showAuthTab(tab);
}

function closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
        clearAuthMessages();
}

function showAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        const tabBtn = document.getElementById('tab-' + tab);
        const tabForm = document.getElementById('form-' + tab);
        if (tabBtn) tabBtn.classList.add('active');
        if (tabForm) tabForm.classList.add('active');
}

function clearAuthMessages() {
        document.querySelectorAll('.auth-message').forEach(el => {
                    el.textContent = '';
                    el.className = 'auth-message';
        });
}

function showMessage(elementId, message, type) {
        const el = document.getElementById(elementId);
        if (el) {
                    el.textContent = message;
                    el.className = 'auth-message ' + type;
        }
}

// ============================================================
// تسجيل مستخدم جديد
// ============================================================

async function registerUser() {
        const name = document.getElementById('reg-name')?.value?.trim();
        const email = document.getElementById('reg-email')?.value?.trim();
        const phone = document.getElementById('reg-phone')?.value?.trim();
        const password = document.getElementById('reg-password')?.value;
        const confirmPassword = document.getElementById('reg-confirm-password')?.value;

    if (!name || !email || !phone || !password || !confirmPassword) {
                showMessage('reg-message', 'يرجى تعبئة جميع الحقول', 'error');
                return;
    }

    if (password !== confirmPassword) {
                showMessage('reg-message', 'كلمة المرور غير متطابقة', 'error');
                return;
    }

    if (password.length < 6) {
                showMessage('reg-message', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
    }

    try {
                showMessage('reg-message', 'جاري إنشاء الحساب...', 'info');
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

            // تحديث اسم المستخدم
            await user.updateProfile({ displayName: name });

            // حفظ البيانات في Firestore
            await db.collection('users').doc(user.uid).set({
                            name: name,
                            email: email,
                            phone: phone,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('reg-message', 'تم إنشاء الحساب بنجاح!', 'success');
                setTimeout(() => closeAuthModal(), 1500);
    } catch (error) {
                let errorMsg = 'حدث خطأ، حاول مرة أخرى';
                if (error.code === 'auth/email-already-in-use') errorMsg = 'البريد الإلكتروني مستخدم بالفعل';
                else if (error.code === 'auth/invalid-email') errorMsg = 'البريد الإلكتروني غير صحيح';
                else if (error.code === 'auth/weak-password') errorMsg = 'كلمة المرور ضعيفة جداً';
                showMessage('reg-message', errorMsg, 'error');
    }
}

// ============================================================
// تسجيل الدخول
// ============================================================

async function loginUser() {
        const email = document.getElementById('login-email')?.value?.trim();
        const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
                showMessage('login-message', 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
                return;
    }

    try {
                showMessage('login-message', 'جاري تسجيل الدخول...', 'info');
                await auth.signInWithEmailAndPassword(email, password);
                showMessage('login-message', 'تم تسجيل الدخول بنجاح!', 'success');
                setTimeout(() => closeAuthModal(), 1000);
    } catch (error) {
                let errorMsg = 'حدث خطأ، حاول مرة أخرى';
                if (error.code === 'auth/user-not-found') errorMsg = 'البريد الإلكتروني غير مسجل';
                else if (error.code === 'auth/wrong-password') errorMsg = 'كلمة المرور غير صحيحة';
                else if (error.code === 'auth/invalid-email') errorMsg = 'البريد الإلكتروني غير صحيح';
                else if (error.code === 'auth/too-many-requests') errorMsg = 'تم تجاوز عدد المحاولات، حاول لاحقاً';
                showMessage('login-message', errorMsg, 'error');
    }
}

// ============================================================
// إعادة تعيين كلمة المرور
// ============================================================

async function resetPassword() {
        const email = document.getElementById('login-email')?.value?.trim();
        if (!email) {
                    showMessage('login-message', 'يرجى إدخال بريدك الإلكتروني أولاً', 'error');
                    return;
        }
        try {
                    await auth.sendPasswordResetEmail(email);
                    showMessage('login-message', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
        } catch (error) {
                    showMessage('login-message', 'البريد الإلكتروني غير مسجل', 'error');
        }
}

// ============================================================
// تسجيل الخروج
// ============================================================

async function logoutUser() {
        try {
                    await auth.signOut();
        } catch (error) {
                    console.error('Logout error:', error);
        }
}

// ============================================================
// تحديث الملف الشخصي
// ============================================================

async function updateProfile() {
        const user = auth.currentUser;
        if (!user) return;

    const phone = document.getElementById('profile-phone')?.value?.trim();
        const newPassword = document.getElementById('profile-new-password')?.value;
        const confirmNewPassword = document.getElementById('profile-confirm-password')?.value;

    try {
                // تحديث رقم الجوال
            if (phone) {
                            await db.collection('users').doc(user.uid).update({ phone: phone });
            }

            // تحديث كلمة المرور
            if (newPassword) {
                            if (newPassword.length < 6) {
                                                showMessage('profile-message', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                                                return;
                            }
                            if (newPassword !== confirmNewPassword) {
                                                showMessage('profile-message', 'كلمة المرور الجديدة غير متطابقة', 'error');
                                                return;
                            }
                            await user.updatePassword(newPassword);
            }

            showMessage('profile-message', 'تم تحديث الملف الشخصي بنجاح!', 'success');
                showProfileSection(user);
    } catch (error) {
                let errorMsg = 'حدث خطأ أثناء التحديث';
                if (error.code === 'auth/requires-recent-login') {
                                errorMsg = 'يرجى تسجيل الخروج والدخول مجدداً لتغيير كلمة المرور';
                }
                showMessage('profile-message', errorMsg, 'error');
    }
}

// ============================================================
// عرض قسم الملف الشخصي
// ============================================================

async function showProfileSection(user) {
        const guestSection = document.getElementById('guest-section');
        const profileSection = document.getElementById('profile-section');

    if (guestSection) guestSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';

    // تحديث اسم المستخدم
    const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = user.displayName || 'المستخدم';

    // تحديث البريد الإلكتروني
    const emailEl = document.getElementById('profile-email-display');
        if (emailEl) emailEl.textContent = user.email;

    // تحميل البيانات من Firestore
    try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                                const data = doc.data();
                                const phoneEl = document.getElementById('profile-phone');
                                if (phoneEl && data.phone) phoneEl.value = data.phone;
                }
    } catch (error) {
                console.error('Error loading profile:', error);
    }
}

// ============================================================
// مراقبة حالة المصادقة
// ============================================================

auth.onAuthStateChanged(function(user) {
        const guestSection = document.getElementById('guest-section');
        const profileSection = document.getElementById('profile-section');
        const navLoginBtn = document.getElementById('nav-login-btn');
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        const navUserName = document.getElementById('nav-user-name');

                            if (user) {
                                        // المستخدم مسجل الدخول
            if (guestSection) guestSection.style.display = 'none';
                                        if (profileSection) profileSection.style.display = 'block';
                                        if (navLoginBtn) navLoginBtn.style.display = 'none';
                                        if (navLogoutBtn) navLogoutBtn.style.display = 'inline-block';
                                        if (navUserName) {
                                                        navUserName.textContent = user.displayName || user.email;
                                                        navUserName.style.display = 'inline-block';
                                        }
                                        showProfileSection(user);
                            } else {
                                        // المستخدم غير مسجل
            if (guestSection) guestSection.style.display = 'block';
                                        if (profileSection) profileSection.style.display = 'none';
                                        if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
                                        if (navLogoutBtn) navLogoutBtn.style.display = 'none';
                                        if (navUserName) navUserName.style.display = 'none';
                            }
});
