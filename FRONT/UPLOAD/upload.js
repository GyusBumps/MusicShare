document.getElementById("upload-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    // 추후 SERVER/server.js와 연동할 때 사용할 FormData 객체 생성 예시
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    console.log("업로드 시도:", title, file.name);
    alert(`'${title}' 파일이 가상으로 업로드 되었습니다. (서버 연결 필요)`);
    
    // 업로드 후 메인으로 이동
    location.href = "../MAIN/main.html";
});