// 子任务类
class SubTask {
  constructor({ id, parentId, content, completed = false }) {
    this.id = id;
    this.parentId = parentId;
    this.content = content;
    this.completed = completed;
  }

  // 转换为普通对象，用于存储
  toJSON() {
    return {
      id: this.id,
      parentId: this.parentId,
      content: this.content,
      completed: this.completed
    };
  }

  // 从普通对象创建实例
  static fromJSON(json) {
    return new SubTask(json);
  }
}

module.exports = SubTask; 