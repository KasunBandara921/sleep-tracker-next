'use client';

import { useState } from 'react';
import { generateAIInsights } from '@/app/actions/generateAIInsights';

export default function AISleepInsights() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await generateAIInsights(question);
      if (res.error) {
        setError(res.error);
      } else if (res.insight) {
        setInsight(res.insight);
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred while analyzing your sleep.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to render basic markdown strings into beautiful styled elements
  const renderFormattedMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className='text-lg font-bold text-slate-800 mt-6 mb-2 first:mt-0 flex items-center gap-2'>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className='text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2'>
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        // Parse bold elements in bullet points
        return (
          <li key={index} className='text-slate-600 ml-5 list-disc mb-2 leading-relaxed'>
            {renderLineWithBold(line.replace('- ', ''))}
          </li>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={index} className='border-l-4 border-purple-500 bg-purple-50 p-4 my-6 rounded-r-xl italic text-purple-900 text-sm'>
            {renderLineWithBold(line.replace('> ', ''))}
          </blockquote>
        );
      }
      if (line.trim() === '***' || line.trim() === '---') {
        return <hr key={index} className='my-6 border-slate-100' />;
      }
      if (line.trim() === '') {
        return <div key={index} className='h-2' />;
      }

      return (
        <p key={index} className='text-slate-600 leading-relaxed mb-3'>
          {renderLineWithBold(line)}
        </p>
      );
    });
  };

  // Parse inline bold tags (**text**)
  const renderLineWithBold = (line: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className='font-semibold text-slate-900'>
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl'>
      {/* Decorative gradient header border */}
      <div className='h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' />
      
      <div className='p-6 sm:p-8'>
        {/* Header */}
        <div className='mb-6 border-b border-slate-50 pb-6'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-2xl'>🤖</span>
            <h3 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
              AI Sleep Coach
            </h3>
          </div>
          <p className='text-slate-500 text-sm'>
            Personalized insights and instant Q&A powered by your sleep patterns
          </p>
        </div>

        {/* Input Form for Ask Question */}
        <form onSubmit={handleGenerate} className='mb-6 flex flex-col gap-3'>
          <label htmlFor='coach-question' className='text-slate-700 font-semibold text-sm'>
            Ask your AI Coach a question:
          </label>
          <div className='flex gap-2 flex-col sm:flex-row'>
            <input
              id='coach-question'
              type='text'
              placeholder='Ask anything or leave blank for a comprehensive sleep review...'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className='flex-grow border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50/50 disabled:opacity-50'
            />
            <button
              type='submit'
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600'
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                    ></path>
                  </svg>
                  Thinking...
                </>
              ) : question ? (
                '💬 Ask AI Coach'
              ) : (
                '✨ Get Insights'
              )}
            </button>
          </div>
          
          {/* Quick suggestions */}
          <div className='flex flex-wrap gap-2 mt-1'>
            <span className='text-xs text-slate-400 self-center'>Try asking:</span>
            <button
              type='button'
              disabled={loading}
              onClick={() => setQuestion('How can I resolve my sleep debt?')}
              className='text-xs bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200 hover:border-purple-200 px-2.5 py-1 rounded-full cursor-pointer transition'
            >
              How do I fix my sleep debt?
            </button>
            <button
              type='button'
              disabled={loading}
              onClick={() => setQuestion('Why is my consistency score low?')}
              className='text-xs bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200 hover:border-purple-200 px-2.5 py-1 rounded-full cursor-pointer transition'
            >
              Why is my consistency low?
            </button>
            <button
              type='button'
              disabled={loading}
              onClick={() => setQuestion('Summarize patterns in my sleep modes.')}
              className='text-xs bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200 hover:border-purple-200 px-2.5 py-1 rounded-full cursor-pointer transition'
            >
              Analyze my sleep notes
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className='bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm mb-6 flex items-start gap-3'>
            <span className='text-lg'>⚠️</span>
            <div>
              <h5 className='font-semibold mb-1'>Analysis Failed</h5>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Insight content rendering */}
        {loading ? (
          <div className='space-y-4 animate-pulse py-4'>
            <div className='h-6 bg-slate-100 rounded w-1/3'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-slate-100 rounded w-full'></div>
              <div className='h-4 bg-slate-100 rounded w-5/6'></div>
              <div className='h-4 bg-slate-100 rounded w-4/5'></div>
            </div>
            <div className='h-6 bg-slate-100 rounded w-1/4 mt-8'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-slate-100 rounded w-full'></div>
              <div className='h-4 bg-slate-100 rounded w-11/12'></div>
            </div>
          </div>
        ) : insight ? (
          <div className='prose max-w-none prose-slate py-2 transition-all duration-500 ease-in-out'>
            {renderFormattedMarkdown(insight)}
          </div>
        ) : (
          <div className='text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200'>
            <span className='text-4xl mb-4 block'>🌙</span>
            <h4 className='text-slate-800 font-bold text-lg mb-1'>
              Unlock Your Sleep Patterns
            </h4>
            <p className='text-slate-500 max-w-md mx-auto text-sm mb-6'>
              Ask your AI Sleep Coach a specific question above, or leave it blank to get a complete statistics review based on your logged journals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
