const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");
const path = require("path");

const app = express();
const DATA_FILE = path.join(__dirname, "../students.json");

app.use(express.json());
app.use(cors());

// 데이터 로드
const loadStudents = async () => {
    try {
        return await fs.readJson(DATA_FILE);
    } catch (error) {
        return {};
    }
};

// 데이터 저장
const saveStudents = async (data) => {
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
};

// 학생 목록 조회
app.get("/students", async (req, res) => {
    const students = await loadStudents();
    res.json(students);
});

// 학생 추가
app.post("/students", async (req, res) => {
    const { grade, classNum, name } = req.body;
    if (!grade || !classNum || !name) {
        return res.status(400).json({ error: "필수 입력 값이 없습니다." });
    }

    const students = await loadStudents();
    if (!students[grade]) students[grade] = {};
    if (!students[grade][classNum]) students[grade][classNum] = [];

    students[grade][classNum].push(name);
    await saveStudents(students);
    
    res.json(students);
});

// 학생 삭제
app.delete("/students", async (req, res) => {
    const { grade, classNum, name } = req.body;

    const students = await loadStudents();
    if (students[grade] && students[grade][classNum]) {
        students[grade][classNum] = students[grade][classNum].filter(student => student !== name);
        if (students[grade][classNum].length === 0) delete students[grade][classNum];
        if (Object.keys(students[grade]).length === 0) delete students[grade];
    }

    await saveStudents(students);
    res.json(students);
});

module.exports = app;
