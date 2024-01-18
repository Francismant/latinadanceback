const router = require("express").Router()

const connection  = require("../../database")

router.get("/getEvents", (req, res) => {
    const sql = "SELECT * FROM events"
    connection.query(sql, (err, result) => {
        if (err) throw err
        res.send(JSON.stringify(result))
    })
})

router.delete("/deleteEvent/:idEvent", (req, res) => {
    const id = req.params.idEvent;
    const deleteSql = "DELETE FROM events WHERE idEvent= ?";
    connection.query(deleteSql, [id], (err, result) => {
      if (err) throw err;
    });
    res.sendStatus(200);
  });

  router.post("/addEvent", (req, res) => {
    const { date, title, duration, price, poster } = req.body;
    const insertSql =
      "INSERT INTO events (date_hour, title, duration, price ,imgBlob) VALUES (?, ?, ?, ?, ?)";
    connection.query(
      insertSql,
      [date, title, duration, price, poster],
      (err, result) => {
        if (err) throw err;
        let lastInsertId = result.insertId;
        let sqlLastOne = "SELECT * FROM events WHERE idEvent = ?";
        connection.query(sqlLastOne, [lastInsertId], (err, result) => {
          res.send(JSON.stringify(result));
        });
      }
    );
  });

module.exports = router;