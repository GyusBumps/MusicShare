// 1. 아래에서 위로 글자 나타나는 스크롤 리빌 기믹
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, { 
    threshold: 0.1 
});

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));


// 2. 상단 메뉴 네비게이션 부드러운 스크롤 (홈, 탐색, 업로드, 프로필만 제어)
const menuLinks = document.querySelectorAll('.menu-link');
menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        menuLinks.forEach(item => item.classList.remove('clicked'));
        this.classList.add('clicked');
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
});


// 3. 쌈뽕한 스크롤 연동 배경 애니메이션 로직
const ball1 = document.querySelector('.ball1');
const ball2 = document.querySelector('.ball2');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return;
    
    const scrollRatio = scrollTop / docHeight;

    const moveX1 = scrollRatio * -150;
    const moveY1 = scrollRatio * 200;
    const scale1 = 1 + scrollRatio * 0.2;

    const moveX2 = scrollRatio * 180;
    const moveY2 = scrollRatio * -250;
    const scale2 = 1 - scrollRatio * 0.1;

    ball1.style.transform = `translate(${moveX1}px, ${moveY1}px) scale(${scale1})`;
    ball2.style.transform = `translate(${moveX2}px, ${moveY2}px) scale(${scale2})`;
});

// 4. 로그인 세션 확인 및 로그아웃 기능
document.addEventListener("DOMContentLoaded", () => {
    const navLogin = document.getElementById("nav-login");
    if (!navLogin) return;

    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const username = sessionStorage.getItem("username");

    if (isLoggedIn && username) {
        navLogin.textContent = `로그아웃 (${username})`;
        navLogin.href = "#";
        navLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("로그아웃 하시겠습니까?")) {
                sessionStorage.removeItem("isLoggedIn");
                sessionStorage.removeItem("username");
                alert("로그아웃 되었습니다.");
                location.reload();
            }
        });
    }
});