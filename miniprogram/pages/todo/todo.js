const TodoManager = require('../../models/TodoManager');

Page({
    data: {
      todos: [],
      newTodo: '',
      activeTab: 'all', // all, active, completed
      filteredTodos: [], // 添加过滤后的待办事项列表
      showTaskDetail: false, // 是否显示任务详情
      currentTask: null, // 当前查看的任务
      isAddingSubtask: false,
      newSubtaskContent: '',
      isSubtasksExpanded: true, // 控制子任务列表的展开/收缩状态
      subtaskStatus: '0/0', // 子任务完成状态
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
      const value = e.detail.value;
      if (value.length >= 150) {
        wx.showToast({
          title: '最多输入150个字符',
          icon: 'none',
          duration: 2000
        });
      }
      this.setData({
        newTodo: value
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
      let todos;
      switch (activeTab) {
        case 'active':
          todos = this.todoManager.getActiveTodos();
          break;
        case 'completed':
          todos = this.todoManager.getCompletedTodos();
          break;
        default:
          todos = this.todoManager.getAllTodos();
      }
      return todos.map(todo => ({
        ...todo.toJSON(),
        subtaskStatus: this.todoManager.getSubtaskStatus(todo.id),
        subtaskCount: this.todoManager.getSubtaskCount(todo.id)
      }));
    },

    // 查看任务详情
    viewTaskDetail(e) {
      const { id } = e.currentTarget.dataset;
      const task = this.data.todos.find(todo => todo.id === id);
      this.setData({
        showTaskDetail: true,
        currentTask: { ...task.toJSON() },
        isAddingSubtask: false,
        newSubtaskContent: '',
        isSubtasksExpanded: true, // 默认展开子任务列表
        subtaskStatus: this.todoManager.getSubtaskStatus(id)
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
      const value = e.detail.value;
      if (value.length >= 150) {
        wx.showToast({
          title: '最多输入150个字符',
          icon: 'none',
          duration: 2000
        });
      }
      this.setData({
        'currentTask.content': value
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

    // 添加新子任务
    addNewSubtask() {
      this.setData({
        isAddingSubtask: true,
        newSubtaskContent: ''
      });
    },

    // 取消添加子任务
    cancelAddSubtask() {
      this.setData({
        isAddingSubtask: false,
        newSubtaskContent: ''
      });
    },

    // 监听新子任务输入
    onNewSubtaskInput(e) {
      const value = e.detail.value;
      if (value.length >= 150) {
        wx.showToast({
          title: '最多输入150个字符',
          icon: 'none',
          duration: 2000
        });
      }
      this.setData({
        newSubtaskContent: value
      });
    },

    // 保存新子任务
    saveNewSubtask(e) {
      const content = this.data.newSubtaskContent.trim();
      if (!content) {
        this.cancelAddSubtask();
        return;
      }

      const subtask = this.todoManager.addSubtask(this.data.currentTask.id, content);
      if (subtask) {
        const task = this.todoManager.getAllTodos().find(t => t.id === this.data.currentTask.id);
        this.setData({
          currentTask: { ...task.toJSON() },
          isAddingSubtask: false,
          newSubtaskContent: '',
          todos: this.todoManager.getAllTodos()
        }, () => {
          this.updateFilteredTodos();
          this.updateSubtaskStatus();
        });
      }
    },

    // 监听子任务内容输入
    onSubtaskInput(e) {
      const { id } = e.currentTarget.dataset;
      const value = e.detail.value;
      if (value.length >= 150) {
        wx.showToast({
          title: '最多输入150个字符',
          icon: 'none',
          duration: 2000
        });
      }
      const subtasks = this.data.currentTask.subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, content: value } : subtask
      );
      this.setData({
        'currentTask.subtasks': subtasks
      });
    },

    // 保存子任务更改
    saveSubtask(e) {
      const { id } = e.currentTarget.dataset;
      const subtask = this.data.currentTask.subtasks.find(s => s.id === id);
      if (subtask) {
        this.todoManager.updateSubtaskContent(this.data.currentTask.id, id, subtask.content);
        const task = this.todoManager.getAllTodos().find(t => t.id === this.data.currentTask.id);
        this.setData({
          currentTask: { ...task.toJSON() },
          todos: this.todoManager.getAllTodos()
        }, () => {
          this.updateFilteredTodos();
        });
      }
    },

    // 切换子任务完成状态
    toggleSubtaskCompletion(e) {
      const { id } = e.currentTarget.dataset;
      const subtask = this.data.currentTask.subtasks.find(s => s.id === id);
      if (subtask) {
        this.todoManager.updateSubtaskStatus(this.data.currentTask.id, id, !subtask.completed);
        const task = this.todoManager.getAllTodos().find(t => t.id === this.data.currentTask.id);
        this.setData({
          currentTask: { ...task.toJSON() },
          todos: this.todoManager.getAllTodos()
        }, () => {
          this.updateFilteredTodos();
          this.updateSubtaskStatus();
        });
      }
    },

    // 删除子任务
    deleteSubtask(e) {
      const { id } = e.currentTarget.dataset;
      this.todoManager.removeSubtask(this.data.currentTask.id, id);
      const task = this.todoManager.getAllTodos().find(t => t.id === this.data.currentTask.id);
      this.setData({
        currentTask: { ...task.toJSON() },
        todos: this.todoManager.getAllTodos()
      }, () => {
        this.updateFilteredTodos();
        this.updateSubtaskStatus();
      });
    },

    // 切换子任务列表展开/收缩状态
    toggleSubtasksExpanded() {
      this.setData({
        isSubtasksExpanded: !this.data.isSubtasksExpanded
      });
    },

    // 更新子任务状态显示
    updateSubtaskStatus() {
      if (this.data.currentTask) {
        this.setData({
          subtaskStatus: this.todoManager.getSubtaskStatus(this.data.currentTask.id)
        });
      }
    },
});