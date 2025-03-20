import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Sun, Moon, Search, Trash2, Edit2, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'overdue' | 'submitted' | 'following' | 'working' | 'completed';
  date: string;
  category?: string;
  description?: string;
}

interface StatusGroup {
  title: string;
  status: Task['status'] | 'all';
  icon?: React.ReactNode;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'submitted' | 'following' | 'working' | 'completed'>('all');
  const [category, setCategory] = useState<string>('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStatusControls, setShowStatusControls] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const statusGroups: StatusGroup[] = [
    { title: 'Overdue', status: 'overdue' },
    { title: 'Submitted', status: 'submitted' },
    { title: 'Following', status: 'following' },
    { title: 'Working', status: 'working', icon: <div className="w-2 h-2 rounded-sm bg-indigo-600 dark:bg-indigo-400" /> },
    { title: 'Completed', status: 'completed', icon: <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" /> },
    { title: 'All', status: 'all' }
  ];

  const statusOrder = ['overdue', 'submitted', 'following', 'working', 'completed'];

  const moveTaskStatus = (taskId: string, direction: 'up' | 'down') => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const currentIndex = statusOrder.indexOf(task.status);
        const newIndex = direction === 'up' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(statusOrder.length - 1, currentIndex + 1);
        return { ...task, status: statusOrder[newIndex] as Task['status'] };
      }
      return task;
    }));
    setShowStatusControls(null);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      description: newDescription,
      status: 'overdue',
      date: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      category: category || undefined
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
    setNewDescription('');
    setCategory('');
    setShowAddForm(false);
  };

  const updateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ? true : task.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      task.title.toLowerCase().includes(searchLower) ||
      (task.category?.toLowerCase().includes(searchLower) || false) ||
      (task.description?.toLowerCase().includes(searchLower) || false);
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status: string) => 
    tasks.filter(task => task.status === status).length;

  const getStatusColor = (status: string) => {
    const colors = {
      'overdue': 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-100 dark:border-red-700',
      'submitted': 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-100 dark:border-yellow-700',
      'following': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700',
      'working': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-700',
      'completed': 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-100 dark:border-green-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700';
  };

  const getFilterStyle = (status: string, isActive: boolean) => {
    if (isActive) {
      const activeColors = {
        'overdue': 'bg-red-100 text-red-900 shadow-sm dark:bg-red-800 dark:text-red-50',
        'submitted': 'bg-yellow-100 text-yellow-900 shadow-sm dark:bg-yellow-800 dark:text-yellow-50',
        'following': 'bg-blue-100 text-blue-900 shadow-sm dark:bg-blue-800 dark:text-blue-50',
        'working': 'bg-indigo-100 text-indigo-900 shadow-sm dark:bg-indigo-800 dark:text-indigo-50',
        'completed': 'bg-green-100 text-green-900 shadow-sm dark:bg-green-800 dark:text-green-50',
        'all': 'bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
      };
      return activeColors[status as keyof typeof activeColors];
    }
    return 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Add New Task
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Add/Edit Task Form */}
          {(showAddForm || editingTask) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setShowAddForm(false);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  </button>
                </div>
                <form onSubmit={editingTask ? updateTask : addTask} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={editingTask ? editingTask.title : newTask}
                      onChange={(e) => editingTask 
                        ? setEditingTask({ ...editingTask, title: e.target.value })
                        : setNewTask(e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={editingTask ? editingTask.description : newDescription}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, description: e.target.value })
                        : setNewDescription(e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={editingTask ? editingTask.category : category}
                      onChange={(e) => editingTask
                        ? setEditingTask({ ...editingTask, category: e.target.value })
                        : setCategory(e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter category (optional)"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setShowAddForm(false);
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      {editingTask ? 'Update Task' : 'Add Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {statusGroups.map(({ title, status, icon }) => (
              <button
                key={status}
                onClick={() => setFilter(status as typeof filter)}
                className={`
                  px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                  flex items-center justify-center gap-2 transition-all
                  ${getFilterStyle(status, filter === status)}
                `}
              >
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span>{title}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-sm
                  ${filter === status ? 'bg-white/50 dark:bg-black/30' : 'bg-gray-100 dark:bg-gray-700'}
                  dark:text-gray-200
                `}>
                  {status === 'all' ? tasks.length : getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* Tasks Section */}
        <section>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">
                  {searchQuery ? 'No tasks found matching your search' : 'No tasks found'}
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <button
                            onClick={() => setShowStatusControls(showStatusControls === task.id ? null : task.id)}
                            className="flex items-center justify-center w-24 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium dark:text-white"
                          >
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </button>
                          {showStatusControls === task.id && (
                            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              <button
                                onClick={() => moveTaskStatus(task.id, 'up')}
                                disabled={task.status === statusOrder[0]}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-gray-900 dark:text-white"
                              >
                                <ChevronUp className="w-4 h-4" />
                                Previous
                              </button>
                              <button
                                onClick={() => moveTaskStatus(task.id, 'down')}
                                disabled={task.status === statusOrder[statusOrder.length - 1]}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-gray-900 dark:text-white"
                              >
                                <ChevronDown className="w-4 h-4" />
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.date}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {task.category && (
                              <span className="px-2.5 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                {task.category}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;