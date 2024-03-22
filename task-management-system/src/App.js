// import logo from './logo.svg';
import React from 'react';
import './components/column.css';
import './App.css';

// Back-end starts here
// Database
// const initialTasks = {
//   ToDo: ["Task 1", "Task 2"],
//   InProgress: ["Task 3"],
//   Completed: [],
//   Dropped: [],
// };



function TaskColumn({ tasks, colName, onTaskClick }) {
  
  return (
    <div className="column">
      {colName === "To-Do" && (
        <button className ="add-button">Add Task</button>
      )}
      <h2>{colName}</h2>
      {tasks.map((task, index) => (
        <div
          key={index}
          className="task"
          onClick={() => onTaskClick(task)}
        >
          <h2>{task}</h2>
        </div>
      ))}
    </div>
  );
}

function App() {
  
const initialTasks = {
  ToDo: ["Task 5", "Task 6", "Task 7" ],
  InProgress: ["Task 2", "Task 4"],
  Completed: ["Task 1"],
  Dropped: ["Task 3"],
};

const handleTaskClick = (task) => {
  console.log('Clicked task:', task);
  // To-Do: Get information about the Task and display it on screen
}

  return (
    <div className="Kanban-board">
      <div className="task-column-list">
        <TaskColumn tasks={initialTasks.ToDo} colName="To-Do" onTaskClick={handleTaskClick}/>
      </div>
      <div className="task-column-list">
        <TaskColumn tasks={initialTasks.InProgress} colName="In Progress" onTaskClick={handleTaskClick}/>
      </div>
      <div className="task-column-list">
        <TaskColumn tasks={initialTasks.Completed} colName="Completed" onTaskClick={handleTaskClick}/>
      </div>
      <div className="task-column-list">
        <TaskColumn tasks={initialTasks.Dropped} colName="Dropped" onTaskClick={handleTaskClick}/>
      </div>
    </div>
  );
}

export default App;
