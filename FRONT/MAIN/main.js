// 기존 스크롤 애니메이션
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
        else entry.target.classList.remove('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// 메뉴 클릭 애니메이션 로직
const menuLinks = document.querySelectorAll('.menu-link');

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // 기본 동작 방지 (필요 시)
        e.preventDefault(); 
        
        // 클릭한 메뉴만 강조(색상 및 밑줄)
        menuLinks.forEach(item => item.classList.remove('clicked'));
        this.classList.add('clicked');
    });
});