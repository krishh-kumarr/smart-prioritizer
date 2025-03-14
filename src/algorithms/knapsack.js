// src/algorithms/knapsack.js

/**
 * Knapsack algorithm implementation using dynamic programming
 * @param {Array} tasks - Array of tasks with value and time properties
 * @param {Number} timeLimit - Maximum time available (in minutes)
 * @returns {Object} - Selected tasks and total value
 */
export const knapsackOptimization = (tasks, timeLimit) => {
  // If there are no tasks, return empty result
  if (!tasks.length) {
    return { selectedTasks: [], totalValue: 0, remainingTime: timeLimit };
  }
  
  // Convert timeLimit to integer (minutes)
  const W = Math.floor(timeLimit);
  const n = tasks.length;
  
  // Special case: When time available is very limited
  if (W <= 0 || (tasks.every(task => task.time > W))) {
    // Find the task with highest importance
    const sortedByImportance = [...tasks].sort((a, b) => {
      // If importance is the same, prioritize shorter tasks
      if (b.importance === a.importance) {
        return a.time - b.time;
      }
      return b.importance - a.importance;
    });
    
    // Return the most important task
    const mostImportantTask = sortedByImportance[0];
    return {
      selectedTasks: [mostImportantTask],
      totalValue: mostImportantTask.importance,
      remainingTime: 0 // We're going over budget
    };
  }
  
  // Create a 2D array for dynamic programming
  const dp = Array(n + 1)
    .fill()
    .map(() => Array(W + 1).fill(0));
  
  // Store which items are included
  const included = Array(n + 1)
    .fill()
    .map(() => Array(W + 1).fill(false));
  
  // Fill the dp table
  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    const taskTime = Math.floor(task.time); // Convert time to integer minutes
    const taskValue = task.importance;
    
    for (let w = 0; w <= W; w++) {
      if (taskTime <= w) {
        // We have enough time for this task
        const includeTask = taskValue + dp[i - 1][w - taskTime];
        const excludeTask = dp[i - 1][w];
        
        if (includeTask > excludeTask) {
          dp[i][w] = includeTask;
          included[i][w] = true;
        } else {
          dp[i][w] = excludeTask;
          included[i][w] = false;
        }
      } else {
        // Not enough time for this task
        dp[i][w] = dp[i - 1][w];
        included[i][w] = false;
      }
    }
  }
  
  // Reconstruct the solution
  const selectedTasks = [];
  let remainingWeight = W;
  
  for (let i = n; i > 0; i--) {
    if (included[i][remainingWeight]) {
      selectedTasks.push(tasks[i - 1]);
      remainingWeight -= Math.floor(tasks[i - 1].time);
    }
  }
  
  return {
    selectedTasks,
    totalValue: dp[n][W],
    remainingTime: remainingWeight
  };
};
