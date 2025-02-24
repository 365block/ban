require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

const StudentSchema = new mongoose.Schema({
    grade: String,
    classNum: String,
    name: String
});
const Student = mongoose.model("Student", StudentSchema);

// 학생 목록 조회
app.get("/students", async (req, res) => {
    const students = await Student.find();
    const formattedData = {};

    students.forEach(student => {
        const key = `${student.grade}-${student.classNum}`;
        if (!formattedData[student.grade]) formattedData[student.grade] = {};
        if (!formattedData[student.grade][student.classNum]) formattedData[student.grade][student.classNum] = [];
        formattedData[student.grade][student.classNum].push(student.name);
    });

    res.json(formattedData);
});

// 학생 추가
app.post("/students", async (req, res) => {
    const { grade, classNum, name } = req.body;
    if (!grade || !classNum || !name) {
        return res.status(400).json({ error: "필수 입력 값이 없습니다." });
    }
    await new Student({ grade, classNum, name }).save();
    res.json(await Student.find());
});

// 학생 삭제
app.delete("/students", async (req, res) => {
    const { grade, classNum, name } = req.body;
    await Student.findOneAndDelete({ grade, classNum, name });
    res.json(await Student.find());
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
