from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)

# Configure PyMongo
app.config["MONGO_URI"] = "mongodb://username:password@localhost:27017/dbname"
mongo = MongoClient(app.config["MONGO_URI"])
db = mongo.dbname

# Define the Task model
class Task:
    def __init__(self, title, description=None):
        self.title = title
        self.description = description

    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description
        }

# API endpoint to get all tasks (To-Do)
@app.route('/tasks/todo', methods=['GET'])
def get_tasks_todo():
    tasks = db.tasks.find({'status': 'To-Do'})
    return jsonify([task for task in tasks])

# API endpoint to create a new task (In Progress)
@app.route('/tasks/inprogress', methods=['POST'])
def add_task_in_progress():
    data = request.get_json()
    task = Task(data.get('title', ''), data.get('description', ''))
    task_id = db.tasks.insert_one({**task.to_dict(), 'status': 'In Progress'}).inserted_id
    return jsonify({'id': str(task_id), **task.to_dict(), 'status': 'In Progress'}), 201

# API endpoint to update an existing task (Completed)
@app.route('/tasks/completed/<task_id>', methods=['PUT'])
def update_task_completed(task_id):
    data = request.get_json()
    db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': {**data, 'status': 'Completed'}})
    task = db.tasks.find_one({'_id': ObjectId(task_id)})
    return jsonify(task) if task else jsonify({'message': 'Task not found'}), 404

# API endpoint to delete a task (Dropped)
@app.route('/tasks/dropped/<task_id>', methods=['DELETE'])
def delete_task_dropped(task_id):
    result = db.tasks.delete_one({'_id': ObjectId(task_id)})
    return jsonify({'message': 'Task dropped'}) if result.deleted_count > 0 else jsonify({'message': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
