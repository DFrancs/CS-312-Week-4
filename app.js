const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB", err));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({ name: "Welcome to your To-Do List!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "← Hit this to delete an item." });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', function(req, res) {
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItems;
      }
    })
    .then(foundItems => {
      res.render('list', { listTitle: "Today", newListItems: foundItems });
    })
    .catch(err => console.log(err));
});

app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        return list.save();
      } else {
        return foundList;
      }
    })
    .then(foundList => {
      res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
    })
    .catch(err => console.log(err));
});

app.post('/', function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save().then(() => res.redirect('/'));
  } else {
    List.findOne({ name: listName })
      .then(foundList => {
        foundList.items.push(item);
        return foundList.save();
      })
      .then(() => res.redirect('/' + listName))
      .catch(err => console.log(err));
  }
});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
      .then(() => res.redirect('/'))
      .catch(err => console.log(err));
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
      .then(() => res.redirect('/' + listName))
      .catch(err => console.log(err));
  }
});

app.get('/about', function(req, res) {
  res.render('about');
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port " + port);
});