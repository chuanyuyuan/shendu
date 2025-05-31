const TodoManager = require('../../models/TodoManager');

Page({
    data: {
      todos: [],
      newTodo: '',
      activeTab: 'all', // all, active, completed
      filteredTodos: [], // 添加过滤后的待办事项列表
      showTaskDetail: false, // 是否显示任务详情
      currentTask: null, // 当前查看的任务
    },

    todoManager: null,
  
    onLoad() {
      this.todoManager = new TodoManager();
      this.loadTodos();
    },
  
    onShow() {
      this.loadTodos();
    },
  
    loadTodos() {
      const todos = this.todoManager.getAllTodos();
      this.setData({ todos }, () => {
        this.updateFilteredTodos();
      });
    },
  
    // 输入新待办事项
    onInput(e) {
      this.setData({
        newTodo: e.detail.value
      });
    },
  
    // 添加新待办事项
    addTodo() {
      if (!this.data.newTodo.trim()) return;
      
      const todo = this.todoManager.addTodo(this.data.newTodo);
      const todos = this.todoManager.getAllTodos();
      
      this.setData({
        todos,
        newTodo: ''
      }, () => {
        this.updateFilteredTodos();
      });
    },
  
    // 切换任务完成状态
    toggleTaskCompletion(e) {
      const { id } = e.currentTarget.dataset;
      const todo = this.data.todos.find(t => t.id === id);
      this.todoManager.updateTodoStatus(id, !todo.completed);
      
      const todos = this.todoManager.getAllTodos();
      this.setData({ todos }, () => {
        this.updateFilteredTodos();
      });
    },
  
    // 删除待办事项
    deleteTodo(e) {
      const { id } = e.currentTarget.dataset;
      this.todoManager.removeTodo(id);
      
      const todos = this.todoManager.getAllTodos();
      this.setData({ todos }, () => {
        this.updateFilteredTodos();
      });
    },

    // 切换标签页
    switchTab(e) {
      const { tab } = e.currentTarget.dataset;
      this.setData({ activeTab: tab }, () => {
        this.updateFilteredTodos();
      });
    },

    // 更新过滤后的待办事项列表
    updateFilteredTodos() {
      const filteredTodos = this.getFilteredTodos();
      this.setData({ filteredTodos });
    },

    // 获取过滤后的待办事项列表
    getFilteredTodos() {
      const { activeTab } = this.data;
      switch (activeTab) {
        case 'active':
          return this.todoManager.getActiveTodos();
        case 'completed':
          return this.todoManager.getCompletedTodos();
        default:
          return this.todoManager.getAllTodos();
      }
    },

    // 查看任务详情
    viewTaskDetail(e) {
      const { id } = e.currentTarget.dataset;
      const task = this.data.todos.find(todo => todo.id === id);
      this.setData({
        showTaskDetail: true,
        currentTask: { ...task.toJSON() } // 创建副本，避免直接修改
      });
    },

    // 关闭任务详情
    closeTaskDetail() {
      this.setData({
        showTaskDetail: false,
        currentTask: null
      });
    },

    // 监听任务内容输入
    onTaskContentInput(e) {
      this.setData({
        'currentTask.content': e.detail.value
      });
    },

    // 保存任务详情
    saveTaskDetail() {
      const { currentTask } = this.data;
      if (!currentTask.content.trim()) {
        wx.showToast({
          title: '任务内容不能为空',
          icon: 'none'
        });
        return;
      }

      this.todoManager.updateTodoContent(currentTask.id, currentTask.content);
      const todos = this.todoManager.getAllTodos();
      
      this.setData({
        todos,
        showTaskDetail: false,
        currentTask: null
      }, () => {
        this.updateFilteredTodos();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      });
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 阻止点击弹窗内容时触发关闭
    },
  });