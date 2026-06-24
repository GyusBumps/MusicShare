document.addEventListener("DOMContentLoaded", async () => {
    const videoContainer = document.getElementById("video-container");
    const currentUsername = sessionStorage.getItem("username");

    let videos = [];
    let userLikes = new Set();

    // 1. 좋아요 정보 조회 (로그인 시)
    if (currentUsername) {
        try {
            const likesResponse = await fetch(`/api/likes?username=${encodeURIComponent(currentUsername)}`);
            if (likesResponse.ok) {
                const likesData = await likesResponse.json();
                // targettable === 3 (Videos) 인 것만 필터링하여 저장
                likesData.forEach(like => {
                    if (like.targettable === 3) {
                        userLikes.add(like.targetid);
                    }
                });
            }
        } catch (error) {
            console.error("좋아요 목록 가져오기 실패:", error);
        }
    }

    // 2. 비디오 목록 조회
    try {
        const response = await fetch("/api/videos");
        if (!response.ok) throw new Error("비디오 목록 조회 실패");
        videos = await response.json();
        
        // 최신 등록 순으로 정렬 (예시: videoid나 생성일자가 없으므로 그냥 역순)
        videos.reverse();
    } catch (error) {
        console.error("비디오 로드 오류:", error);
        videoContainer.innerHTML = '<div class="no-videos">릴스를 불러오는 중 오류가 발생했습니다.</div>';
        return;
    }

    if (videos.length === 0) {
        videoContainer.innerHTML = '<div class="no-videos">등록된 릴스가 없습니다.<br>첫 번째 릴스를 등록해 보세요!</div>';
        return;
    }

    // 컨테이너 초기화
    videoContainer.innerHTML = "";

    // 3. 비디오 카드 동적 렌더링
    videos.forEach(video => {
        const card = document.createElement("div");
        card.className = "video-card";
        card.dataset.id = video.videoid;

        const isLiked = userLikes.has(video.videoid);

        card.innerHTML = `
            <video src="${video.location}" loop playsinline class="reels-video"></video>
            <div class="video-overlay"></div>
            <div class="video-info">
                <p class="username">@${video.username}</p>
                <h3>${video.name}</h3>
                <p class="description">${video.explain || ""}</p>
            </div>
            <div class="interaction">
                <button class="like-btn ${isLiked ? 'liked' : ''}">
                    ${isLiked ? '❤️' : '🤍'}
                    <span class="like-count">${video.likeCount || 0}</span>
                </button>
            </div>
        `;

        // 비디오 클릭 시 재생/일시정지
        const videoElement = card.querySelector("video");
        card.addEventListener("click", (e) => {
            // 좋아요 버튼 클릭 시에는 비디오 재생/일시정지 기믹 무시
            if (e.target.closest("button")) return;
            
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        });

        // 좋아요 버튼 클릭 이벤트
        const likeBtn = card.querySelector(".like-btn");
        const likeCountSpan = card.querySelector(".like-count");

        likeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!currentUsername) {
                alert("좋아요를 누르려면 로그인이 필요합니다.");
                location.href = "../LOGIN/login.html";
                return;
            }

            const activeLiked = userLikes.has(video.videoid);
            const method = activeLiked ? "DELETE" : "POST";
            
            try {
                const res = await fetch("/api/likes", {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: currentUsername,
                        target: "videos",
                        targetid: video.videoid
                    })
                });

                if (res.ok) {
                    let currentCount = parseInt(likeCountSpan.textContent, 10);
                    if (activeLiked) {
                        userLikes.delete(video.videoid);
                        likeBtn.innerHTML = `🤍<span class="like-count">${currentCount - 1}</span>`;
                        likeBtn.classList.remove("liked");
                    } else {
                        userLikes.add(video.videoid);
                        likeBtn.innerHTML = `❤️<span class="like-count">${currentCount + 1}</span>`;
                        likeBtn.classList.add("liked");
                    }
                } else {
                    const errData = await res.json();
                    alert(errData.error || "요청 처리에 실패했습니다.");
                }
            } catch (err) {
                console.error("좋아요 처리 중 오류:", err);
            }
        });

        videoContainer.appendChild(card);
    });

    // 4. IntersectionObserver를 이용해 화면에 보이는 릴스 비디오만 재생
    const observerOptions = {
        root: videoContainer,
        threshold: 0.6 // 카드의 60% 이상 노출 시 재생
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector("video");
            if (!video) return;

            if (entry.isIntersecting) {
                // 음소거 상태로 자동 재생 시도 (브라우저 정책 준수)
                video.muted = true; 
                video.play().catch(err => console.log("자동 재생 차단됨:", err));
            } else {
                video.pause();
                video.currentTime = 0; // 처음으로 리셋
            }
        });
    }, observerOptions);

    document.querySelectorAll(".video-card").forEach(card => {
        observer.observe(card);
    });
});