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

# # Configure PyMongo
# app.config["MONGO_URI"] = "mongodb://localhost:27017/"
# mongo = MongoClient(app.config["MONGO_URI"])
# db = mongo.dbname

# Attempt to connect to the MongoDB server
client = MongoClient('localhost', 27017)

# Access server information to verify the connection
server_info = client.server_info()
print("Successfully connected to MongoDB server:", server_info)

# Access a specific database and collection to further verify the connection
db = client['Tasks']
todo_collection = db['To-Do']
inprogress_collection = db['In-Progress']
completed_collection = db['Completed']
dropped_collection = db['Dropped']

# Define the Task model
# class Task:
#     def __init__(self, title, description=None):
#         self.title = title
#         self.description = description

#     def to_dict(self):
#         return {
#             'title': self.title,
#             'description': self.description
#         }

# API endpoint to get all tasks (To-Do)
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
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
        'In Progress': inprogress_tasks,
        'To-Do': todo_tasks
    }
    return jsonify(tasks_data)

# @app.route('/tasks/todo', methods=['GET'])
# def get_tasks_todo():
#     tasks = db.tasks.find({'status': 'To-Do'})
#     return jsonify([task for task in tasks])

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

    # task_id = todo_collection.insert_one(task_data).inserted_id

    return jsonify(new_task_data), 201


# API endpoint to create a new task (In Progress)
# @app.route('/tasks/inprogress', methods=['POST'])
# def add_task_in_progress():
#     data = request.get_json()
#     task = Task(data.get('title', ''), data.get('description', ''))
#     task_id = db.tasks.insert_one({**task.to_dict(), 'status': 'In Progress'}).inserted_id
#     return jsonify({'id': str(task_id), **task.to_dict(), 'status': 'In Progress'}), 201

# API endpoint to update an existing task (Completed)
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def move_task(task_id):
    try:
        column = request.json.get('column')
        print("Received column:", column)  # Debugging statement
        # Rest of the function
    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False}), 400

    # Check if the provided column is valid
    if column not in ['To-Do', 'In-Progress', 'Completed', 'Dropped']:
        return jsonify({'error': 'Invalid column name'}), 400
    
    # Find the task in the database by its ID
    task = todo_collection.find_one({'_id': ObjectId(task_id)})

    print(task)
    
    # Check if the task exists
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Update the task's column in the database
    todo_collection.update_one({'_id': ObjectId(task_id)}, {'$set': {'column': column}})
    
    # Determine the destination collection based on the column name
    destination_collection = db[column]

    # Find the task by its ID and get its document
    task_doc = todo_collection.find_one({'_id': ObjectId(task_id)})

    # Insert the task into the destination collection
    destination_collection.insert_one(task_doc)

    # Delete the task from the original collection
    todo_collection.delete_one({'_id': ObjectId(task_id)})

    return jsonify({'success': True}), 200
    

# # API endpoint to update an existing task (Completed)
# @app.route('/tasks/completed/<task_id>', methods=['PUT'])
# def update_task_completed(task_id):
#     data = request.get_json()
#     db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': {**data, 'status': 'Completed'}})
#     task = db.tasks.find_one({'_id': ObjectId(task_id)})
#     return jsonify(task) if task else jsonify({'message': 'Task not found'}), 404

# API endpoint to delete a task (Dropped)
@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        # Convert the task_id to ObjectId
        task_id = ObjectId(task_id)

        # Delete the task from the database based on the task_id
        # Example deletion logic for 'To-Do' collection:
        todo_collection.delete_one({'_id': task_id})

        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
# @app.route('/tasks/dropped/<task_id>', methods=['DELETE'])
# def delete_task_dropped(task_id):
#     result = db.tasks.delete_one({'_id': ObjectId(task_id)})
#     return jsonify({'message': 'Task dropped'}) if result.deleted_count > 0 else jsonify({'message': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
