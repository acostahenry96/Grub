const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));


const nextId = require("../utils/nextId");


function list(req, res, next) {
  res.json({ data: dishes });
}

function isValidDish(req, res, next) {
  const { data: { description, image_url, name, price } = {} } = req.body;
  console.log(req.body);

  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  if (!description) {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  if (!price || price === "" || price <= 0 || typeof(price) !== "number") {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!image_url) {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
 
  next();
}

function dishExists(req, res, next) {
  res.locals.foundDish = dishes.find((dish) => dish.id === req.params.dishId);
  
  if (res.locals.foundDish) {
    return next();
  } else {
    return next({
      status: 404,
    });
  }
}

function dishIdValid(req, res, next) {
  const { data: { id } = {} } = req.body;

  if (!req.params.dishId) {
     
    return next({
      status: 404,
      message: `Dish does not exist ${req.params.dishId}`,
    });
  }
  if (id) {
    if (req.params.dishId !== id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
      });
    }
  }

  next();
}

function create(req, res, next) {
  
  const { data: { description, image_url, name, price } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.foundDish });
}

function update(req, res) {
  const {data: {id, name, description, image_url, price} = {} } = req.body

  res.locals.foundDish.id = id
  res.locals.foundDish.name = name
  res.locals.foundDish.description = description
  res.locals.foundDish.image_url = image_url
  res.locals.foundDish.price = price

  res.json({ data: res.locals.foundDish });
}

function destroy(req,res,next){
    res.locals.foundDish = dishes.find((dish) => dish.id === req.params.dishId);
    console.log(res);
    if (res.locals.foundDish) {
      return next({
        status: 405
      });
    } else {
      return next({
        status: 405,
      });
    }

}


module.exports = {
  list,
  create: [isValidDish, create],
  read: [dishExists, read],
  update: [dishExists, dishIdValid, isValidDish, update],
  delete:[destroy]
};