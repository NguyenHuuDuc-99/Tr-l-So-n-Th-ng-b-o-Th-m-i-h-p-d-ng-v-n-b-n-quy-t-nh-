/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Copy, Loader2, FileText, Check, AlertCircle, Sparkles, Languages } from 'lucide-react';
import { SYSTEM_INSTRUCTION } from './constants';

type Language = 'vi' | 'en';

const TRANSLATIONS = {
  vi: {
    title: "Admin Doc Generator",
    subtitle: "Trợ lý soạn thảo văn bản hành chính chuyên nghiệp (AI-powered)",
    inputLabel: "Yêu cầu văn bản",
    inputPlaceholder: "Mô tả văn bản bạn cần soạn thảo. Ví dụ: Sếp yêu cầu viết thông báo họp khẩn...",
    templatesLabel: "Mẫu nhanh (Click để chọn)",
    generateButton: "Soạn thảo văn bản",
    generating: "Đang soạn thảo...",
    resultLabel: "Kết quả",
    copy: "Sao chép",
    copied: "Đã chép",
    errorTitle: "Đã xảy ra lỗi",
    emptyOutput: "Văn bản được soạn thảo sẽ hiển thị tại đây",
    apiKeyError: "Chưa thiết lập GEMINI_API_KEY. Vui lòng cấu hình trong môi trường của bạn.",
    noContentError: "Không có nội dung được tạo. Vui lòng thử lại với yêu cầu cụ thể hơn.",
    genError: "Đã xảy ra lỗi khi tạo văn bản. Vui lòng thử lại."
  },
  en: {
    title: "Admin Doc Generator",
    subtitle: "Professional AI-powered administrative document drafting assistant",
    inputLabel: "Document Request",
    inputPlaceholder: "Describe the document you need. Example: Boss requested an urgent meeting notice...",
    templatesLabel: "Quick Templates (Click to select)",
    generateButton: "Generate Document",
    generating: "Generating...",
    resultLabel: "Result",
    copy: "Copy",
    copied: "Copied",
    errorTitle: "Error Occurred",
    emptyOutput: "Generated document will appear here",
    apiKeyError: "GEMINI_API_KEY is not set. Please configure it in your environment.",
    noContentError: "No content generated. Please try again with a more specific request.",
    genError: "An error occurred while generating the document. Please try again."
  }
};

const EXAMPLE_PROMPTS = {
  vi: [
    "Thông báo lịch nghỉ lễ 30/4 và 1/5 cho toàn thể nhân viên, nghỉ 2 ngày, yêu cầu dọn dẹp vệ sinh trước khi về.",
    "Thư mời họp sơ kết kinh doanh Quý 1 vào 9h sáng thứ 2 tuần sau tại phòng họp A, thành phần gồm Ban Giám đốc và các Trưởng phòng.",
    "Quyết định bổ nhiệm ông Nguyễn Văn A làm Trưởng phòng Marketing kể từ ngày 01/03/2026.",
    "Biên bản cuộc họp giao ban tuần, ghi nhận các vấn đề tồn đọng về tiến độ dự án X và giải pháp đề xuất.",
    "Thư mời họp Đại hội đồng cổ đông thường niên năm 2026, thời gian 8h00 ngày 20/04/2026 tại Khách sạn Melia, yêu cầu cổ đông mang theo CMND/CCCD.",
    "Thư mời họp phụ huynh học sinh cuối kỳ I, lớp 5A, vào 14h thứ Bảy tuần này tại phòng học lớp 5A."
  ],
  en: [
    "Notice of holiday schedule for April 30th and May 1st for all employees, 2 days off, cleaning required before leaving.",
    "Invitation letter for Q1 business review meeting at 9 AM next Monday in Meeting Room A, attendees include Board of Directors and Department Heads.",
    "Decision to appoint Mr. Nguyen Van A as Marketing Manager effective from March 1st, 2026.",
    "Weekly meeting minutes, recording pending issues regarding Project X progress and proposed solutions.",
    "Invitation to the 2026 Annual General Meeting of Shareholders, at 8:00 AM on April 20, 2026, at Melia Hotel, shareholders requested to bring ID cards.",
    "Invitation to the end-of-term parent-teacher meeting, Class 5A, at 2 PM this Saturday in Class 5A classroom."
  ]
};

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Language>('vi');

  const t = TRANSLATIONS[lang];

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setOutput('');

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(t.apiKeyError);
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text;
      
      if (text) {
        setOutput(text);
      } else {
        throw new Error(t.noContentError);
      }
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || t.genError);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-stone-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-900 rounded-xl text-white shadow-md">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                {t.title}
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors shadow-sm"
            title="Switch Language"
          >
            <Languages size={18} />
            <span className="font-medium">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </header>

        <main className="grid gap-8 lg:grid-cols-2 items-start">
          
          {/* Input Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="request-input" className="text-sm font-medium text-stone-700 uppercase tracking-wide flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                {t.inputLabel}
              </label>
              <textarea
                id="request-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none resize-none transition-all text-stone-800 placeholder:text-stone-400 text-base"
              />
            </div>

            {/* Quick Templates */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.templatesLabel}</p>
              <div className="grid grid-cols-1 gap-2">
                {EXAMPLE_PROMPTS[lang].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left text-sm p-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-100 hover:border-stone-300 transition-all text-stone-600 hover:text-stone-900 truncate"
                    title={prompt}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 text-red-700 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">{t.errorTitle}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t.generateButton}
                </>
              )}
            </button>
          </section>

          {/* Output Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col h-full min-h-[600px] lg:h-[calc(100vh-12rem)]">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl backdrop-blur-sm">
              <span className="text-sm font-medium text-stone-700 uppercase tracking-wide flex items-center gap-2">
                <FileText size={16} className="text-stone-500" />
                {t.resultLabel}
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={t.copy}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t.copy}</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto bg-white rounded-b-2xl">
              {output ? (
                <div className="prose prose-stone prose-sm md:prose-base max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-p:leading-relaxed prose-li:marker:text-stone-400">
                  <Markdown remarkPlugins={[remarkGfm]}>{output}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4 select-none">
                  <div className="p-6 bg-stone-50 rounded-full">
                    <FileText size={48} strokeWidth={1} />
                  </div>
                  <p className="text-sm font-medium text-stone-400">{t.emptyOutput}</p>
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

