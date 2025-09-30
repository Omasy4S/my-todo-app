// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, 
  FaSun, 
  FaMoon, 
  FaCheck, 
  FaEdit, 
  FaPlus,
  FaFilter,
  FaChartBar,
  FaClock,
  FaStar,
  FaFire,
  FaCalendar,
  FaSearch,
  FaSort,
  FaRocket,
  FaCheckCircle,
  FaListAlt,
  FaLightbulb
} from 'react-icons/fa';
import './App.css';

// Кастомный хук для управления задачами
const useTodos = () => {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback((text, priority = 'medium') => {
    if (text.trim()) {
      const newTodo = {
        id: Date.now() + Math.random(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        priority: priority,
        createdAtReadable: new Date().toLocaleString()
      };
      setTodos(prev => [newTodo, ...prev]);
      return true;
    }
    return false;
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const editTodo = useCallback((id, newText, newPriority) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText, priority: newPriority } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

  const markAllCompleted = useCallback(() => {
    setTodos(prev => prev.map(todo => ({ ...todo, completed: true })));
  }, []);

  const clearAll = useCallback(() => {
    setTodos([]);
  }, []);

  return {
    todos,
    addTodo,
    deleteTodo,
    toggleTodo,
    editTodo,
    clearCompleted,
    markAllCompleted,
    clearAll
  };
};

// Кастомный хук для темы
const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return { darkMode, toggleTheme };
};

// Компонент TodoItem с улучшенной анимацией
const TodoItem = React.memo(({ todo, onToggle, onDelete, onEdit, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);

  const handleEdit = useCallback(() => {
    if (editText.trim() !== '') {
      onEdit(todo.id, editText.trim(), editPriority);
      setIsEditing(false);
    }
  }, [editText, editPriority, onEdit, todo.id]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditPriority(todo.priority);
      setIsEditing(false);
    }
  }, [handleEdit, todo.text, todo.priority]);

  const handleCancel = useCallback(() => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setIsEditing(false);
  }, [todo.text, todo.priority]);

  const priorityIcons = {
    high: <FaFire />,
    medium: <FaStar />,
    low: <FaCheckCircle />
  };

  const priorityLabels = {
    high: 'Важно',
    medium: 'Средне',
    low: 'Не срочно'
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 300 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
      className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="todo-item-content">
        <motion.input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
          id={`cb-${todo.id}`}
          whileTap={{ scale: 0.9 }}
        />
        <label htmlFor={`cb-${todo.id}`} className="todo-label">
          {isEditing ? (
            <div className="edit-container">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                className="edit-input"
              />
              <select 
                value={editPriority} 
                onChange={(e) => setEditPriority(e.target.value)}
                className="priority-select"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <div className="edit-actions">
                <button onClick={handleEdit} className="save-btn">
                  <FaCheck />
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  ×
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className={`todo-text ${todo.completed ? 'completed-text' : ''}`}>
                {todo.text}
              </span>
              <div className="todo-meta">
                <span className="todo-time">
                  <FaCalendar /> {todo.createdAtReadable}
                </span>
                <span className={`priority-badge priority-${todo.priority}`}>
                  {priorityIcons[todo.priority]} {priorityLabels[todo.priority]}
                </span>
              </div>
            </>
          )}
        </label>
      </div>
      {!isEditing && (
        <div className="todo-actions">
          <motion.button
            onClick={() => setIsEditing(true)}
            className="icon-btn edit-btn"
            aria-label="Редактировать задачу"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaEdit />
          </motion.button>
          <motion.button
            onClick={() => onDelete(todo.id)}
            className="icon-btn delete-btn"
            aria-label="Удалить задачу"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTrash />
          </motion.button>
        </div>
      )}
    </motion.li>
  );
});

// Улучшенный ProgressBar с анимацией
const ProgressBar = React.memo(({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <motion.div 
      className="progress-container"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="progress-header">
        <FaChartBar />
        <span>Прогресс выполнения</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="progress-stats">
        <span className="progress-text">{completed} / {total} выполнено</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
    </motion.div>
  );
});

// Компонент InputSection с улучшенным UX
const InputSection = React.memo(({ onAddTodo, stats }) => {
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleAddTodo = useCallback(() => {
    if (onAddTodo(inputText, priority)) {
      setInputText('');
      setPriority('medium');
    }
  }, [inputText, priority, onAddTodo]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  }, [handleAddTodo]);

  const quickTodos = [
    "Сделать зарядку",
    "Прочитать книгу",
    "Запланировать встречу",
    "Купить продукты"
  ];

  const handleQuickAdd = (text) => {
    setInputText(text);
  };

  return (
    <motion.div 
      className="input-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Быстрые действия */}
      <div className="quick-actions">
        {quickTodos.map((text, index) => (
          <motion.button
            key={index}
            className="quick-action-btn"
            onClick={() => handleQuickAdd(text)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRocket /> {text}
          </motion.button>
        ))}
      </div>

      <div className="input-container">
        <motion.input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Что нужно сделать? Например: 'Подготовить отчет к встрече'"
          className="todo-input"
          whileFocus={{ scale: 1.02 }}
        />
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <motion.button 
          onClick={handleAddTodo} 
          className="add-btn"
          disabled={!inputText.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Добавить
        </motion.button>
      </div>
      <ProgressBar completed={stats.completed} total={stats.total} />
    </motion.div>
  );
});

// Компонент FilterButtons с улучшенным дизайном
const FilterButtons = React.memo(({ filter, onFilterChange, stats }) => {
  const filters = [
    { key: 'all', label: 'Все задачи', count: stats.total, icon: <FaListAlt /> },
    { key: 'active', label: 'Активные', count: stats.active, icon: <FaClock /> },
    { key: 'completed', label: 'Выполненные', count: stats.completed, icon: <FaCheckCircle /> },
    { key: 'high', label: 'Важные', count: stats.highPriority, icon: <FaFire /> }
  ];

  return (
    <motion.div 
      className="filters"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="filters-header">
        <FaFilter />
        <span>Фильтры</span>
      </div>
      <div className="filter-buttons">
        {filters.map(({ key, label, count, icon }) => (
          <motion.button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon} {label}
            <span className="filter-count">{count}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
});

// Компонент статистики
const StatsGrid = React.memo(({ stats }) => {
  return (
    <motion.div 
      className="stats-grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="stat-card">
        <div className="stat-number">{stats.total}</div>
        <div className="stat-label">Всего задач</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.active}</div>
        <div className="stat-label">Активных</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.completed}</div>
        <div className="stat-label">Выполнено</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.highPriority}</div>
        <div className="stat-label">Важных</div>
      </div>
    </motion.div>
  );
});

// Компонент поиска и сортировки
const SearchAndSort = React.memo(({ searchQuery, onSearchChange, sortBy, onSortChange }) => {
  return (
    <motion.div 
      className="search-sort-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Поиск задач..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <select 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-select"
      >
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
        <option value="priority">По приоритету</option>
        <option value="alphabetical">По алфавиту</option>
      </select>
    </motion.div>
  );
});

// Главный компонент App
function App() {
  const { darkMode, toggleTheme } = useTheme();
  const { todos, addTodo, deleteTodo, toggleTodo, editTodo, clearCompleted, markAllCompleted, clearAll } = useTodos();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Расширенная статистика
  const stats = useMemo(() => {
    const completed = todos.filter(todo => todo.completed).length;
    const active = todos.filter(todo => !todo.completed).length;
    const highPriority = todos.filter(todo => todo.priority === 'high').length;
    
    return {
      total: todos.length,
      completed,
      active,
      highPriority,
      completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
    };
  }, [todos]);

  // Фильтрация и поиск задач
  const filteredTodos = useMemo(() => {
    let filtered = todos;
    
    // Фильтрация по статусу
    switch (filter) {
      case 'active':
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
      case 'high':
        filtered = filtered.filter(todo => todo.priority === 'high');
        break;
      default:
        break;
    }
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Сортировка
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [todos, filter, searchQuery, sortBy]);

  const emptyStateMessages = {
    all: '🎯 Начните добавлять задачи!',
    active: '✅ Все задачи выполнены!',
    completed: '📝 Пока нет выполненных задач',
    high: '⭐ Нет важных задач'
  };

  const motivationMessages = [
    "Маленькие шаги каждый день приводят к большим результатам!",
    "Самое время сделать что-то великое!",
    "Продуктивность - это не занятость, а эффективность!",
    "Каждая выполненная задача - это шаг к цели!",
    "Сегодня - идеальный день для начала!"
  ];

  const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <motion.header 
          className="app-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <h1>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                🚀 Умный To-Do
              </motion.span>
            </h1>
            <p className="app-subtitle">{randomMotivation}</p>
          </div>
          <motion.button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={darkMode ? "Светлая тема" : "Темная тема"}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </motion.button>
        </motion.header>

        {/* Статистика */}
        <StatsGrid stats={stats} />

        {/* Input Section */}
        <InputSection onAddTodo={addTodo} stats={stats} />

        {/* Поиск и сортировка */}
        <SearchAndSort 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Filters */}
        <FilterButtons 
          filter={filter} 
          onFilterChange={setFilter} 
          stats={stats}
        />

        {/* Actions */}
        {(stats.completed > 0 || todos.length > 0) && (
          <motion.div 
            className="actions-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {stats.completed > 0 && (
              <button 
                onClick={clearCompleted}
                className="clear-btn"
              >
                Очистить выполненные ({stats.completed})
              </button>
            )}
            {todos.length > 0 && (
              <>
                <button 
                  onClick={markAllCompleted}
                  className="clear-btn"
                  style={{ backgroundColor: 'var(--success-color-light)' }}
                >
                  Отметить все выполненными
                </button>
                <button 
                  onClick={clearAll}
                  className="clear-btn"
                  style={{ backgroundColor: 'var(--warning-color-light)' }}
                >
                  Очистить все задачи
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Todo List */}
        <motion.ul className="todo-list">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                darkMode={darkMode}
              />
            ))}
          </AnimatePresence>
        </motion.ul>

        {/* Empty State */}
        <AnimatePresence>
          {filteredTodos.length === 0 && (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="empty-icon">📋</div>
              <h3>{emptyStateMessages[filter]}</h3>
              <p>Добавьте свою первую задачу выше или попробуйте другой фильтр</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          className="app-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            <FaLightbulb /> {stats.total} задач • {stats.completed} выполнено • 
            Эффективность: {stats.completionRate}%
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;