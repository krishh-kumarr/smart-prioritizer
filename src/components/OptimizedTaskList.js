import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { knapsackOptimization } from '../algorithms/knapsack';

const OptimizedTaskList = ({ tasks, timeLimit, onToggleComplete, onDelete, darkMode }) => {
  const [optimizedTasks, setOptimizedTasks] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const [exceedsTimeLimit, setExceedsTimeLimit] = useState(false);

  useEffect(() => {
    // Show a brief "calculating" state for better UX
    setIsCalculating(true);
    
    const timer = setTimeout(() => {
      // Filter out completed tasks
      const incompleteTasks = tasks.filter(task => !task.completed);
      
      if (incompleteTasks.length === 0) {
        setOptimizedTasks([]);
        setTotalValue(0);
        setRemainingTime(timeLimit);
        setExceedsTimeLimit(false);
        setIsCalculating(false);
        return;
      }
      
      // Get most important task for fallback
      const mostImportantTask = [...incompleteTasks].sort((a, b) => {
        if (b.importance === a.importance) {
          return a.time - b.time; // If equal importance, prefer shorter task
        }
        return b.importance - a.importance;
      })[0];
      
      // Run knapsack algorithm
      const { selectedTasks, totalValue, remainingTime } = knapsackOptimization(
        incompleteTasks,
        timeLimit
      );
      
      // Always suggest at least one task
      if (selectedTasks.length === 0 && incompleteTasks.length > 0) {
        setOptimizedTasks([mostImportantTask]);
        setTotalValue(mostImportantTask.importance);
        setRemainingTime(timeLimit - mostImportantTask.time);
        setExceedsTimeLimit(mostImportantTask.time > timeLimit);
      } else {
        setOptimizedTasks(selectedTasks);
        setTotalValue(totalValue);
        setRemainingTime(remainingTime);
        setExceedsTimeLimit(remainingTime < 0);
      }
      
      setIsCalculating(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [tasks, timeLimit]);

  // Format time (convert minutes back to hours and minutes)
  const formatTime = (timeInMinutes) => {
    const minutes = Math.abs(timeInMinutes); // Handle negative values
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Calculate actual time utilization percentage, capped at 100%
  const getTimeUtilization = () => {
    if (timeLimit <= 0) return 100;
    const utilization = ((timeLimit - remainingTime) / timeLimit) * 100;
    return Math.min(Math.max(0, Math.round(utilization)), 100);
  };

  return (
    <div className={`rounded-xl shadow-sm ${
      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
    }`}>
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Optimized Plan
        </h2>
        <button
          onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
          className={`text-xs ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-5">
        {/* Algorithm explanation */}
        <div className={`transition-all overflow-hidden mb-5 ${
          showAlgorithmInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`p-4 rounded-md text-sm mb-4 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className="font-medium mb-1">About the Algorithm</p>
            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This app uses the Knapsack algorithm with Dynamic Programming to select 
              tasks that maximize total importance while fitting within your available time.
              Tasks are sorted using Merge Sort for optimal performance.
            </p>
          </div>
        </div>
        
        {/* Warning banner when exceeding time limit */}
        {exceedsTimeLimit && (
          <div className={`mb-5 p-3 rounded-md flex items-start ${
            darkMode ? 'bg-yellow-900/30 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              This task exceeds your available time but is recommended as your highest priority.
            </span>
          </div>
        )}
        
        {/* Summary stats */}
        <div className={`grid grid-cols-2 gap-3 mb-5 ${isCalculating ? 'opacity-50' : ''}`}>
          <div className={`p-3 rounded-md ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</div>
            <div className="text-xl font-bold">{totalValue}</div>
          </div>
          
          <div className={`p-3 rounded-md ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasks Selected</div>
            <div className="text-xl font-bold">{optimizedTasks.length}</div>
          </div>
          
          <div className={`p-3 rounded-md ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time Used</div>
            <div className="text-lg font-bold">{formatTime(timeLimit - remainingTime)}</div>
          </div>
          
          <div className={`p-3 rounded-md ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {exceedsTimeLimit ? 'Time Exceeded' : 'Time Remaining'}
            </div>
            <div className={`text-lg font-bold ${exceedsTimeLimit ? (darkMode ? 'text-red-400' : 'text-red-500') : ''}`}>
              {exceedsTimeLimit ? `+${formatTime(-remainingTime)}` : formatTime(remainingTime)}
            </div>
          </div>
        </div>
        
        {/* Time utilization bar */}
        <div className="mb-5">
          <div className={`flex justify-between text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>Time Utilization</span>
            <span>{exceedsTimeLimit ? '> 100%' : `${getTimeUtilization()}%`}</span>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-full transition-all duration-500 ease-out ${exceedsTimeLimit ? 
                (darkMode ? 'bg-red-500' : 'bg-red-500') : 
                'bg-indigo-600'}`}
              style={{ width: `${getTimeUtilization()}%` }}
            ></div>
          </div>
        </div>
        
        {isCalculating ? (
          <div className="flex items-center justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-sm font-medium">Optimizing...</span>
          </div>
        ) : optimizedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <svg className={`w-12 h-12 mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add tasks to generate an optimized plan
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {optimizedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedTaskList;
