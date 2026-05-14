import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, signIn, signOut } from './lib/firebase';
import { Book } from './types';
import { extractBookInfo } from './services/geminiService';
import { handleFirestoreError, OperationType } from './lib/errorUtils';
import BookScanner from './components/BookScanner';
import Ledger from './components/Ledger';
import LibraryCard from './components/LibraryCard';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, BookText, LogOut, Loader2, BookOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      return;
    }

    const q = query(
      collection(db, 'books'),
      where('userId', '==', user.uid),
      orderBy('dateCataloged', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Book));
        setBooks(booksData);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'books');
      }
    );

    return unsubscribe;
  }, [user]);

  const handleScan = async (base64: string) => {
    if (!user) return;
    
    setIsScanning(false);
    setProcessing(true);
    setError(null);

    try {
      const info = await extractBookInfo(base64);
      if (info && info.title && info.author) {
        await addDoc(collection(db, 'books'), {
          title: info.title,
          author: info.author,
          dateCataloged: new Date().toISOString(),
          userId: user.uid,
          createdAt: Timestamp.now()
        });
      } else {
        setError("Failed to extract book details. Please try again with a clearer photo.");
      }
    } catch (err) {
      console.error(err);
      setError("Whoops! The book escaped our scanner. Please try again!");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-playful-bg">
        <Loader2 className="w-8 h-8 text-playful-teal animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-[200px] font-display select-none text-playful-teal rotate-[-15deg]">📚</div>
          <div className="absolute bottom-10 right-10 text-[200px] font-display select-none text-playful-pink rotate-[15deg]">✨</div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center z-10 max-w-md"
        >
          <div className="w-20 h-20 bg-playful-teal/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-playful-teal" />
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight text-slate-800">BookQuest</h1>
          <p className="text-slate-500 mb-12 font-medium leading-relaxed">
            Scan your books, build your library, and track your reading journey!
          </p>
          
          <button 
            onClick={signIn}
            className="bubbly-button"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    );
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-playful-teal rounded-2xl shadow-lg shadow-teal-500/20">
            <BookText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl leading-tight text-slate-800">My Library</h1>
            <p className="text-sm font-bold text-playful-pink uppercase tracking-widest">{books.length} volumes collected</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsScanning(true)}
            className="bubbly-button"
          >
            Scan a Book
          </button>

          <button 
            onClick={() => signOut()}
            className="p-3 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors"
            title="Log Out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="px-6 max-w-5xl mx-auto">
        {books.length > 0 && !processing && (
          <div className="relative mb-8 max-w-md">
            <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-playful-teal" />
            <input 
              type="text"
              placeholder="Find a book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="playful-input"
            />
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-playful-pink/10 border-2 border-playful-pink/20 p-4 rounded-2xl mb-8 text-center"
            >
              <p className="text-sm font-bold text-playful-pink">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {processing && (
          <div className="py-20 text-center flex flex-col items-center">
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-playful-yellow rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-xl mb-2">Reading the cover...</h3>
            <p className="text-slate-400 font-medium">Sit tight, adding this to your collection!</p>
          </div>
        )}

        {!processing && (
          <Ledger books={filteredBooks} onSelect={setSelectedBook} />
        )}
      </main>

      <AnimatePresence>
        {isScanning && (
          <BookScanner onScan={handleScan} onClose={() => setIsScanning(false)} />
        )}
        
        {selectedBook && (
          <LibraryCard book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.4em] text-slate-300 font-bold">
          HAPPY READING • STORYSWAP COLLECTION
        </div>
      </footer>
    </div>
  );
}
