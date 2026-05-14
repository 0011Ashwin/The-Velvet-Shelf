import { format } from 'date-fns';
import { Book } from '../types';
import { Book as BookIcon, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LedgerProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

export default function Ledger({ books, onSelect }: LedgerProps) {
  if (books.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <BookIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl text-slate-400 font-display">Your library is waiting...</h3>
        <p className="text-slate-300 font-medium mt-2">Scan your first book to start your quest!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <motion.div 
          key={book.id} 
          onClick={() => onSelect(book)}
          className="playful-card p-6 cursor-pointer group flex flex-col"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-playful-teal/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-playful-teal group-hover:text-white transition-colors duration-300">
            <BookIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg leading-tight mb-1 group-hover:text-playful-teal transition-colors">
            {book.title}
          </h3>
          <p className="text-slate-500 font-medium italic text-sm mb-4">
            by {book.author}
          </p>
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {format(new Date(book.dateCataloged), 'MMM dd, yyyy')}
            </span>
            <ChevronRight className="w-4 h-4 text-playful-teal opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
