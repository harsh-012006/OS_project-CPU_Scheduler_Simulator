function simulate() {
    const processes = document.getElementById("processes").value.split(",");
    const arrivalTimes = document.getElementById("arrivalTimes").value.split(",").map(Number);
    const burstTimes = document.getElementById("burstTimes").value.split(",").map(Number);
    const algorithm = document.getElementById("algorithm").value;
    const priorities = document.getElementById("priorities")?.value?.split(",").map(Number); // Optional
    const quantum = parseInt(document.getElementById("quantum")?.value); // Optional

    let waitingTimes = [];
    let turnaroundTimes = [];
    let ganttChart = [];
    let currentTime = 0;

    switch (algorithm) {
        case "fcfs":
            // FCFS Scheduling
            currentTime = 0;
            for (let i = 0; i < processes.length; i++) {
                if (currentTime < arrivalTimes[i]) {
                    currentTime = arrivalTimes[i];
                }
                waitingTimes[i] = currentTime - arrivalTimes[i];
                currentTime += burstTimes[i];
                turnaroundTimes[i] = currentTime - arrivalTimes[i];
                ganttChart.push({ process: processes[i], start: currentTime - burstTimes[i], end: currentTime });
            }
            break;

        case "sjf":
            // SJF Scheduling (Preemptive)
            let remainingBurstTimesSJF = [...burstTimes];
            let completedSJF = new Array(processes.length).fill(false);
            let startTimeSJF = new Array(processes.length).fill(0); // Track segment start times
            let waitingTimeSJF = new Array(processes.length).fill(0); // Track total waiting time
            currentTime = 0;
            let completedProcessesSJF = 0;

            while (completedProcessesSJF < processes.length) {
                let shortest = -1;
                for (let j = 0; j < processes.length; j++) {
                    if (arrivalTimes[j] <= currentTime && !completedSJF[j] && (shortest === -1 || remainingBurstTimesSJF[j] < remainingBurstTimesSJF[shortest])) {
                        shortest = j;
                    }
                }

                if (shortest === -1) {
                    currentTime++;
                    continue;
                }

                if (remainingBurstTimesSJF[shortest] === burstTimes[shortest]) {
                    startTimeSJF[shortest] = currentTime;
                }

                remainingBurstTimesSJF[shortest]--;
                currentTime++;

                if (remainingBurstTimesSJF[shortest] === 0) {
                    completedSJF[shortest] = true;
                    turnaroundTimes[shortest] = currentTime - arrivalTimes[shortest];
                    completedProcessesSJF++;
                    waitingTimeSJF[shortest] = currentTime - arrivalTimes[shortest] - burstTimes[shortest]; // Calculate total waiting
                    ganttChart.push({ process: processes[shortest], start: startTimeSJF[shortest], end: currentTime });
                } else {
                    // Preemption occurs, record segment
                    ganttChart.push({ process: processes[shortest], start: startTimeSJF[shortest], end: currentTime });
                    startTimeSJF[shortest] = currentTime; // Update start time for next segment
                }
            }
            waitingTimes = waitingTimeSJF; // Assign total waiting times
            break;

        case "priority":
            // Priority Scheduling (Preemptive)
            let processDataPriority = processes.map((p, i) => ({ process: p, arrival: arrivalTimes[i], burst: burstTimes[i], priority: priorities[i], remainingBurst: burstTimes[i], completed: false }));
            let startTimePriority = new Array(processes.length).fill(0); // Track segment start times
            let waitingTimePriority = new Array(processes.length).fill(0); // Track total waiting time
            currentTime = 0;
            let completedProcessesPriority = 0;

            while (completedProcessesPriority < processes.length) {
                let highestPriority = -1;
                for (let j = 0; j < processes.length; j++) {
                    if (processDataPriority[j].arrival <= currentTime && !processDataPriority[j].completed && (highestPriority === -1 || processDataPriority[j].priority < processDataPriority[highestPriority].priority)) {
                        highestPriority = j;
                    }
                }

                if (highestPriority === -1) {
                    currentTime++;
                    continue;
                }

                if (processDataPriority[highestPriority].remainingBurst === processDataPriority[highestPriority].burst) {
                    startTimePriority[highestPriority] = currentTime;
                }

                processDataPriority[highestPriority].remainingBurst--;
                currentTime++;

                if (processDataPriority[highestPriority].remainingBurst === 0) {
                    processDataPriority[highestPriority].completed = true;
                    turnaroundTimes[highestPriority] = currentTime - processDataPriority[highestPriority].arrival;
                    completedProcessesPriority++;
                    waitingTimePriority[highestPriority] = currentTime - processDataPriority[highestPriority].arrival - processDataPriority[highestPriority].burst; // Calculate total waiting
                    ganttChart.push({ process: processDataPriority[highestPriority].process, start: startTimePriority[highestPriority], end: currentTime });
                } else {
                    // Preemption occurs, record segment
                    ganttChart.push({ process: processDataPriority[highestPriority].process, start: startTimePriority[highestPriority], end: currentTime });
                    startTimePriority[highestPriority] = currentTime; // Update start time for next segment
                }
            }
            waitingTimes = waitingTimePriority; // Assign total waiting times
            break;

        case "roundrobin":
            // Round Robin Scheduling
            let remainingBurst = [...burstTimes];
            let queue = processes.map((p, i) => ({ process: p, arrival: arrivalTimes[i], burst: burstTimes[i], index: i }));
            let completedQueue = [];
            currentTime = 0;

            while (queue.length > 0) {
                let currentProcess = queue.shift();
                if (currentProcess.arrival <= currentTime) {
                    if (remainingBurst[currentProcess.index] > quantum) {
                        currentTime += quantum;
                        remainingBurst[currentProcess.index] -= quantum;
                        queue.push(currentProcess);
                        ganttChart.push({ process: currentProcess.process, start: currentTime - quantum, end: currentTime });
                    } else {
                        currentTime += remainingBurst[currentProcess.index];
                        waitingTimes[currentProcess.index] = currentTime - arrivalTimes[currentProcess.index] - burstTimes[currentProcess.index];
                        turnaroundTimes[currentProcess.index] = currentTime - arrivalTimes[currentProcess.index];
                        ganttChart.push({ process: currentProcess.process, start: currentTime - remainingBurst[currentProcess.index], end: currentTime });
                        completedQueue.push(currentProcess);
                        remainingBurst[currentProcess.index] = 0;
                    }
                } else {
                    queue.unshift(currentProcess);
                    currentTime++;
                }
            }
            break;
    }

    // Calculate average waiting time and turnaround time
    const avgWaitingTime = waitingTimes.reduce((a, b) => a + b, 0) / processes.length;
    const avgTurnaroundTime = turnaroundTimes.reduce((a, b) => a + b, 0) / processes.length;

    // Display results
    document.getElementById("waitingTime").innerText = "Average Waiting Time: " + avgWaitingTime.toFixed(2);
    document.getElementById("turnaroundTime").innerText = "Average Turnaround Time: " + avgTurnaroundTime.toFixed(2);
    document.getElementById("ganttChart").innerText = "Gantt Chart: " + JSON.stringify(ganttChart);

    document.getElementById("results").style.display = "block";
}