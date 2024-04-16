import React, { useState, useEffect } from 'react';
import './components/column.css';
import Modal from 'react-modal';
import axios from 'axios';

// Component for rendering a column of tasks
function TaskColumn({ tasks, colName, onTaskClick, updateFrontEndTasks}) {
  // State variables
  const [addTaskModalIsOpen, setAddTaskModalIsOpen] = useState(false);

  // Handle events when Add Task button is clicked
  const handleAddTaskClick = () => {
    console.log('Add Task button clicked');
    setAddTaskModalIsOpen(true);
  };

  // Close the Add Task Modal
  const closeAddTaskModal = () => {
    setAddTaskModalIsOpen(false);
  }
  
  // Function to add a new task to the To-Do column
  const appendTask = async (event) => {
    event.preventDefault();
    // Get the values from the input fields
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
      
      // Add the task to the frontend for rendering
      updateFrontEndTasks(colName, response.data, "add");
      // setInitialTasks(updatedTasks);

      setAddTaskModalIsOpen(false); // Close the modal
    } catch (error) {
      // Handle error
      console.error('Error adding task:', error);
      // Optionally, display an error message to the user
    }
  }
  
  return (
    <div className="column">
      {/* Render the "Add Task" button only for the "To-Do" column */}
      {colName === "To-Do" && (
        <button className ="add-task-button" onClick={handleAddTaskClick}>Add Task</button>
      )}
      {/* Render the column header */}
      <h2>{colName}</h2>
      {/* Render each task in the column */}
      {tasks.map((task, index) => (
        <div
          key={index}
          className="task"
          onClick={() => onTaskClick(task)}
        >
          <h2>{task.name}</h2>
        </div>
      ))}
      {/* Add Task Modal */}
      <Modal
        isOpen={addTaskModalIsOpen}
        onRequestClose={closeAddTaskModal}
        style={{
          overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          content: {
            position: 'absolute',
            margin: 'auto',
            maxWidth: '350px',
            maxHeight: '325px',
            overflow: 'auto'
          }
        }}
      >
        <h2>Add New Task</h2>
        <form>
          <label htmlFor="taskName">Task Name: </label>
          <input type="text" id="taskName" style={{ display: 'block', width: '300px' }}/>
          <br></br>
          <label htmlFor="taskDescription" style={{ display: 'block' }}>Task Description: </label>
          <textarea type="text" id="taskDescription" style={{ height: '100px', width: '300px', resize: 'none' }}/>
          <button className="cancel-button" onClick={closeAddTaskModal}>Cancel</button>
          <button className="add-button" onClick={appendTask}>Add Task</button>
        </form>
      </Modal>
    </div>
  );
}

function App() {
  const columnOrder = ['To-Do', 'In-Progress', 'Completed', 'Dropped'];

  // Various state variables
  const [initialTasks, setInitialTasks] = useState({});
  const [taskInfoModalIsOpen, setTaskInfoModalIsOpen] = useState(false);
  const [moveModalIsOpen, setMoveModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [destinationColumn, setDestinationColumn] = useState('');
  const [originalTask, setOriginalTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    console.log('Component rendered');
    // Fetch initial task data from the backend when the component mounts
    axios.get('http://127.0.0.1:5000/api/tasks')
      .then(response => {
        setInitialTasks(response.data);
      })
      .catch(error => {
        console.error('Error fetching initial tasks:', error);
      });
  }, []); // Empty dependency array ensures that the effect runs only once when the component mounts

  const openEditModal = () => {
    // Show the Edit modal on screen
    setEditModalIsOpen(true);
  }

  const openMoveModal = () => {
    // Show the Move Modal on screen
    setMoveModalIsOpen(true);
  }

  const closeMoveModal = () => {
    // Close the Move Modal
    setMoveModalIsOpen(false);
  }

  const closeEditModal = () => {
    // Restore the task's values to their original values
    setSelectedTask(originalTask);
    // Close the Edit Modal
    setEditModalIsOpen(false);
  }

  const closeTaskInfoModal = () => {
    // Close the TaskInfo Modal
    setTaskInfoModalIsOpen(false);
  }

  const updateFrontEndTaskColumns = (columnName, task, action) => {
    setInitialTasks(prevTasks => {
      // Create a copy of the previous tasks object to avoid mutating state directly
      const updatedTasks = { ...prevTasks };
      // Create an updated task object with the new column name
      const updatedTask = {...task, column: columnName };
      // Update the tasks based on the specified action
      if (action === "add") {
        updatedTasks[columnName] = [...prevTasks[columnName], updatedTask];
        console.log("added task to: ", columnName);
      } else if (action === "delete") {
        // Remove the task with the specified ID from the specified column
        updatedTasks[columnName] = prevTasks[columnName].filter(t => t._id !== task._id);
        console.log("deleted task from: ", columnName);
      } else if (action === "update") {
        // Update the specified column with the updated task
        updatedTasks[columnName] = [updatedTask];
        console.log("Updated: ", updatedTasks[columnName]);
      }
      return updatedTasks;
    });
  }

  // Handles events when a task is clicked
  const handleTaskClick = (task) => {
    // Set the selected task to the clicked task
    setSelectedTask(task);
    
    // Save a copy of the clicked task for live editing
    setOriginalTask({ ...task });
    setTaskInfoModalIsOpen(true);
    console.log('Clicked task:', task.name, " ID: ", task._id);
  }

  // Set State to contain the column to move to
  const handleColumnChange = (column) => {
    setDestinationColumn(column);
  }

  // Handle the deletion of tasks
  const handleDeleteTask = async (taskToDelete, deleteFromColumn) => {
    try {
      // Send a DELETE request to the backend API to delete the selected task
      await axios.delete(`http://127.0.0.1:5000/api/tasks/${taskToDelete._id}?collection=${deleteFromColumn}`);

      // Update the frontend task columns by removing the deleted task
      updateFrontEndTaskColumns(taskToDelete.column, taskToDelete, "delete");
      
      // Close the modal after successful deletion
      closeTaskInfoModal();
    } catch (error) {
      console.error('Error deleting task:', error);
      // Handle error
    }
  }

  // Handles moving a task from one column to another
  const handleMoveTask = async(taskToMove, destColumn, sourceColumn) => {
    console.log("column to add to:", destColumn);
    console.log("column to delete from: ", sourceColumn);
    
    try {
      // Define the new column data for the task
      const moveToColumn = {
        column: destColumn
      }
      console.log("Moving task to: ", moveToColumn);

      // Send a PUT request to the backend API to update the task's column
      await axios.put(`http://127.0.0.1:5000/api/tasks/${taskToMove._id}?sourceColumn=${sourceColumn}`, moveToColumn);
      
      // Update the frontend task columns
      updateFrontEndTaskColumns(sourceColumn, taskToMove, "delete");
      updateFrontEndTaskColumns(destColumn, taskToMove, "add");

      // Close the move modal and task info modal after successful task move
      closeMoveModal();
      closeTaskInfoModal();
      
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }

  // Handles updating the attributes of a task
  const handleUpdateTask = async(taskToUpdate, newTaskName, newTaskDescription, column) => {
    console.log(taskToUpdate);
    console.log("handleUpdateTask column: ", column);
    console.log("name to change: ", newTaskName);
    console.log("description to change: ", newTaskDescription);
  
    try {
      // Define the column data for the task
      const taskColumn = {
        column: column
      }

      // Send a PATCH request to update the task with new attributes
      await axios.patch(`http://127.0.0.1:5000/api/tasks/${selectedTask._id}?taskColumn=${column}`, {
          name: newTaskName,
          description: newTaskDescription
      }, taskColumn);

      // Update the frontend task columns to reflect the changes
      updateFrontEndTaskColumns(selectedTask.column, selectedTask, "update");

      // Close the various modals
      closeEditModal();
      closeTaskInfoModal();
    } catch (error) {
        console.error('Error updating task:', error);
    }
    
  }

  // Render the Kanban board, consisting of TaskColumn components for each column
  return (
    <div className="Kanban-board">
      {/* Define the desired order of columns */}
      

      {/* Map over each column in initialTasks and render a TaskColumn component */}
      {columnOrder.map((columnName, index) => (
        <div key={index} className="task-column-list">
          {/* Render a TaskColumn component */}
          {Object.keys(initialTasks)
            .filter(key => key === columnName)
            .map(filteredColumnName => (
            <TaskColumn
              tasks={initialTasks[columnName]}
              colName={columnName}
              onTaskClick={handleTaskClick}
              updateFrontEndTasks={updateFrontEndTaskColumns}
            />
          ))}
            
        </div>
      ))}

      {/* Task Info Modal*/}
      <Modal
        isOpen={taskInfoModalIsOpen}
        onRequestClose={closeTaskInfoModal}
        style={{
          overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
          },
          content: {
            position: 'absolute',
            margin: 'auto',
            maxWidth: '350px', // Adjust as needed
            maxHeight: '325px', // Adjust as needed
            overflow: 'auto' // Enable scrolling if content overflows
          }
        }}
      >
        {/* Render task information and various buttons*/}
        <h2>{selectedTask && selectedTask.name}</h2>
        <p>{selectedTask && selectedTask.description}</p>
        <button className="cancel-button" onClick={closeTaskInfoModal}>Close</button>
        <button className="delete-button" onClick={() => handleDeleteTask(selectedTask, selectedTask.column)}>Delete</button>
        <button className="move-button" onClick={openMoveModal}>Move</button>
        <button className="edit-button" onClick={openEditModal}>Edit</button>
      </Modal>

      {/* Move Modal*/}
      <Modal
        isOpen={moveModalIsOpen}
        onRequestClose={() => setMoveModalIsOpen(false)}
        style={{
          overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
          },
          content: {
            position: 'absolute',
            margin: 'auto',
            maxWidth: '350px', // Adjust as needed
            maxHeight: '325px', // Adjust as needed
            overflow: 'auto' // Enable scrolling if content overflows
          }
        }}
      >
        {/* Render move modal content */}
        <h2>Move this task to where?</h2>
        <p>Select where to move task: </p>
        {/* Dropdown for selecting destination column */}
        <select onChange={(e) => handleColumnChange(e.target.value)}>
          <option value =""></option>
          <option value ="To-Do">To-Do</option>
          <option value ="In-Progress"> In Progress</option>
          <option value ="Completed">Completed</option>
          <option value ="Dropped">Dropped</option>
        </select>
        <button className="cancel-button" onClick={closeMoveModal}>Cancel</button>
        <button className="move-button" onClick={() => handleMoveTask(selectedTask, destinationColumn, selectedTask.column)}>Move Task</button>
      </Modal>
      
      {/* Edit Modal*/}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={() => setEditModalIsOpen(false)}
        style={{
          overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
          },
          content: {
            position: 'absolute',
            margin: 'auto',
            maxWidth: '350px', // Adjust as needed
            maxHeight: '325px', // Adjust as needed
            overflow: 'auto' // Enable scrolling if content overflows
          }
        }}
      >
        <h2>Edit</h2>
        <div>
          <label htmlFor="editName">Task Name: </label>
          <input
            type="text"
            id="editName"
            defaultValue={selectedTask?.name}
            style={{ display: 'block', width: '300px' }}
            onChange={(e) => {
              console.log('New name: ', e.target.value);
              setSelectedTask({
                ...selectedTask,
                name: e.target.value
              });
            }}
          />
          <br></br>
          <label htmlFor="editName">Task Description: </label>
          <textarea
            type="text"
            id="editDescription"
            style={{ height: '100px', width: '300px', resize: 'none' }}
            defaultValue={selectedTask?.description}
            onChange={(e) => {
              console.log('New description: ', e.target.value);
              setSelectedTask({
                ...selectedTask,
                description: e.target.value
              });
            }}/>
        </div>
        <button className="cancel-button" onClick={closeEditModal}>Cancel</button>
        <button className="update-button" onClick={() => handleUpdateTask(selectedTask, selectedTask.name, selectedTask.description, selectedTask.column)}>Update</button>
      </Modal>  
    </div>
  );
}

export default App;
