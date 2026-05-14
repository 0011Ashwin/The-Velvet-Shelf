import { format } from 'date-fns';
import { Book } from '../types';
import { motion } from 'motion/react';
import { X, Library, BookText } from 'lucide-react';

interface LibraryCardProps {
  book: Book;
  onClose: () => void;
}

export default function LibraryCard({ book, onClose }: LibraryCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.9, y: 20, rotate: 2 }}
        className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-slate-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colorful Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-playful-teal to-playful-pink opacity-10" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
              <Library className="w-4 h-4 text-playful-teal" />
              <span className="uppercase text-[9px] tracking-[0.2em] font-bold text-slate-400">
                Collector Card
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-playful-yellow rounded-3xl mx-auto flex items-center justify-center shadow-lg transform -rotate-6 mb-4">
                <BookText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold leading-tight text-slate-800">{book.title}</h2>
              <p className="text-playful-pink font-bold italic mt-1">by {book.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="uppercase text-[8px] tracking-widest font-bold text-slate-400 mb-1 block">Series No.</label>
                <p className="font-display text-sm text-slate-700">#{book.id.slice(0, 5).toUpperCase()}</p>
              </div>
              <div>
                <label className="uppercase text-[8px] tracking-widest font-bold text-slate-400 mb-1 block">Collected</label>
                <p className="font-display text-sm text-slate-700">{format(new Date(book.dateCataloged), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-center">
              <div className="px-6 py-2 bg-gradient-to-r from-playful-teal to-playful-coral rounded-full text-white font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-coral-500/20">
                Official Quest Log
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-playful-yellow/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-playful-teal/10 rounded-full blur-3xl" />
      </motion.div>
    </motion.div>
  );
}
