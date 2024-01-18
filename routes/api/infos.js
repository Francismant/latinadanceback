const router = require("express").Router();

const connection = require("../../database");

router.get("/getInfos", (req, res) => {
    const sql = "SELECT * FROM infos";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

router.patch('/changeInfos', (req, res) => {
    let {infos} = req.body;
    const value=0
    const changeInfosCoursSql = "UPDATE infos SET text = ? WHERE idInfos = ?";
    connection.query(changeInfosCoursSql, [infos, value], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur lors du changement du message" });
        }
        return res.json({ message: "Le texte a été modifié" });
    });
});




module.exports = router;