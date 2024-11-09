const monthYearDisplay = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");

let currentDate = new Date();

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYearDisplay.textContent = date.toLocaleString("de-DE", { month: "long", year: "numeric" });

    const dayElements = document.querySelectorAll('.day:not(.day-name)');
    dayElements.forEach(day => day.remove());

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "day";
        daysContainer.appendChild(emptyDay);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.textContent = day;

        if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayElement.classList.add("current-day");
        }

        daysContainer.appendChild(dayElement);
    }
}

prevMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);
