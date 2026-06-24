let likeCount = 0;
const likeBtn = document.getElementById("like-btn");
const likeCountSpan = document.getElementById("like-count");

likeBtn.addEventListener("click", () => {
    likeCount++;
    likeCountSpan.textContent = likeCount;
    
    // 간단한 이펙트 효과 대신 알림
    console.log("좋아요 반영됨! 현재 수:", likeCount);
});