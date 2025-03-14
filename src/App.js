import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TimeSlider from './components/TimeSlider';
import OptimizedTaskList from './components/OptimizedTaskList';
import { mergeSort } from './algorithms/mergeSort';
import { 
  saveTasks, 
  loadTasks, 
  saveTimeLimit, 
  loadTimeLimit,
  saveSortPreferences,
  loadSortPreferences
} from './utils/localStorage';

function App() {
  const [tasks, setTasks] = useState([]);
  const [timeLimit, setTimeLimit] = useState(480); // Default: 8 hours
  const [sortBy, setSortBy] = useState('importance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load data from local storage on initial render
  useEffect(() => {
    setTasks(loadTasks());
    setTimeLimit(loadTimeLimit());
    
    const { sortBy: savedSortBy, sortOrder: savedSortOrder } = loadSortPreferences();
    setSortBy(savedSortBy);
    setSortOrder(savedSortOrder);
    
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    setIsFirstLoad(false);
  }, []);

  // Save tasks to local storage when they change
  useEffect(() => {
    if (!isFirstLoad) {
      saveTasks(tasks);
    }
  }, [tasks, isFirstLoad]);

  // Save time limit to local storage when it changes
  useEffect(() => {
    if (!isFirstLoad) {
      saveTimeLimit(timeLimit);
    }
  }, [timeLimit, isFirstLoad]);
  
  // Save sort preferences when they change
  useEffect(() => {
    if (!isFirstLoad) {
      saveSortPreferences(sortBy, sortOrder);
    }
  }, [sortBy, sortOrder, isFirstLoad]);

  // Add a new task
  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  // Toggle task completion status
  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Handle time limit change
  const handleTimeChange = (newTime) => {
    setTimeLimit(newTime);
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Get sorted tasks using Merge Sort algorithm
  const getSortedTasks = () => {
    const incompleteTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);
    
    // Sort incomplete tasks
    const sortedIncompleteTasks = mergeSort(
      incompleteTasks,
      sortBy,
      sortOrder === 'asc'
    );
    
    // Sort completed tasks (always by completion date, newest first)
    const sortedCompletedTasks = mergeSort(completedTasks, 'id', true);
    
    return [...sortedIncompleteTasks, ...sortedCompletedTasks];
  };

  const sortedTasks = getSortedTasks();
  const hasCompletedTasks = tasks.some(task => task.completed);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <nav className={`sticky top-0 z-10 backdrop-blur-lg ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4H18V6H20V8H18V10H16V8H14V6H16V4Z" fill="currentColor" />
              <path d="M6 8H10V6H6V8Z" fill="currentColor" />
              <path d="M8 10V14H6V10H8Z" fill="currentColor" />
              <path d="M10 12V16H8V12H10Z" fill="currentColor" />
              <path d="M8 18V20H10V18H8Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M2 2H22V22H2V2ZM4 4H20V20H4V4Z" fill="currentColor" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold">TaskOptimize</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <span className="text-xs mr-2">
                {tasks.length} tasks · {tasks.filter(t => t.completed).length} completed
              </span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <TaskForm onAddTask={handleAddTask} darkMode={darkMode} />
            
            <div className={`mb-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Sort & Filter</h2>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="importance">Importance</option>
                      <option value="time">Time Required</option>
                      <option value="name">Task Name</option>
                      <option value="createdAt">Date Added</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="desc">Highest to Lowest</option>
                      <option value="asc">Lowest to Highest</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {sortedTasks.length} total task{sortedTasks.length !== 1 ? 's' : ''}
                  </span>
                  
                  {hasCompletedTasks && (
                    <button 
                      onClick={handleClearCompleted}
                      className={`text-sm px-3 py-1 rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
                          : 'bg-gray-100 text-red-500 hover:bg-gray-200'
                      }`}
                    >
                      Clear completed
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <TaskList
              tasks={sortedTasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              darkMode={darkMode}
            />
          </div>
          
          <div className="lg:col-span-4">
            <TimeSlider 
              timeLimit={timeLimit} 
              onChange={handleTimeChange}
              darkMode={darkMode} 
            />
            
            <OptimizedTaskList
              tasks={tasks}
              timeLimit={timeLimit}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
      
      <footer className={`mt-12 py-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
        <p>TaskOptimize - Using Knapsack Algorithm & Merge Sort</p>
        <p className="mt-1">Made with ❤️ for efficient productivity by team AndroNova </p>
      </footer>
    </div>
  );
}

export default App;
