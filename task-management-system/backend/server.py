from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

initialTasks = {
    'To-Do': [],
    'In-Progress': [],
    'Completed': [],
    'Dropped': [],
  }


# Attempt to connect to the MongoDB server
client = MongoClient('localhost', 27017)

# Access server information to verify the connection
server_info = client.server_info()
# print("Successfully connected to MongoDB server:", server_info)

# Access a specific database and collection to further verify the connection
db = client['Tasks']
todo_collection = db['To-Do']
inprogress_collection = db['In-Progress']
completed_collection = db['Completed']
dropped_collection = db['Dropped']


# API endpoint to get all tasks (To-Do)
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    # Get all of the collections in the database
    todo_tasks = list(todo_collection.find())
    inprogress_tasks = list(inprogress_collection.find())
    completed_tasks = list(completed_collection.find())
    dropped_tasks = list(dropped_collection.find())

    # Convert ObjectId to string for JSON serialization
    for task in todo_tasks:
        task['_id'] = str(task['_id'])
    for task in inprogress_tasks:
        task['_id'] = str(task['_id'])
    for task in completed_tasks:
        task['_id'] = str(task['_id'])
    for task in dropped_tasks:
        task['_id'] = str(task['_id'])

    tasks_data = {
        'Dropped': dropped_tasks,
        'Completed': completed_tasks,
        'In-Progress': inprogress_tasks,
        'To-Do': todo_tasks
    }
    return jsonify(tasks_data)


# API endpoint to create a new task in To-Do
@app.route('/api/tasks', methods=['POST'])
def create_task():
    task_data = request.json

    task_id = todo_collection.insert_one(task_data).inserted_id
    new_task = todo_collection.find_one({'_id': task_id})

    if 'name' not in task_data:
        return jsonify({'success': False, 'error': 'Task name is required'}), 400

    new_task_data = {
        'name': new_task['name'],
        'description': new_task['description'],
        'column': new_task['column'],
        '_id': str(task_id)
    }

    return jsonify(new_task_data), 201



# API endpoint to move an existing task (Completed)
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def move_task(task_id):
    try:
        # Receive the 'column' variable passed in through PUT request
        destination_column_name = request.json.get('column')
        print("Received Destination column:", destination_column_name)  # Debugging statement
        source_column_name = request.args.get('sourceColumn')
        print("Received Source column: ", source_column_name)

        # Check if the provided column is valid
        if destination_column_name not in ['To-Do', 'In-Progress', 'Completed', 'Dropped']:
            print(destination_column_name, ": does not match")
            return jsonify({'error': 'Invalid column name'}), 400
        
        
        # Determine the source collection based on the current column name
        source_collection = db[source_column_name]
        # Determine the destination collection based on the column name
        destination_collection = db[destination_column_name]
        # Find the task with the specified id
        task = source_collection.find_one({'_id': ObjectId(task_id)})

        print(task)
        
        # Check if the task exists
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        
        # Update the task's column in the database
        source_collection.update_one({'_id': ObjectId(task_id)}, {'$set': {'column': destination_column_name}})

        # Find the task by its ID and get its document
        task_doc = source_collection.find_one({'_id': ObjectId(task_id)})

        # Insert the task into the destination collection
        destination_collection.insert_one(task_doc)

        # Delete the task from the source collection
        source_collection.delete_one({'_id': ObjectId(task_id)})

        return jsonify({'success': True}), 200
        # Rest of the function
    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False}), 400

    


# API endpoint to delete a task (Dropped)
@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    
    
    try:
        # Convert the task_id to ObjectId
        task_id = ObjectId(task_id)
        print(task_id)

        # Get the passed in 'column' attribute and set it to the respective collection
        column_name = request.args.get('collection')
        delete_from_column = db[column_name]
        print(delete_from_column)
        
        # Delete the task from the database based on the task_id
        delete_from_column.delete_one({'_id': task_id})

        return jsonify({'success': True}), 200
    except Exception as e:
        
        return jsonify({'success': False, 'error': str(e)}), 500

# API endpoint to update a task
@app.route('/api/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    try:
        # Get the passed in parameter 'taskColumn'
        destination_column_name = request.args.get('taskColumn')
        print("Received Destination column:", destination_column_name)  # Debugging statement
        # Get the updated task data from the request body
        updated_task_data = request.json
        print("Updated task data:", updated_task_data)
        collection = db[destination_column_name]

        # Update the task in the database
        collection.update_one({'_id': ObjectId(task_id)}, {'$set': updated_task_data})

        return jsonify({'success': True}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
