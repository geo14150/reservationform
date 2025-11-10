import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- GLOBAL VARIABLES SETUP (MANDATORY for Canvas environment) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-hotel-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, db, auth;
let currentUserId = null;
let isAuthReady = false;
let useLocalStorageFallback = false; // Νέα σημαία για το fallback

// --- UTILITY FUNCTIONS ---
function showMessage(message, type = 'info') {
    const modal = document.getElementById('message-modal');
    if (!modal) return;
    
    modal.textContent = message;
    modal.className = `message-modal visible ${type}`;
    
    setTimeout(() => {
        modal.classList.remove('visible');
        modal.classList.add('hidden');
    }, 4000);
}

function getUserId() {
    // Επιστρέφει το ID χρήστη ή ένα τυχαίο αν χρησιμοποιούμε fallback
    if (useLocalStorageFallback) return 'local_user_' + (localStorage.getItem('lastUserId') || 'guest');
    return auth.currentUser ? auth.currentUser.uid : currentUserId;
}

// --- FIREBASE INITIALIZATION AND AUTHENTICATION ---
async function initializeFirebase() {
    try {
        if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.projectId) {
            console.error("CONFIGURATION ERROR: Firebase config is missing. Switching to localStorage fallback.");
            showMessage("Σφάλμα: Λείπουν οι ρυθμίσεις Firebase. Χρησιμοποιείται τοπική αποθήκευση.", 'error');
            
            useLocalStorageFallback = true; // Ενεργοποίηση fallback
            isAuthReady = true; 
            
            // Καλούμε το UI setup με το fallback
            if (document.getElementById('loginForm')) { setupAuthFormsUI(); }
            if (document.getElementById('reservationForm')) { setupReservationForm(); }
            return;
        }

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth); 
        }

        onAuthStateChanged(auth, (user) => {
            if (user) { currentUserId = user.uid; } else { currentUserId = crypto.randomUUID(); }
            isAuthReady = true;
            console.log("Firebase Auth State Changed. User ID:", currentUserId);
            
            if (document.getElementById('loginForm')) { setupAuthFormsUI(); }
            if (document.getElementById('reservationForm')) { setupReservationForm(); }
        });

    } catch (error) {
        console.error("Firebase Initialization or Auth Error:", error);
        showMessage("Σφάλμα αρχικοποίησης Firebase.", 'error');
    }
}

// --- FALLBACK LOGIC (LOCAL STORAGE) ---
function localStorageRegister(e) {
    e.preventDefault();
    const name = document.querySelector(".register-div .name").value;
    const surname = document.querySelector(".register-div .surname").value;
    const email = document.querySelector(".register-div .email").value;
    const password = document.querySelector(".register-div .pass").value;

    if (!name || !surname || !email || !password) {
        showMessage("Παρακαλώ συμπληρώστε όλα τα πεδία.", 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
    if (users.some(u => u.email === email)) {
        showMessage("Αυτό το email χρησιμοποιείται ήδη (Local Storage).", 'error');
        return;
    }

    const newUser = { name, surname, email, password };
    users.push(newUser);
    localStorage.setItem('localUsers', JSON.stringify(users));
    localStorage.setItem('lastUserId', email); // Χρησιμοποιούμε το email ως τυπικό ID
    showMessage("Εγγραφή επιτυχής! (Local Storage). Συνδεθήκατε.", 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

function localStorageLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('lastUserId', email);
        showMessage("Σύνδεση επιτυχής! (Local Storage). Ανακατεύθυνση...", 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    } else {
        showMessage("Σφάλμα σύνδεσης. (Local Storage).", 'error');
    }
}

// --- FIREBASE LOGIC (Only runs if useLocalStorageFallback is false) ---

async function handleRegister(e) {
    e.preventDefault();
    if (useLocalStorageFallback) return localStorageRegister(e); 
    
    // ... (Υπόλοιπη λογική Firebase)
    if (!isAuthReady) { showMessage("Η εφαρμογή φορτώνει... παρακαλώ περιμένετε.", 'info'); return; }
    if (!auth || !auth.app) { showMessage("Η εγγραφή είναι προσωρινά μη διαθέσιμη λόγω σφάλματος διαμόρφωσης.", 'error'); return; }
    
    const name = document.querySelector(".register-div .name").value;
    const surname = document.querySelector(".register-div .surname").value;
    const email = document.querySelector(".register-div .email").value;
    const password = document.querySelector(".register-div .pass").value;

    if (!name || !surname || !email || !password) { showMessage("Παρακαλώ συμπληρώστε όλα τα πεδία.", 'error'); return; }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/details`);
        await setDoc(userDocRef, { name: name, surname: surname, email: email, registrationDate: new Date().toISOString() });

        showMessage("Εγγραφή επιτυχής! Συνδεθήκατε.", 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);

    } catch (error) {
        console.error("Registration Error:", error);
        let message = "Σφάλμα εγγραφής.";
        if (error.code === 'auth/email-already-in-use') { message = "Αυτό το email χρησιμοποιείται ήδη."; } 
        else if (error.code === 'auth/weak-password') { message = "Ο κωδικός είναι πολύ αδύναμος (τουλάχιστον 6 χαρακτήρες)."; }
        showMessage(message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    if (useLocalStorageFallback) return localStorageLogin(e);
    
    if (!isAuthReady) { showMessage("Η εφαρμογή φορτώνει... παρακαλώ περιμένετε.", 'info'); return; }
    if (!auth || !auth.app) { showMessage("Η σύνδεση είναι προσωρινά μη διαθέσιμη λόγω σφάλματος διαμόρφωσης.", 'error'); return; }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage("Σύνδεση επιτυχής! Ανακατεύθυνση...", 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);

    } catch (error) {
        console.error("Login Error:", error);
        showMessage("Σφάλμα σύνδεσης. Ελέγξτε email/κωδικό.", 'error');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    if (useLocalStorageFallback) {
        showMessage("Η ανάκτηση κωδικού δεν υποστηρίζεται στο local storage.", 'info');
        return;
    }
    
    if (!isAuthReady) { showMessage("Η εφαρμογή φορτώνει... παρακαλώ περιμένετε.", 'info'); return; }
    if (!auth || !auth.app) { showMessage("Η ανάκτηση κωδικού είναι προσωρινά μη διαθέσιμη λόγω σφάλματος διαμόρφωσης.", 'error'); return; }
    
    const email = document.getElementById("mail").value;

    if (!email) { showMessage("Παρακαλώ εισάγετε το email σας.", 'info'); return; }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage(`Οδηγίες ανάκτησης στάλθηκαν στο ${email}. Ελέγξτε το email σας.`, 'success');
    } catch (error) {
        console.error("Forgot Password Error:", error);
        showMessage("Σφάλμα. Βεβαιωθείτε ότι το email είναι σωστό.", 'error');
    }
}

// --- RESERVATION FORM LOGIC ---
function setupReservationForm() {
    const form = document.getElementById('reservationForm');
    
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if(checkinInput) checkinInput.setAttribute('min', today);
    if(checkoutInput) checkoutInput.setAttribute('min', today);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!useLocalStorageFallback && !auth.currentUser) {
            showMessage("Πρέπει να συνδεθείτε ή να κάνετε εγγραφή για κράτηση.", 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return;
        }

        const formData = new FormData(form);
        const reservationData = {
            userId: getUserId(),
            nameSurname: formData.get('name'),
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            roomType: formData.get('room-type'),
            days: parseInt(formData.get('days')),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

        if (useLocalStorageFallback) {
            // Local Storage fallback for Reservations
            const reservations = JSON.parse(localStorage.getItem('localReservations') || '[]');
            reservations.push(reservationData);
            localStorage.setItem('localReservations', JSON.stringify(reservations));
            
            showMessage("Η κράτηση υποβλήθηκε επιτυχώς! (Local Storage)", 'success');
            form.reset();
            return;
        }

        try {
            const reservationsCollection = collection(db, `artifacts/${appId}/users/${getUserId()}/reservations`);
            await addDoc(reservationsCollection, reservationData);

            showMessage("Η κράτηση υποβλήθηκε επιτυχώς! Θα λάβετε email επιβεβαίωσης.", 'success');
            form.reset();

        } catch (error) {
            console.error("Error submitting reservation: ", error);
            showMessage("Σφάλμα κατά την υποβολή της κράτησης. Δοκιμάστε ξανά.", 'error');
        }
    });
}

// --- UI SETUP (Login/Register Tab Switching & Event Listener Attachment) ---
function setupAuthFormsUI() {
    const formLog = document.querySelector(".form-log");
    const registerDiv = document.querySelector(".register-div");
    const forgotDiv = document.querySelector(".Forgot-form");

    const btnLogin = document.getElementById('btn1');
    const btnRegister = document.getElementById('btn2');
    const btnForgotPass = document.getElementById('code');
    const h2Text = document.querySelector('h2');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');


    // 1. Initial State Check
    if (formLog && !formLog.classList.contains('hidden')) {
        h2Text.textContent = 'Κάντε Σύνδεση';
    }

    // 2. Attach Tab Switching Listeners
    btnLogin.addEventListener("click", () => {
        formLog.classList.remove('hidden');
        registerDiv.classList.add('hidden');
        forgotDiv.classList.add('hidden');
        h2Text.textContent = 'Κάντε Σύνδεση';
    });

    btnRegister.addEventListener("click", () => {
        formLog.classList.add('hidden');
        registerDiv.classList.remove('hidden');
        forgotDiv.classList.add('hidden');
        h2Text.textContent = 'Εγγραφείτε Τώρα';
    });

    btnForgotPass.addEventListener("click", () => {
        formLog.classList.add('hidden');
        registerDiv.classList.add('hidden');
        forgotDiv.classList.remove('hidden');
        h2Text.textContent = 'Ανάκτηση Κωδικού';
    });
    
    // 3. Attach Firebase/Fallback handlers to forms
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
}

// --- MAIN EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});
