const router = require("express").Router();
const controllers = require("../controllers");

router.post("/create", (req, res) => {
  controllers.accounts.createCustomer(req, res);
});

router.post("/auth", (req, res) => {
    controllers.accounts.authenticate(req, res);
  });

  router.post("/initatm", (req, res) => {
    controllers.accounts.initATM(req, res);
  });
  router.post("/withdraw", (req, res) => {
    controllers.accounts.withdraw(req, res);
  });

  module.exports = router;