const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://dkf55:CbsUsDa6INXr1RWK@fustercluck.qsxdxw3.mongodb.net/?retryWrites=true&w=majority&appName=FusterCluck', {tls: true});

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
  const customListName = req.params.customListName;

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
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});


app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
      if (!err) {
        res.redirect('/' + listName);
      }
    });
  }
});


app.get('/about', function(req, res) {
  res.render('about');
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port " + port);
});
