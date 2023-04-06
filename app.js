const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format } = require("date-fns");
var isValid = require("date-fns/isValid");
//import { format, compareAsc } from "date-fns";

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "./todoApplication.db");

let db = null;

//initialize server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Listening  at port http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message()}`);
  }
};

initializeDBAndServer();

const convertDBObject = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  };
};

//get todos
app.get("/todos", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  let todoList = null;
  console.log(status);
  if (status) {
    const getTodoQuery = `SELECT * FROM todo where status='${status}'`;
    todoList = await db.all(getTodoQuery);
  } else if (priority) {
    const getTodoQuery = `SELECT * FROM todo where priority='${priority}'`;
    todoList = await db.all(getTodoQuery);
  } else if (priority && status) {
    const getTodoQuery = `SELECT * FROM todo where priority='${priority} and status='${status}'`;
    todoList = await db.all(getTodoQuery);
  } else if (category) {
    const getTodoQuery = `SELECT * FROM todo where category='${category}'`;
    todoList = await db.all(getTodoQuery);
  } else if (category && status) {
    const getTodoQuery = `SELECT * FROM todo where category='${category} and status='${status}'`;
    todoList = await db.all(getTodoQuery);
  } else if (category && priority) {
    const getTodoQuery = `SELECT * FROM todo where category='${category} and priority='${priority}'`;
    todoList = await db.all(getTodoQuery);
  } else {
    const getTodoQuery = `SELECT * FROM todo where todo LIKE '%${search_q}%'`;
    todoList = await db.all(getTodoQuery);
  }
  let listFinal = [];
  for (let each of todoList) {
    listFinal.push(convertDBObject(each));
  }
  response.send(listFinal);
});

//api 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo where id=${todoId}`;
  console.log(getTodoQuery);
  todoList = await db.get(getTodoQuery);
  if (todoList) {
    response.send(convertDBObject(todoList));
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

//api 3
app.get("/agenda/", async (request, response) => {
  console.log(request.query);
  const { date } = request.query;
  let todoList = null;
  if (date) {
    const getTodoQuery = `SELECT * FROM todo where due_date = '${date}'`;
    todoList = await db.all(getTodoQuery);
    let listFinal = [];
    for (let each of todoList) {
      listFinal.push(convertDBObject(each));
    }
    response.send(listFinal);
  } else {
    const getTodoQuery = `SELECT * FROM todo`;
    todoList = await db.all(getTodoQuery);
    let listFinal = [];
    for (let each of todoList) {
      listFinal.push(convertDBObject(each));
    }
    response.send(listFinal);
  }
});

app.post("/todos", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  postTodoQuery = `INSERT INTO todo VALUES
    (${id},'${todo}','${priority}','${status}','${category}','${dueDate}')`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

const convert = (obj) => {
  return {
    id_: obj.id,
    todo_: obj.todo,
    priority_: obj.priority,
    status_: obj.status,
    category_: obj.category,
    dueDate_: obj.dueDate,
  };
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo where id=${todoId}`;
  todoList = await db.get(getTodoQuery);
  if (todoList) {
    const todoDetails = request.body;
    const { id_, todo_, priority_, status_, category_, dueDate_ } = convert(
      todoList
    );
    let { id, todo, priority, status, category, dueDate } = todoDetails;
    if (todo) {
      updateTodoQuery = `UPDATE todo SET
      id= ${id_},
      todo = '${todo}',
      priority = '${priority_}',
      status = '${status_}',
      category = '${category_}',
      due_date = '${dueDate_}'
      where id=${id_}`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
    } else if (status) {
      if (
        (status === "DONE") |
        (status === "IN PROGRESS") |
        (status === "TO DO")
      ) {
        updateTodoQuery = `UPDATE todo SET
      id= ${id_},
      todo = '${todo_}',
      priority = '${priority_}',
      status = '${status}',
      category = '${category_}',
      due_date = '${dueDate_}'
      where id=${id_}`;
        console.log(updateTodoQuery);
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else if (priority) {
      if (
        (priority === "HIGH") |
        (priority === "MEDIUM") |
        (priority === "LOW")
      ) {
        updateTodoQuery = `UPDATE todo SET
      id= ${id_},
      todo = '${todo_}',
      priority = '${priority}',
      status = '${status_}',
      category = '${category_}',
      due_date = '${dueDate_}'
      where id=${id_}`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else if (category) {
      if (
        (category === "WORK") |
        (category === "HOME") |
        (category === "LEARNING")
      ) {
        updateTodoQuery = `UPDATE todo SET
      id= ${id_},
      todo = '${todo_}',
      priority = '${priority_}',
      status = '${status_}',
      category = '${category}',
      due_date = '${dueDate_}'
      where id=${id_}`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }
    } else if (dueDate) {
      date = dueDate.split("-");
      console.log(parseInt(date[0]));
      console.log(isValid(new Date(NaN, NaN, NaN)));
      if (
        isValid(
          new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]))
        )
      ) {
        dueDate = format(
          new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2])),
          "yyyy - MM - dd"
        );
        console.log(dueDate);
        updateTodoQuery = `UPDATE todo SET
      id= ${id_},
      todo = '${todo_}',
      priority = '${priority_}',
      status = '${status_}',
      category = '${category_}',
      due_date = '${dueDate}'
      where id=${id_}`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Date category");
      }
    }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  deleteTodoQuery = `DELETE FROM todo where id=${todoId}`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
