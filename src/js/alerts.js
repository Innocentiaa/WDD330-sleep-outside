export default class Alert {
    constructor(alertsUrl, parentSelector = "main") {
        this.alertsUrl = alertsUrl;
        this.parent = document.querySelector(parentSelector);
    }

    async init() {
        try {
            const response = await fetch(this.alertsUrl);
            const alerts = await response.json();

            if (alerts.length > 0) {
                this.render(alerts);
            }
        } catch (err) {
            console.error("Error loading alerts:", err);
        }
    }

    render(alerts) {
        const section = document.createElement("section");
        section.classList.add("alert-list");

        alerts.forEach((alert) => {
            const p = document.createElement("p");
            p.textContent = alert.message;
            p.style.backgroundColor = alert.background;
            p.style.color = alert.color;
            p.classList.add("alert-item");
            section.appendChild(p);
        });

        // prepend so it shows at the top of <main>
        this.parent.prepend(section);
    }
}
