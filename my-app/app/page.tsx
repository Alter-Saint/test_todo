"use client";

import { useState, useEffect, useReducer } from 'react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

type Action =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: { id: string; text: string } };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'SET_TODOS':
      return action.payload;
    case 'ADD_TODO':
      return [...state, {
        id: crypto.randomUUID(),
        text: action.payload,
        completed: false,
        createdAt: new Date().toISOString(),
      }];
    case 'TOGGLE_TODO':
      return state.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t);
    case 'DELETE_TODO':
      return state.filter(t => t.id !== action.payload);
    case 'UPDATE_TODO':
      return state.map(t => t.id === action.payload.id ? { ...t, text: action.payload.text } : t);
    default:
      return state;
  }
}

export default function TodoPage() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const saved = localStorage.getItem('todos');
        if (saved) {
          dispatch({ type: 'SET_TODOS', payload: JSON.parse(saved) });
        }
      } catch (e) {
        console.error("Failed to load:", e);
      } finally {
        setIsMounted(true);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    dispatch({ type: 'ADD_TODO', payload: inputValue.trim() });
    setInputValue('');
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleUpdate = () => {
    if (editingId && editText.trim()) {
      dispatch({ type: 'UPDATE_TODO', payload: { id: editingId, text: editText.trim() } });
    }
    setEditingId(null);
  };

  const activeCount = todos.filter(t => !t.completed).length;

  if (!isMounted) return <div className="p-8 text-center text-gray-500">Завантаження...</div>;

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Список завдань</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Що потрібно зробити?"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-all"
        />
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold">
          Додати
        </button>
      </form>

      <ul className="space-y-3">
        {todos.length === 0 ? (
          <li className="text-center text-gray-400 py-6 border-2 border-dashed border-gray-50 rounded-lg">Список порожній</li>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group">
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })} 
                  className="w-5 h-5 cursor-pointer accent-blue-600 shrink-0"
                />
                
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 outline-none"
                  />
                ) : (
                  <span 
                    onDoubleClick={() => startEditing(todo)}
                    className={`truncate cursor-text transition-all ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                    title="Подвійний клік для редагування"
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              <button 
                onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
                className="text-gray-400 hover:text-red-500 ml-2"
              >
                ✕
              </button>
            </li>
          ))
        )}
      </ul>

      <footer className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-semibold text-gray-500 uppercase">
        <span>Залишилось: <span className="text-blue-600">{activeCount}</span></span>
      </footer>
    </main>
  );
}