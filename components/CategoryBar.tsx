
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="bg-slate-950 border-b border-slate-900 py-3 overflow-x-auto custom-scrollbar transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex gap-4 items-center whitespace-nowrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
