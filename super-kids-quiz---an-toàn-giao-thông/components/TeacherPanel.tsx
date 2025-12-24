
import React, { useState } from 'react';
import { Question } from '../types';

interface TeacherPanelProps {
  initialQuestions: Question[];
  initialTopic: string;
  initialBg: string;
  onSave: (questions: Question[], topic: string, bg: string) => void;
  onCancel: () => void;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ initialQuestions, initialTopic, initialBg, onSave, onCancel }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [bg, setBg] = useState(initialBg);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[optIndex] = value;
      return { ...q, options: newOptions };
    }));
  };

  const addNewQuestion = () => {
    const newId = Date.now().toString();
    setQuestions([
      ...questions,
      { id: newId, text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl mx-auto p-8 max-h-[90vh] overflow-y-auto border-4 border-purple-100">
      <div className="flex justify-between items-center mb-8 border-b-4 border-purple-50 pb-4">
        <div>
          <h2 className="text-3xl font-black text-purple-700">Góc Cài Đặt Của Thầy Duy 👨‍🏫</h2>
          <p className="text-gray-400 font-bold text-sm italic">Thầy có thể chỉnh sửa câu hỏi và hình ảnh ở đây nhen!</p>
        </div>
        <button onClick={onCancel} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-sky-50 p-6 rounded-3xl border-2 border-sky-100">
          <label className="block text-sky-700 font-black mb-2 uppercase text-xs tracking-wider">Chủ đề bài học</label>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-4 bg-white border-2 border-sky-200 rounded-2xl focus:ring-4 focus:ring-sky-100 outline-none font-bold text-gray-700"
            placeholder="Ví dụ: An toàn giao thông"
          />
        </div>

        <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100">
          <label className="block text-purple-700 font-black mb-2 uppercase text-xs tracking-wider">Link Hình Nền (Background)</label>
          <input 
            type="text" 
            value={bg} 
            onChange={(e) => setBg(e.target.value)}
            className="w-full p-4 bg-white border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 text-xs"
            placeholder="Dán link ảnh thầy muốn dùng vào đây nè thầy ơi..."
          />
          <p className="mt-2 text-[10px] text-purple-400 font-bold">* Thầy có thể lấy ảnh từ Google Drive hoặc các trang ảnh công cộng nhen!</p>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        <h3 className="text-xl font-black text-gray-700 border-l-8 border-yellow-400 pl-4">Danh sách câu hỏi ({questions.length})</h3>
        {questions.map((q, qIdx) => (
          <div key={q.id} className="border-4 border-gray-50 rounded-[2.5rem] p-6 bg-white shadow-sm relative hover:border-purple-50 transition-all">
            <div className="absolute -top-4 -left-2 bg-yellow-400 text-white font-black px-4 py-1 rounded-full shadow-md transform -rotate-3">
              CÂU {qIdx + 1}
            </div>
            
            <div className="absolute top-4 right-4">
               <button 
                onClick={() => removeQuestion(q.id)}
                className="text-red-300 hover:text-red-500 transition-colors p-2"
                disabled={questions.length <= 1}
                title="Xóa câu hỏi này"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </button>
            </div>
            
            <div className="mb-6 mt-4">
              <textarea
                value={q.text}
                onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-50 outline-none font-bold text-gray-700"
                rows={2}
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className={`flex items-center p-3 rounded-2xl border-2 transition-all ${q.correctAnswerIndex === optIdx ? 'border-green-400 bg-green-50 shadow-inner' : 'border-gray-100'}`}>
                  <div className="relative flex items-center justify-center mr-3">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctAnswerIndex === optIdx}
                      onChange={() => handleQuestionChange(q.id, 'correctAnswerIndex', optIdx)}
                      className="w-6 h-6 text-green-500 focus:ring-green-400 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                    className="flex-1 bg-transparent outline-none font-bold text-gray-600 text-sm"
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                  />
                  {q.correctAnswerIndex === optIdx && <span className="text-green-500 font-black text-xs ml-1">ĐÚNG</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-6 border-t-4 border-purple-50">
        <button 
          onClick={addNewQuestion}
          className="flex-1 py-4 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 font-black transition-all flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span> THÊM CÂU HỎI MỚI
        </button>
        <button 
          onClick={() => onSave(questions, topic, bg)}
          className="flex-1 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 font-black shadow-[0_8px_0_rgb(21,128,61)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          LƯU & BẮT ĐẦU CHƠI 🚀
        </button>
      </div>
    </div>
  );
};

export default TeacherPanel;
