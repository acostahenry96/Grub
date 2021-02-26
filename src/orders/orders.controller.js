const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  if(!foundOrder) {
    next({ status: 404, message: `order with id ${orderId} does not exist` });
    return;
  }

  res.locals.order = foundOrder;
  next();
}

function validateOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, status } } = req.body;
  const requiredOrderFields = ['deliverTo', 'mobileNumber', 'dishes'];

  if(!Array.isArray(dishes) || dishes.length < 1) {
    next({ 
      status: 400, 
      message: `Order must include at least one dish`
    });
    return;
  }

  for(const field of requiredOrderFields) {
    if(!req.body.data[field]){
      next({ status: 400, message: `Order must include a ${field}` });
      return;
    }
  }

  if(req.params.orderId) {
    if(!status || status.length === 0 || status === 'invalid') {
      next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
      return;
    }
  }

  for(const dish in dishes) {
    if(!dishes[dish].quantity 
      || typeof dishes[dish].quantity !== 'number' 
      || dishes[dish].quantity <= 0) {
      next({ 
        status: 400, 
        message: `Dish ${dish} must have a quantity that is an integer greater than 0` 
      });
      return;
    }
  }

  next();
}

function list(req, res, next) {
  res.status(200).json({ data: orders });
}

function read(req, res, next) {
  res.status(200).json({ data: res.locals.order });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes };

  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
  const order = res.locals.order;
  const orderId = req.params.orderId;
  const { data: { deliverTo, mobileNumber, dishes } } = req.body;

  if(req.body.data.id && req.body.data.id !== orderId){
    next({ 
      status: 400, 
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orderId}.`
      });
    return;
  }

  const fields = ['deliverTo', 'mobileNumber', 'dishes'];
  for(const field of fields){
    if(req.body.data[field]){
      order[field] = req.body.data[field];
    }
  }

  res.status(200).json({ data: order });
}

function destroy(req, res, next) {
  const order = res.locals.order;
  const orderId = req.params.orderId;
  const orderIndex = orders.findIndex((ord) => ord.id === orderId);

  if(order.status !== 'pending') {
    next({ status: 400, message: 'An order cannot be deleted unless it is pending' });
    return;
  }

  orders.slice(orderIndex, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  update: [orderExists, validateOrder, update],
  create: [validateOrder, create],
  delete: [orderExists, destroy]
}