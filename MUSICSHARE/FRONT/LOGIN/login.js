document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    
    // 임시 로그인 성공 처리 (서버 연동 전 프론트 단 테스트용)
    if(username.trim() !== "") {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("username", username);
        alert(`${username}님 환영합니다!`);
        location.href = "../MAIN/main.html"; // 메인으로 이동
    }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            alert(`${data.user.name}님 환영합니다!`);
            sessionStorage.setItem("isLoggedIn", "true");
            location.href = "../MAIN/main.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("서버 연결 에러:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
});