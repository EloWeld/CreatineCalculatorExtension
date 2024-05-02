$(document).on("click", ".mybtn", function () {
    location.href = "popup.html";
});

const stars = document.querySelectorAll('.buttonrounded');
let currentHover = 0; // Текущий индекс активной звезды

stars.forEach((star, index) => {
    star.addEventListener('mouseenter', () => {
        fillStars(index + 1); // Заполнить звёзды до текущей
    });

    star.addEventListener('click', () => {
        localStorage.setItem('stars_clicked', "true")
        currentHover = index; // Сохраняем последний индекс активации звезды по клику
        fillStars(index + 1); // Заполнить звёзды до текущей
        if (index + 1 < 4) {
            // Закрытие попапа и открытие Google Forms
            window.open('https://docs.google.com/forms/d/e/1FAIpQLSczQAsSbsFJTNsg3AmD5gt68soSsmjrOclbO4Y8dtlGByBy8w/viewform?usp=sf_link', '_blank');
        } else {
            // Закрытие попапа и открытие Google Forms
            window.open('https://docs.google.com/forms/d/e/1FAIpQLSczQAsSbsFJTNsg3AmD5gt68soSsmjrOclbO4Y8dtlGByBy8w/viewform?usp=sf_link', '_blank');
            // location.href = "popup.html";
        }
    });
});

function fillStars(max) {
    stars.forEach((star, index) => {
        star.querySelector('.iconstar').src = index < max ? './img/star_full.svg' : './img/star_empty.svg';
    });
}
