const router = require("express").Router();

const connection = require("../../database/index");

router.patch("/vote", (req, res) => {
  let idUser = req.body.id;
  let dance_choice = req.body.values.dances;
  let sqlDance = `UPDATE users SET idDance = ? WHERE idUser = ?`;
  const valueDance = [dance_choice, idUser];
  connection.query(sqlDance, valueDance, (err, result) => {
    if (err) throw err;
  });
  let asVoted = {
    messageGood: "Votre vote a été pris en compte",
  };
  res.send(asVoted);
});


router.patch('/resetVotes', (req, res) => {
  const resetVotesSql = "UPDATE users SET idDance = NULL";
  connection.query(resetVotesSql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors de la réinitialisation des votes" });
    }
    return res.json({ message: "Réinitialisation des votes réussie" });
  });
});

router.get("/getDances", (req, res) => {
  try {
    const sql = "SELECT * FROM dances";
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/totalVote", (req, res) => {
  try {
    const sql = "SELECT idDance, COUNT(*) AS CountOfDances FROM users WHERE idDance IS NOT NULL GROUP BY idDance";
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  } catch (error) {
    console.error(error);
  }
});


module.exports = router;
