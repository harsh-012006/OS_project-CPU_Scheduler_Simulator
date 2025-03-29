from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# CPU Scheduling Algorithms (Replace with your actual implementations)
def fcfs(processes, arrival_times, burst_times):
    # Your FCFS scheduling logic here
    # Calculate waiting times, turnaround times, generate Gantt chart
    # ...
    return {"waiting_time": 0, "turnaround_time": 0, "gantt_chart": "..."}

def sjf(processes, arrival_times, burst_times):
    # Your SJF scheduling logic here
    # ...
    return {"waiting_time": 0, "turnaround_time": 0, "gantt_chart": "..."}

def priority(processes, arrival_times, burst_times, priorities):
    # Your Priority scheduling logic here
    # ...
    return {"waiting_time": 0, "turnaround_time": 0, "gantt_chart": "..."}

def round_robin(processes, arrival_times, burst_times, quantum):
    # Your Round Robin scheduling logic here
    # ...
    return {"waiting_time": 0, "turnaround_time": 0, "gantt_chart": "..."}

# Home Route (renders the HTML page)
@app.route("/")
def home():
    return render_template("index.html")

# API Route to Process Requests
@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.json
    processes = data.get("processes", [])
    arrival_times = data.get("arrivalTimes", [])
    burst_times = data.get("burstTimes", [])
    algorithm = data.get("algorithm", "fcfs")  # Default to FCFS
    
    # Additional parameters (e.g., priorities, quantum)
    priorities = data.get("priorities", [])  # For Priority scheduling
    quantum = data.get("quantum", 2)  # For Round Robin

    if algorithm == "fcfs":
        result = fcfs(processes, arrival_times, burst_times)
    elif algorithm == "sjf":
        result = sjf(processes, arrival_times, burst_times)
    elif algorithm == "priority":
        result = priority(processes, arrival_times, burst_times, priorities)
    elif algorithm == "roundrobin":
        result = round_robin(processes, arrival_times, burst_times, quantum)
    else:
        return jsonify({"error": "Invalid algorithm selected"}), 400

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)