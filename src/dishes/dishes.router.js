const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require('../errors/methodNotAllowed');


router
  .route('/')
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);

module.exports = router;