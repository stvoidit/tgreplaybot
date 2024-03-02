import { Mutex } from "async-mutex";
import sheets from "@googleapis/sheets";

async function CreateApiFunction(keyFilename, spreadsheetId, range) {
    const client = sheets.sheets({
        version: "v4",
        auth: await new sheets.auth.GoogleAuth({
            keyFilename: keyFilename,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        }).getClient()
    });
    const mutex = new Mutex();
    async function AppendData(reportObject) {
        // https://developers.google.com/sheets/api/guides/values?hl=ru
        const value = [
            reportObject.date,
            reportObject.shopName,
            reportObject.reports.Нал,
            reportObject.reports.Бл,
            reportObject.reports.Вал
        ];
        const release = await mutex.acquire();
        try {
            const response = await client.spreadsheets.values.append(
                {
                    spreadsheetId: spreadsheetId,
                    range: range,
                    valueInputOption: "RAW",
                    resource: {
                        values: [value]
                    }
                });
            return response.data;
        }
        catch (err) {
            throw Error(err.message);
        } finally {
            release();
        }
    }
    return AppendData;
}

export default CreateApiFunction;
