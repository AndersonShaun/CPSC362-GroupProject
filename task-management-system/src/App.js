// import logo from './logo.svg';
import React, { useState } from 'react';
import './components/column.css';
import './App.css';
import Modal from 'react-modal';


// Back-end starts here
// Database
// const initialTasks = {
//   ToDo: ["Task 1", "Task 2"],
//   InProgress: ["Task 3"],
//   Completed: [],
//   Dropped: [],
// };



function TaskColumn({ tasks, colName, onTaskClick }) {
  const [addTaskModalIsOpen, setAddTaskModalIsOpen] = useState(false);

  const handleAddTaskClick = () => {
    console.log('Add Task button clicked');
    setAddTaskModalIsOpen(true);
  };

  const closeAddTaskModal = () => {
    setAddTaskModalIsOpen(false);
  }

  const appendTask = () => {
    setAddTaskModalIsOpen(false);
    // Add the task to the data base
  }
  
  return (
    <div className="column">
      {colName === "To-Do" && (
        <button className ="add-button" onClick={handleAddTaskClick}>Add Task</button>
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
      <Modal isOpen={addTaskModalIsOpen} onRequestClose={closeAddTaskModal}>
        <h2>Add New Task</h2>
        <form>
          <label htmlFor="taskName">Task Name: </label>
          <input type="text" id="taskName" />
          <label htmlFor="taskDescription">Task Description: </label>
          <input type="text" id="taskDescription" />
          <button onClick={closeAddTaskModal}>Cancel</button>
          <button onClick={appendTask}>Add Task</button>
        </form>
      </Modal>
    </div>
  );
}

function App() {

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const initialTasks = {
    ToDo: ["Task 5", "Task 6", "Task 7" ],
    InProgress: ["Task 2", "Task 4"],
    Completed: ["Task 1"],
    Dropped: ["Task 3"],
  };

  const handleTaskClick = (task) => {
    
    // To-Do: Get information about the Task and display it on screen
    setSelectedTask(task);
    setModalIsOpen(true);
    console.log('Clicked task:', task);
    console.log('setModalIsOpen: ', modalIsOpen);
  }

  const closeModal = () => {
    setModalIsOpen(false);
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
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>Task Details</h2>
        <p>{selectedTask}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

export default App;
