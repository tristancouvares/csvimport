const fs = require("fs");
const path = require("path");


const _ = require("lodash");
const csvRead = require("fast-csv");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const uuid = require("uuid/v4");
const moment = require("moment");

const source = process.argv[2];
const destination = process.argv[3];
const cwd = process.cwd();
const sourceAbsolute = path.resolve(cwd, source);
const destinationAbsolute = path.resolve(cwd, destination);

console.log("Reading from: ", sourceAbsolute);
console.log("Writing to:   ", destinationAbsolute);

function readCsv(path) {
    return new Promise(function (resolve, reject) {
        let fields = null;
        let data = [];

        fs.createReadStream(path)
            .pipe(csvRead())
            .on('data', (row) => {
                if (!fields) {
                    fields = row;
                    return;
                }

                data.push(_.zipObject(fields, row));
            })
            .on('end', () => {
                resolve(data);
            }).on("error", (err) => {
                reject(err);
            });
    });
}



(async () => {
    const now = moment.utc().toISOString();
    const data = await readCsv(sourceAbsolute);
    const resData = data.map(function transformObj(obj) {
        return {
            "Lever Profile ID": uuid(),
            "Full Name": `${obj["First Name"]} ${obj["Last Name"]}`,
            "Email": obj["Email"],
            "Date Added": now,
            "Stage": "",
            "Archive Reason": "",
            "Archive Date": "",
            "Sources": "",
            "Origin": "",
            "Tags": "",
            "Phone": obj["Phone"],
            "Location": `${obj["City"]}, ${obj["State"]}`,
            "Links": "",
            "Referrer": "",
            "Resume Filename": "",
            "Company": obj["Company"],
            "Owner": "",
            "Lever Posting URL": "",
            "Posting Owner": "",
            "Posting Hiring Manager": "",
            "DateNote-0": "",
            "UserNote-0": "",
            "IsSecretNote-0": "",
            "Note-0": "",
            "DateNote-1": "",
            "UserNote-1": "",
            "IsSecretNote-1": "",
            "Note-1": "",
            "DateNote-2": "",
            "UserNote-2": "",
            "IsSecretNote-2": "",
            "Note-2": "",
            "DateNote-3": "",
            "UserNote-3": "",
            "IsSecretNote-3": "",
            "Note-3": "",
        };
    });

    const header = Object.keys(resData[0]).map((key) => ({
        id: key,
        title: key,
    }));

    const csvWriter = createCsvWriter({
        path: destinationAbsolute,
        header
    });

    await csvWriter.writeRecords(resData)
})();

