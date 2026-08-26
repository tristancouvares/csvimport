const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseString } = require("fast-csv");

const expectedHeaders = [
    "Lever Profile ID",
    "Full Name",
    "Email",
    "Date Added",
    "Stage",
    "Archive Reason",
    "Archive Date",
    "Sources",
    "Origin",
    "Tags",
    "Phone",
    "Location",
    "Links",
    "Referrer",
    "Resume Filename",
    "Company",
    "Owner",
    "Lever Posting URL",
    "Posting Owner",
    "Posting Hiring Manager",
    "DateNote-0",
    "UserNote-0",
    "IsSecretNote-0",
    "Note-0",
    "DateNote-1",
    "UserNote-1",
    "IsSecretNote-1",
    "Note-1",
    "DateNote-2",
    "UserNote-2",
    "IsSecretNote-2",
    "Note-2",
    "DateNote-3",
    "UserNote-3",
    "IsSecretNote-3",
    "Note-3",
];

function parseCsv(contents) {
    return new Promise(function (resolve, reject) {
        const rows = [];

        parseString(contents, { headers: true })
            .on("error", reject)
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows));
    });
}

function removeIfPresent(file) {
    try {
        fs.unlinkSync(file);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

(async () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "csvimport-"));
    const source = path.join(tempDirectory, "source.csv");
    const destination = path.join(tempDirectory, "destination.csv");

    try {
        fs.writeFileSync(source, [
            "First Name,Last Name,Email,Phone,City,State,Company",
            "Ada,Lovelace,ada@example.com,555-0100,London,UK,\"Analytical, Engines\"",
            "Grace,Hopper,grace@example.com,,New York,NY,\"Navy",
            "Computing\"",
        ].join("\n"));

        const result = spawnSync(process.execPath, [
            path.join(__dirname, "index.js"),
            source,
            destination,
        ], { encoding: "utf8" });

        assert.ifError(result.error);
        assert.strictEqual(result.status, 0, result.stderr || result.stdout);
        assert.ok(result.stdout.includes(`Reading from:  ${source}`));
        assert.ok(result.stdout.includes(`Writing to:    ${destination}`));

        const rows = await parseCsv(fs.readFileSync(destination, "utf8"));
        assert.strictEqual(rows.length, 2);
        assert.deepStrictEqual(Object.keys(rows[0]), expectedHeaders);

        assert.strictEqual(rows[0]["Full Name"], "Ada Lovelace");
        assert.strictEqual(rows[0].Email, "ada@example.com");
        assert.strictEqual(rows[0].Location, "London, UK");
        assert.strictEqual(rows[0].Company, "Analytical, Engines");

        assert.strictEqual(rows[1]["Full Name"], "Grace Hopper");
        assert.strictEqual(rows[1].Phone, "");
        assert.strictEqual(rows[1].Company, "Navy\nComputing");

        const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        assert.ok(uuidV4.test(rows[0]["Lever Profile ID"]));
        assert.ok(uuidV4.test(rows[1]["Lever Profile ID"]));
        assert.notStrictEqual(rows[0]["Lever Profile ID"], rows[1]["Lever Profile ID"]);

        assert.strictEqual(rows[0]["Date Added"], rows[1]["Date Added"]);
        assert.strictEqual(new Date(rows[0]["Date Added"]).toISOString(), rows[0]["Date Added"]);

        console.log("CLI conversion regression test passed");
    } finally {
        removeIfPresent(source);
        removeIfPresent(destination);
        fs.rmdirSync(tempDirectory);
    }
})().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
