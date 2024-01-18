require("dotenv").config()

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { key, keyPub } = require("../../keys");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASSWORD_MAIL,
  },
});

const connection = require("../../database");

router.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  const verifyMailSql = "SELECT * FROM users WHERE email = ?";
  connection.query(verifyMailSql, [email], async (err, result) => {
    if (err) throw err;
    try {
      if (result.length === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertSql =
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        connection.query(
          insertSql,
          [name, email, hashedPassword],
          (err, result) => {
            if (err) throw err;
            let idUser = result.insertId;
            const sqlSelect =
              "SELECT idUser, name, email FROM users WHERE idUser = ?";
            connection.query(sqlSelect, [idUser], (err, result) => {
              if (err) throw err;
              res.json(result);
            });
          }
        );
      } else {
        res.status(400).json();
      }
    } catch (error) {
      console.error(error);
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sqlVerify = "SELECT * FROM users WHERE email= ?";
  connection.query(sqlVerify, [email], (err, result) => {
    try {
      if (result.length > 0) {
        if (bcrypt.compareSync(password, result[0].password)) {
          const token = jsonwebtoken.sign({}, key, {
            subject: result[0].idUser.toString(),
            expiresIn: 3600 * 24 * 30,
            algorithm: "RS256",
          });
          res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          result[0].password = "";
          res.json(result[0]);
        } else {
          res.status(400).json("Email et/ou mot de passe incorrects");
        }
      } else {
        res.status(400).json("Email et/ou mot de passe incorrects");
      }
    } catch (error) {
      console.log(error);
    }
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.end();
});

router.get("/userConnected", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decodedToken = jsonwebtoken.verify(token, keyPub, {
        algorithms: "RS256",
      });
      const sqlSelect =
        "SELECT idUser, name, email,admin FROM users WHERE idUser  =?";
      connection.query(sqlSelect, [decodedToken.sub], (err, result) => {
        if (err) throw err;
        const connectedUser = result[0];
        connectedUser.password = "";
        if (connectedUser) {
          res.json(connectedUser);
        } else {
          res.json(null);
        }
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json(null);
  }
});

router.delete("/deleteUser/:idUser", (req, res) => {
  const id = req.params.idUser;
  const deleteSql = "DELETE FROM users WHERE idUser= ?";
  connection.query(deleteSql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
    return res.json({ message: "Compte supprimé avec succès" });
  });
});

router.get("/resetPassword/:email", (req, res) => {
  const email = req.params.email;
  const sqlSearchMail = "SELECT * FROM users WHERE email = ?";
  connection.query(sqlSearchMail, [email], (err, result) => {
    if (err) throw err;
    if (result.length !== 0) {
      const confirmLink = `http://localhost:3000/resetPassword?email=${email}`;
      const mailOptions = {
        from: "mantfrancis@gmail.com",
        to: email,
        subject: "Modification du mot de passe sur le site de lillelatinadance",
        text: `Cliquez sur ce lien pour modifier votre mot de passe : ${confirmLink}`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          throw err;
        } else {
          res.end();
        }
      });
    } else {
      res.status(400).json();
    }
  });
});

router.get("/createAccount/:email", (req, res) => {
  const email = req.params.email;
  const sqlSearchMail = "SELECT * FROM users WHERE email = ?";
  connection.query(sqlSearchMail, [email], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      const confirmLink = `http://localhost:3000/register?email=${email}`;
      const mailOptions = {
        from: "mantfrancis@gmail.com",
        to: email,
        subject: "création de compte sur le site lillelatinadance",
        text: `Cliquez sur ce lien pour pouvoir créer votre compte : ${confirmLink}`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          throw err;
        } else {
          res.end();
        }
      });
    } else {
      res.status(400).json();
    }
  });
});

router.patch("/changePassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sqlUserExist = "SELECT * FROM users WHERE email = ?";
    connection.query(sqlUserExist, [email], async (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatePasswordSql = "UPDATE users SET password = ? WHERE email = ?";
      connection.query(
        updatePasswordSql,
        [hashedPassword, email],
        (err, result) => {
          if (err) throw err;
          res.json({ success: "Mot de passe mis à jour avec succès." });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur interne." });
  }
});

module.exports = router;
