import React, { Component } from "react";
import Slider from "./Slider";
import Spinner from "./Spinner";
import "./App.css";

function log(msg) {
  console.log("logger: ", msg);
}

function sleep(ms) {
  let start = new Date().getTime();
  while (new Date().getTime() - start < ms) {}
}

export default class App extends Component {
  state = { count: 0, processed: 0 };
  updateRequested = false;

  addBatch = size => {
    let i = size;
    while (i > 0) {
      // add a task
      this.addTaskToQueue();
      i--;
    }
  };

  updateTaskDisplay = () => {
    this.setState(
      prev => {
        return {
          count: tasks.length,
          processed: prev.processed + (prev.count - tasks.length)
        };
      },
      () => {
        this.updateRequested = false;
      }
    );
  };

  scheduleDisplayUpdate = () => {
    if (!this.updateRequested) {
      requestAnimationFrame(this.updateTaskDisplay);
      this.updateRequested = true;
    }
  };

  // increment count and add a task with the count
  addTaskToQueue = () => {
    this.setState(
      prev => ({
        count: prev.count + 1
      }),
      () => {
        addTask(() => {
          log(this.state.count);
          sleep(5);

          // schedule a ui update
          this.scheduleDisplayUpdate();
        });
      }
    );
  };

  runTimeout = () => scheduleWork();
  runBlocking = () => scheduleBlockingWork();
  runIdle = () => scheduleIdleWork();
  runRAF = () => scheduleRAFWork();

  render() {
    return (
      <div className="main">
        <div className="controls">
          <h1>Timers</h1>
          <div className="tasks">
            <p>Task queue size: {this.state.count}</p>
            <p>Processed count: {this.state.processed}</p>
          </div>
          <div className="actions">
            <BatchSize onClick={this.addBatch} />
            <button onClick={this.addTaskToQueue}>add single task</button>

            <button onClick={this.runTimeout}>schedule work</button>
            <button onClick={this.runBlocking}>schedule blocking work</button>
            <button onClick={this.runIdle}>schedule idle work</button>
            <button onClick={this.runRAF}>schedule RAF work</button>
          </div>
        </div>
        <div className="widgets">
          {/* add any additional widgets you want her to visualize how they are affected */}
          <img
            alt="demo-gif"
            src="https://media.giphy.com/media/1C7E1dWqSrv56/giphy.gif"
          />
          <div>
            <Slider />
            <Spinner />
          </div>
        </div>
      </div>
    );
  }
}

class BatchSize extends React.Component {
  state = { size: 1000 };

  handleSizeChange = evt => {
    const size = evt.target.value;
    this.setState({ size });
  };

  handleAddBatch = () => {
    this.props.onClick(this.state.size);
  };

  render() {
    return (
      <div className="batch-size">
        <input
          type="number"
          value={this.state.size}
          onChange={this.handleSizeChange}
        />
        <button onClick={this.handleAddBatch}>add batch</button>
      </div>
    );
  }
}

// this represents a global task queue
var tasks = [];
var deadline = null;

function addTask(cb) {
  tasks.push(cb);
}

// process till complete potenially blocking the main thread
function processTasksUntilComplete() {
  while (tasks.length) {
    processTask();
  }

  return true;
}

// process a single task
function processTask() {
  const task = tasks.shift();
  task();
  return tasks.length === 0;
}

// process while time remains in our deadline
function processTasksUntilDeadline() {
  let runtime = performance.now();
  let processed = 0;
  do {
    processTask();
    processed++;
    runtime = performance.now();
  } while (tasks.length > 0 && runtime < deadline);

  if (runtime > deadline) {
    console.log("exceeded deadline");
  }
  console.log(`processed ${processed} tasks`);
  return tasks.length === 0;
}

/// Schedulers
/// Schedule using setTimeout 0
function scheduleWork() {
  performance.mark("scheduleWork");
  setTimeout(rescheduleWork, 0);
}

function rescheduleWork() {
  deadline = performance.now() + 5;
  // schedule the next chunk of work
  var handle = setTimeout(rescheduleWork, 0);
  if (processTasksUntilDeadline()) {
    clearTimeout(handle);
    performance.measure("scheduleWork", "scheduleWork");
  }
}

/// Schedule using requestAnimationFrame
function rescheduleRAFWork() {
  deadline = performance.now() + 5;
  let handle = requestAnimationFrame(rescheduleRAFWork);
  if (processTasksUntilDeadline()) {
    cancelAnimationFrame(handle);
    performance.measure("scheduleRAFWork", "scheduleRAFWork");
  }
}

function scheduleRAFWork() {
  performance.mark("scheduleRAFWork");
  requestAnimationFrame(rescheduleRAFWork);
}

/// Schedule using setTimeout but processing the queue until completion
function rescheduleBlockingWork() {
  var handle = setTimeout(rescheduleWork, 0);
  if (processTasksUntilComplete()) {
    clearTimeout(handle);
    performance.measure("scheduleBlockingWork", "scheduleBlockingWork");
  }
}

function scheduleBlockingWork() {
  performance.mark("scheduleBlockingWork");
  setTimeout(rescheduleBlockingWork, 0);
}

/// Schedule using requestIdleCallback with 1s deadline
let taskHandle = null;
function scheduleIdleWork() {
  if (!taskHandle) {
    performance.mark("scheduleIdleWork");
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 });
  }
}

function runTaskQueue(deadline) {
  while (
    (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
    tasks.length
  ) {
    let task = tasks.shift();

    task();
  }

  if (tasks.length) {
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 });
  } else {
    taskHandle = 0;
    performance.measure("scheduleIdleWork", "scheduleIdleWork");
  }
}
