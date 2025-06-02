const Todo = require('./Todo');
const SubTask = require('./SubTask');
const { generateUUID } = require('../utils/uuid');

class TodoManager {
  constructor() {
    this.todos = [];
    this.MAX_TODOS = 50; // 最大待办事项数量
    this.MAX_SUBTASKS = 50; // 最大子任务数量
    this.loadTodos();
  }

  // 加载所有待办事项
  loadTodos() {
    try {
      const todosData = wx.getStorageSync('todos') || [];
      this.todos = todosData.map(todo => Todo.fromJSON(todo));
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todos = [];
    }
  }

  // 保存所有待办事项
  saveTodos() {
    try {
      const todosData = this.todos.map(todo => todo.toJSON());
      wx.setStorageSync('todos', todosData);
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }

  // 添加新的待办事项
  addTodo(content) {
    if (this.todos.length >= this.MAX_TODOS) {
      wx.showToast({
        title: `最多只能创建${this.MAX_TODOS}个待办事项`,
        icon: 'none',
        duration: 2000
      });
      return null;
    }

    const todo = new Todo({
      id: generateUUID(),
      content,
      completed: false,
      subtasks: []
    });
    this.todos.unshift(todo);
    this.saveTodos();
    return todo;
  }

  // 添加子任务
  addSubtask(todoId, content) {
    const todo = this.todos.find(t => t.id === todoId);
    if (!todo) return null;

    if (todo.subtasks.length >= this.MAX_SUBTASKS) {
      wx.showToast({
        title: `每个任务最多只能添加${this.MAX_SUBTASKS}个子任务`,
        icon: 'none',
        duration: 2000
      });
      return null;
    }

    const subtask = new SubTask({
      id: generateUUID(),
      parentId: todoId,
      content,
      completed: false
    });

    todo.addSubtask(subtask);
    this.saveTodos();
    return subtask;
  }

  // 删除待办事项
  removeTodo(todoId) {
    this.todos = this.todos.filter(todo => todo.id !== todoId);
    this.saveTodos();
  }

  // 删除子任务
  removeSubtask(todoId, subtaskId) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.removeSubtask(subtaskId);
      this.saveTodos();
    }
  }

  // 更新待办事项状态
  updateTodoStatus(todoId, completed) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = completed;
      this.saveTodos();
    }
  }

  // 更新子任务状态
  updateSubtaskStatus(todoId, subtaskId, completed) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.updateSubtaskStatus(subtaskId, completed);
      this.saveTodos();
    }
  }

  // 更新待办事项内容
  updateTodoContent(todoId, content) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.content = content;
      this.saveTodos();
    }
  }

  // 更新子任务内容
  updateSubtaskContent(todoId, subtaskId, content) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      const subtask = todo.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        subtask.content = content;
        this.saveTodos();
      }
    }
  }

  // 获取所有待办事项
  getAllTodos() {
    return this.todos;
  }

  // 获取未完成的待办事项
  getActiveTodos() {
    return this.todos.filter(todo => !todo.completed);
  }

  // 获取已完成的待办事项
  getCompletedTodos() {
    return this.todos.filter(todo => todo.completed);
  }

  // 获取指定任务的子任务总数
  getSubtaskCount(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    return todo ? todo.subtasks.length : 0;
  }

  // 获取指定任务的已完成子任务数
  getCompletedSubtaskCount(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    return todo ? todo.subtasks.filter(subtask => subtask.completed).length : 0;
  }

  // 获取指定任务的子任务完成状态
  getSubtaskStatus(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    if (!todo) return '0/0';
    
    const total = todo.subtasks.length;
    const completed = todo.subtasks.filter(subtask => subtask.completed).length;
    return `${completed}/${total}`;
  }
}

module.exports = TodoManager; 