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

function Task({ tasks, status }) {
  return (
    <div className="task">
      <h2>{status}</h2>
      {Object.keys(tasks).map((status) => (
        <div key={status} className="task-column-list">
          <h2>{status}</h2>
          {/* {Object.keys(tasks[status].map(task, index) => (
            <div key={index} className="task"{task}></div>
          ))} */}
        </div>
      ))}
    </div>
  );
}

function App() {
  const initialTasks = {
    ToDo: ["Task 1", "Task 2"],
    InProgress: ["Task 3"],
    Completed: [],
    Dropped: [],
  };

  return (
    <div className="Kanban-board">
      <div className="task-column-list">
        <Task tasks={initialTasks} status="ToDo" />
    
      </div>
      
      {/* <div className="column">
        <h2>In-Progress</h2>
      </div>

      
      <div className="column">
        <h2>Completed</h2>
      </div>
      
      
      <div className="column">
        <h2>Dropped</h2>
      </div> */}
      
    </div>
  );
}

export default App;
