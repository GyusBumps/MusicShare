let isSignUpMode = false;

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const toggleMsg = document.getElementById("toggle-msg");
const toggleAuthLink = document.getElementById("toggle-auth");
const loginForm = document.getElementById("login-form");

// 로그인 / 회원가입 모드 전환
toggleAuthLink.addEventListener("click", (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    
    if (isSignUpMode) {
        formTitle.textContent = "회원가입";
        submitBtn.textContent = "회원가입";
        toggleMsg.textContent = "이미 계정이 있으신가요?";
        toggleAuthLink.textContent = "로그인";
    } else {
        formTitle.textContent = "로그인";
        submitBtn.textContent = "로그인";
        toggleMsg.textContent = "아직 회원이 아니신가요?";
        toggleAuthLink.textContent = "회원가입";
    }
});

// 폼 제출 이벤트
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const endpoint = isSignUpMode 
        ? "http://localhost:3000/api/users/register" 
        : "http://localhost:3000/api/users/login";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (isSignUpMode) {
                alert("회원가입이 완료되었습니다! 로그인해 주세요.");
                // 로그인 모드로 전환
                isSignUpMode = false;
                formTitle.textContent = "로그인";
                submitBtn.textContent = "로그인";
                toggleMsg.textContent = "아직 회원이 아니신가요?";
                toggleAuthLink.textContent = "회원가입";
                document.getElementById("password").value = "";
            } else {
                alert(`${data.username}님 환영합니다!`);
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("username", data.username);
                location.href = "../MAIN/main.html";
            }
        } else {
            alert(data.error || "요청 처리에 실패했습니다.");
        }
    } catch (error) {
        console.error("서버 연결 에러:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
});