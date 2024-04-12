// import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './components/column.css';
import './App.css';
import Modal from 'react-modal';
import axios from 'axios';

function TaskColumn({ tasks, colName, onTaskClick, updateTasks}) {
  const [addTaskModalIsOpen, setAddTaskModalIsOpen] = useState(false);

  const handleAddTaskClick = () => {
    console.log('Add Task button clicked');
    setAddTaskModalIsOpen(true);
  };

  const closeAddTaskModal = () => {
    setAddTaskModalIsOpen(false);
  }

  const appendTask = async (event) => {
    event.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskColumn = colName;
  
    try {
      // Send a POST request to the backend API endpoint
      const response = await axios.post('http://127.0.0.1:5000/api/tasks', {
        name: taskName,
        description: taskDescription,
        column: taskColumn
      });
      
      // Handle successful response
      console.log('Task added successfully:', response.data.name);
      console.log('colName: ', colName);
      
      updateTasks(colName, response.data, "add");
      // setInitialTasks(updatedTasks);

      setAddTaskModalIsOpen(false); // Close the modal
    } catch (error) {
      // Handle error
      console.error('Error adding task:', error);
      // Optionally, display an error message to the user
    }
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
          <h2>{task.name}</h2>
        </div>
      ))}
      <Modal isOpen={addTaskModalIsOpen} onRequestClose={closeAddTaskModal}>
        <h2>Add New Task</h2>
        <form>
          <label htmlFor="taskName">Task Name: </label>
          <input type="text" id="taskName" />
          <label htmlFor="taskDescription">Task Description: </label>
          <input type="text" id="taskDescription" style={{ height: '100px' }}/>
          <button className="cancel-button" onClick={closeAddTaskModal}>Cancel</button>
          <button onClick={appendTask}>Add Task</button>
        </form>
      </Modal>
    </div>
  );
}

function App() {
  const [initialTasks, setInitialTasks] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [moveModalIsOpen, setMoveModalIsOpen] = useState(false);
  const [destinationColumn, setDestinationColumn] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    // Fetch initial task data from the backend when the component mounts
    axios.get('http://127.0.0.1:5000/api/tasks')
      .then(response => {
        setInitialTasks(response.data);
      })
      .catch(error => {
        console.error('Error fetching initial tasks:', error);
      });
  }, []); // Empty dependency array ensures that the effect runs only once when the component mounts

  const handleTaskClick = (task) => {
    
    // To-Do: Get information about the Task and display it on screen
    console.log(task);
    setSelectedTask(task);
    setModalIsOpen(true);
    console.log('Clicked task:', task.name);
    // console.log('setModalIsOpen: ', modalIsOpen);
  }

  const openMoveModal = () => {
    setMoveModalIsOpen(true);
    // console.log("setMoveModalIsOpen", moveModalIsOpen);
  }

  const closeMoveModal = () => {
    setMoveModalIsOpen(false);
    // console.log("setMoveModalIsOpen", moveModalIsOpen);
  }

  const closeModal = () => {
    setModalIsOpen(false);
    // console.log("setModalIsOpen", modalIsOpen);
  }

  const updateTasks = (columnName, task, action) => {
    setInitialTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      // console.log(updatedTasks);
      // console.log(updatedTasks[columnName]);
      // console.log(newTask)
      // console.log(newTask.name)
      console.log(columnName)
      if (action === "add") {
        updatedTasks[columnName] = [...prevTasks[columnName], task];
      } else if (action === "delete") {
        updatedTasks[columnName] = prevTasks[columnName].filter(t => t._id !== task._id);
      }
      
      return updatedTasks;
    });
  }

  const handleDeleteTask = async (taskToDelete) => {
    try {

      updateTasks(taskToDelete.column, taskToDelete, "delete");

      // Send a DELETE request to the backend API to delete the selected task
      await axios.delete(`http://127.0.0.1:5000/api/tasks/${selectedTask._id}`);

      // Close the modal after successful deletion
      closeModal();
    } catch (error) {
      console.error('Error deleting task:', error);
      // Handle error
    }
  }

  const handleColumnChange = (column) => {
    console.log("Before setDestinationColumn: ", column);
    setDestinationColumn(column);
    // console.log("Before setDestinationColumn: ", e);
  }

  const handleMoveTask = async(taskToMove, destColumn) => {
    console.log(destColumn);
    console.log(taskToMove);
    console.log(selectedTask._id);
    if (selectedTask._id === taskToMove._id) {
      console.log("Task IDs are the same!");
    }
    try {
      // updateTasks(taskToMove.column, taskToMove, "remove");
      const moveToColumn = {
        column: destColumn
      }
      console.log("Moving task to: ", moveToColumn);

      await axios.put(`http://127.0.0.1:5000/api/tasks/${taskToMove._id}`, moveToColumn);
      
      // updateTasks(taskToMove.column, taskToMove, "delete");
      // updateTasks(taskToMove.column, taskToMove, "add");

      closeModal();
      
    } catch (error) {
      console.error('Error moving task:', error);
    }
    
  }

  return (
    <div className="Kanban-board">
      {Object.keys(initialTasks).reverse().map((columnName, index) => (
        <div key={index} className="task-column-list">
          <TaskColumn
            tasks={initialTasks[columnName]}
            colName={columnName}
            onTaskClick={handleTaskClick}
            updateTasks={updateTasks}
          />
        </div>
      ))}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>{selectedTask && selectedTask.name}</h2>
        <p>{selectedTask && selectedTask.description}</p>
        <button className="cancel-button" onClick={closeModal}>Close</button>
        <button className="delete-button" onClick={() => handleDeleteTask(selectedTask)}>Delete</button>
        <button className="move-button" onClick={openMoveModal}>Move</button>
      </Modal>
      <Modal isOpen={moveModalIsOpen} onRequestClose={() => setMoveModalIsOpen(false)}>
        <h2>Move this task to where?</h2>
        <p>Select where to move task: </p>
        <select onChange={(e) => handleColumnChange(e.target.value)}>
          <option value =""></option>
          <option value ="In-Progress"> In Progress</option>
          <option value ="To-Do">To-Do</option>
          <option value ="Completed">Completed</option>
          <option value ="Dropped">Dropped</option>
        </select>
        <button className="cancel-button" onClick={closeMoveModal}>Cancel</button>
        <button className="move-button" onClick={() => handleMoveTask(selectedTask, destinationColumn)}>Move Task</button>
      </Modal>
      
    </div>
  );
}

export default App;
