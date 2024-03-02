export default function (text) {
    const reportObject = {
        date: null,
        shopName: null,
        reports: {
            Нал: null,
            Бл: null,
            Вал: null
        }
    };
    for (const line of text.split("\n")) {
        if (!line) continue;
        if (!reportObject.shopName) {
            reportObject.shopName = line.trim();
            continue;
        }
        const [key, value] = line.split(" ");
        reportObject.reports[key] = parseFloat(value);
    }
    return reportObject;
}
