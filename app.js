//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash")

const date = require(__dirname + "/date.js");
const app = express();
const Note = require(__dirname +"/Note");

const Port = process.env.Port | 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const workItems = [];
let items = [];
const mongoDB = "mongodb+srv://test:test123@cluster0.7qb31hr.mongodb.net/noteDB";
mongoose.set("bufferCommands", false);

async function run() {
  await mongoose
    .connect(mongoDB)
    .then(() => console.log("connected"))
    .catch((e) => console.log(e));
}
async function fetchUser() {
  try {
    items = await Note.note.find({}, "note");
  } catch (err) {
    console.log(err);
  }
}
// const bruh = new Note({
//   note: "BRUH!"
// })

// const buyItems = new Note({
//   note: "Buy apples!"
// })
// const reminder = new Note({
//   note: "Take a Shit"
// })

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "you gotta give a name to your list"],
  },
  list: [Note.noteSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", async function (req, res) {
  await run();
  const day = date.getDate();
  await fetchUser();

  await mongoose.connection.close();
  res.render("list", { listTitle: "Today", newListItems: items });
});

app.get("/:title", async function (req, res) {
  await run();
  const title = _.capitalize(req.params.title);
  const exists = await List.findOne({ name: title });
  if (exists === null) {
    const list = new List({
      name: title,
      list: []
    })

    await List.create(list)
    const newList = await List.findOne({ name: title });
    if(newList !== null){
      res.render("list", {listTitle: newList.name, newListItems: newList.list})
    }

  } else {
    try {
      res.render("list", { listTitle: exists.name, newListItems: exists.list });
    } catch (err) {
      console.log("error");
    }
  }
});

app.post("/", async function (req, res) {
  await run();
  const item = req.body.newItem;
  const listName = req.body.list

  if(listName === "Today"){
    try {
      await Note.note.create({note: item});
    } catch (error) {
      console.log("you didnt specify a note");
    }
    
    res.redirect("/")
  }else{
    const otherList = await List.findOne({name: listName})
    const note = new Note.note({
      note: item
    })
    
    try{
      otherList.list.push(note)
    await otherList.save()
    }catch(err){
      console.log("you didnt write anything in the Note");
    }
    res.redirect(`/`+ otherList.name)
  }
});

app.post("/delete", async function (req, res) {
  await run();
  const listName = req.body.listName
  const value = req.body.check;
  
  if(listName === "Today"){
    await Note.note.findOneAndDelete({_id: value})
    res.redirect("/")
  }else{
    console.log(listName);
  await List.findOneAndUpdate({name: listName},{$pull: {list: {_id: value}}})
  res.redirect("/"+ listName);
  }
  
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(Port, function () {
  console.log(`Server started on port ${Port}`);
});
