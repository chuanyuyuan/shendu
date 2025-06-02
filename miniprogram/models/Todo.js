const SubTask = require('./SubTask');

// 待办事项类
class Todo {
  constructor({ id, content, completed = false, subtasks = [] }) {
    this.id = id;
    this.content = content;
    this.completed = completed;
    this.subtasks = subtasks.map(subtask => 
      subtask instanceof SubTask ? subtask : SubTask.fromJSON(subtask)
    );
  }

  // 添加子任务
  addSubtask(subtask) {
    if (!(subtask instanceof SubTask)) {
      throw new Error('subtask must be an instance of SubTask');
    }
    this.subtasks.push(subtask);
  }

  // 删除子任务
  removeSubtask(subtaskId) {
    this.subtasks = this.subtasks.filter(subtask => subtask.id !== subtaskId);
  }

  // 更新子任务状态
  updateSubtaskStatus(subtaskId, completed) {
    const subtask = this.subtasks.find(subtask => subtask.id === subtaskId);
    if (subtask) {
      subtask.completed = completed;
    }
  }

  // 检查是否所有子任务都已完成
  areAllSubtasksCompleted() {
    return this.subtasks.length > 0 && this.subtasks.every(subtask => subtask.completed);
  }

  // 转换为普通对象，用于存储
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      completed: this.completed,
      subtasks: this.subtasks.map(subtask => subtask.toJSON())
    };
  }

  // 从普通对象创建实例
  static fromJSON(json) {
    return new Todo({
      ...json,
      subtasks: json.subtasks?.map(subtask => SubTask.fromJSON(subtask)) || []
    });
  }
}

module.exports = Todo; 