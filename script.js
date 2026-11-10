
async function readCSV(file) {
    const text = await file.text();
    const rows = text.trim().split(/\r?\n/);

    function parseRow(row) {
        return row.match(/("([^"]|"")*"|[^,]*)(,|$)/g)
            .map(value => value.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
    }

    const headers = parseRow(rows[0]);

    return rows.slice(1).filter(row => row.trim()).map(row => {
        const values = parseRow(row);
        let obj = {};

        headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
        });

        return obj;
    });
}

function properCase(name) {
    return name.trim().toLowerCase().replace(/\b[a-z]/g, char =>
        char.toUpperCase()
    );
}

function mapProgram(code) {
    const programs = {
        "BSIT": "Bachelor of Science in Information Technology",
        "BSCS": "Bachelor of Science in Computer Science",
        "BSIS": "Bachelor of Science in Information Systems"
    };

    return programs[code.trim().toUpperCase()] || code.trim().toUpperCase();
}

function transformGrade(grade) {
    const value = grade.trim();

    if (value === "") return null;

    const number = Number(value);

    return isNaN(number) ? value.toUpperCase() : number;
}

async function processFiles() {

    const sisFile = document.getElementById("sis").files[0];
    const lmsFile = document.getElementById("lms").files[0];
    const accountingFile = document.getElementById("accounting").files[0];

    if (!sisFile || !lmsFile || !accountingFile) {
        alert("Please upload all three CSV files.");
        return;
    }

    const sisData = await readCSV(sisFile);
    const lmsData = await readCSV(lmsFile);
    const accountingData = await readCSV(accountingFile);

    const result = sisData.map(student => {

        const id = Number(student.student_id.trim());

        const lms = lmsData.find(
            item => Number(item.student_id) === id
        );

        const accounting = accountingData.find(
            item => Number(item.student_id) === id
        );

        return {
            studentId: id,

            studentName: properCase(student.student_name),

            program: mapProgram(student.program_code),

            emailAddress: student.email.trim().toLowerCase(),

            courseCode: lms
                ? lms.course_code.trim().toUpperCase()
                : null,

            finalGrade: lms
                ? transformGrade(lms.final_grade)
                : null,

            completionStatus: lms
                ? properCase(lms.completion_status)
                : null,

            outstandingBalance: accounting
                ? Number(accounting.account_balance.trim().replace(/,/g, ""))
                : null,

            currency: accounting
                ? accounting.currency.trim().toUpperCase()
                : null
        };
    });

    document.getElementById("output").value =
        JSON.stringify(result, null, 4);
}

