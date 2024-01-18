const router = require("express").Router();
const apiUsers = require("./users");
const apiDances = require("./dances");
const apiEvents = require("./events");
const apiInfos = require("./infos");

router.use("/users", apiUsers);
router.use("/dances", apiDances);
router.use("/events", apiEvents);
router.use("/infos", apiInfos);

module.exports = router;
