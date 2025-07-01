const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8888"],
  }),
);
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

const port = 8000;
const secret = "mysecret";

let conn = null;

// function init connection mysql
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tutorial",
  });
};

/* เราจะแก้ไข code ที่อยู่ตรงกลาง */

app.get("/hello", (req, res) => {
  res.send("Hello World"); 
});

app.post("/api/register", async (req,res) =>{
    const { email,password } = req.body;
    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", email);
    
    if (rows.length) {
        return res.status(400).send({ message: "Email is already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userData = {
            email, //email : email,
            password: passwordHash, 
    }

    try{
        const [results] = await conn.query("INSERT INTO users SET ?",userData)
        res.json({
            message: "User registered successfully",
            results //เท่ากับ results :results
        });
    }catch (error) {
        console.log(error);
        res.json({
            message: "Cant Insert User!",
            error
        })
    }  
})

app.post("/api/login", async (req,res) => {
    try{
        const {email, password} = req.body;
        const [result] = await conn.query("SELECT * FROM users WHERE email = ?", email);
        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            res.status(400).send({
                message: "Invalid password!"
            })
            return false;
        }
        const token = jwt.sign({ email, role: "user"},secret,{expiresIn: "1h"});
        //วิธี1 ส่ง response กลับไปเป็น token
        // res.send({
        //     message: "Login successfullly!",
        //     token
        // })

        //วิธี2 ส่ง token ไปเก็บใน cookie
        res.cookie('token',token, {
            maxAge: 300000, // 5 minutes
            secure: true,
            httpOnly: true,
            sameSite: "none",
        })
        res.send({ message: "Login successful!", token });
        
    }catch(error){
        console.log(error);
        res.status(401).send({
            message: "Email not found!"
        })
    }
    
})

app.get("/api/users", async (req, res) => {
    try {
        // const authHeader = req.headers['authorization']
        const authToken = req.cookies.token;
        // let authToken;
        // if(authHeader){
        //     authToken = authHeader.split(' ')[1];
        // }
        console.log(authToken);
        const user =jwt.verify(authToken, secret);
        console.log('user', user);

        //recheck ว่า email ที่ได้มาจาก token นั้นมีอยู่ในฐานข้อมูลหรือไม่
        const [checkResult] = await conn.query('SELECT * FROM users WHERE email =?', user.email);
        if(!checkResult.length){
            throw new Error("User not found");
        }
        //มั่นใจแล้วว่าเป็น user ที่ถูกต้อง
        const [result] = await conn.query('SELECT * FROM users');
        res.send({
            users: result
        })
    } catch (error) {
        console.log(error);
        res.status(403).send({
            message: "Unauthorized",
            error
        });
    }

})

// Listen
app.listen(port, async () => {
  await initMySQL();
  console.log("Server started at port 8000");
});