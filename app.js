// 純前端待辦清單，資料儲存在瀏覽器的 localStorage。

const STORAGE_KEY = 'root-todo-list-v1';

// 取得畫面上會用到的元素。
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');

// 每筆待辦包含 id、text 與 completed 狀態。
let todos = loadTodos();

// 從 localStorage 載入資料，並確認每筆資料格式有效。
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      console.warn('待辦清單資料格式無效，將以空清單開始。');
      return [];
    }

    return parsed.filter((todo) =>
      todo &&
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.completed === 'boolean'
    );
  } catch (error) {
    console.warn('讀取待辦清單失敗，將以空清單開始。', error);
    return [];
  }
}

// 將目前的待辦清單寫入 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 根據待辦資料更新清單、空狀態提示與未完成數量。
function render() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = todos.length > 0;
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 新增一筆待辦事項。
function addTodo(text) {
  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    completed: false,
  });
  saveTodos();
  render();
}

// 切換指定待辦事項的完成狀態。
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

// 刪除指定待辦事項。
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addTodo(text);
  input.value = '';
  input.focus();
});

// 使用事件委派處理清單中的勾選與刪除操作。
list.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') return;

  const item = event.target.closest('.todo-item');
  if (item) toggleTodo(item.dataset.id);
});

list.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const deleteButton = event.target.closest('.btn-delete');
  const item = deleteButton?.closest('.todo-item');
  if (item) deleteTodo(item.dataset.id);
});

// 頁面載入時繪製已儲存的待辦清單。
render();
