import { Question } from "@/lib/schemas";

interface QuizData {
  id: string;
  questions: Question[];
  title: string;
  answers: string[];
  currentQuestionIndex: number;
  isSubmitted: boolean;
  score: number | null;
  progress: number;
  timestamp: number;
}

interface LastGeneratedQuiz {
  id: string;
  questions: Question[];
  title: string;
  fileName: string;
  fileType: string;
  fileData: string; // base64 encoded file
  timestamp: number;
}

interface QuizCounter {
  id: string;
  count: number;
  lastReset: number;
}

class QuizCache {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'QuizMakerDB';
  private readonly QUIZ_STORE = 'quizzes';
  private readonly LAST_QUIZ_STORE = 'lastGeneratedQuiz';
  private readonly COUNTER_STORE = 'quizCounter';
  private readonly MAX_GENERATIONS = 100;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 3); // Increment version for counter store

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create quizzes store
        if (!db.objectStoreNames.contains(this.QUIZ_STORE)) {
          const quizStore = db.createObjectStore(this.QUIZ_STORE, { keyPath: 'id' });
          quizStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create last generated quiz store
        if (!db.objectStoreNames.contains(this.LAST_QUIZ_STORE)) {
          db.createObjectStore(this.LAST_QUIZ_STORE, { keyPath: 'id' });
        }

        // Create counter store
        if (!db.objectStoreNames.contains(this.COUNTER_STORE)) {
          db.createObjectStore(this.COUNTER_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async saveQuiz(quizData: QuizData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.QUIZ_STORE], 'readwrite');
      const store = transaction.objectStore(this.QUIZ_STORE);
      const request = store.put(quizData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getQuiz(id: string): Promise<QuizData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.QUIZ_STORE], 'readonly');
      const store = transaction.objectStore(this.QUIZ_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteQuiz(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.QUIZ_STORE], 'readwrite');
      const store = transaction.objectStore(this.QUIZ_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveLastGeneratedQuiz(quizData: LastGeneratedQuiz): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LAST_QUIZ_STORE], 'readwrite');
      const store = transaction.objectStore(this.LAST_QUIZ_STORE);
      const request = store.put(quizData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLastGeneratedQuiz(): Promise<LastGeneratedQuiz | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LAST_QUIZ_STORE], 'readonly');
      const store = transaction.objectStore(this.LAST_QUIZ_STORE);
      const request = store.get('last');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteLastGeneratedQuiz(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LAST_QUIZ_STORE], 'readwrite');
      const store = transaction.objectStore(this.LAST_QUIZ_STORE);
      const request = store.delete('last');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Quiz counter methods
  async getQuizCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.COUNTER_STORE], 'readonly');
      const store = transaction.objectStore(this.COUNTER_STORE);
      const request = store.get('counter');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const counter = request.result as QuizCounter | undefined;
        resolve(counter?.count || 0);
      };
    });
  }

  async incrementQuizCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.COUNTER_STORE], 'readwrite');
      const store = transaction.objectStore(this.COUNTER_STORE);
      
      // First get current count
      const getRequest = store.get('counter');
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const counter = getRequest.result as QuizCounter | undefined;
        const newCount = (counter?.count || 0) + 1;
        
        // Update or create counter
        const putRequest = store.put({
          id: 'counter',
          count: newCount,
          lastReset: counter?.lastReset || Date.now()
        });
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve(newCount);
      };
    });
  }

  async canGenerateQuiz(): Promise<boolean> {
    const count = await this.getQuizCount();
    return count < this.MAX_GENERATIONS;
  }

  async getRemainingGenerations(): Promise<number> {
    const count = await this.getQuizCount();
    return Math.max(0, this.MAX_GENERATIONS - count);
  }

  async resetCounter(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.COUNTER_STORE], 'readwrite');
      const store = transaction.objectStore(this.COUNTER_STORE);
      const request = store.put({
        id: 'counter',
        count: 0,
        lastReset: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Utility method for testing - set counter to a specific value
  async setCounterValue(value: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.COUNTER_STORE], 'readwrite');
      const store = transaction.objectStore(this.COUNTER_STORE);
      const request = store.put({
        id: 'counter',
        count: Math.max(0, Math.min(value, this.MAX_GENERATIONS)),
        lastReset: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }



  async clearOldQuizzes(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.QUIZ_STORE], 'readwrite');
      const store = transaction.objectStore(this.QUIZ_STORE);
      const index = store.index('timestamp');
      const cutoff = Date.now() - maxAge;
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const quizCache = new QuizCache();
export type { QuizData, LastGeneratedQuiz };
