document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    const username = sessionStorage.getItem("username");
    if (!username) {
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        location.href = "../LOGIN/login.html";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("username", username);

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(`'${title}' 업로드 완료!`);
            if (data.type === 'video') {
                location.href = "../LEELS/leels.html";
            } else {
                location.href = "../MAIN/main.html";
            }
        } else {
            alert(data.error || "업로드에 실패했습니다.");
        }
    } catch (error) {
        console.error("업로드 에러:", error);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
});