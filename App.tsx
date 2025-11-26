import React, { useState } from 'react';
import { DCFForm } from './components/DCFForm';
import { DCFResultDisplay } from './components/DCFResult';
import { DCFInputs } from './types';
import { analyzeStockWithGemini } from './services/geminiService';
import { TrendingUp, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<DCFInputs>({
    symbol: '',
    currentPrice: 0,
    freeCashFlow: 0,
    growthRate: 10,
    discountRate: 9,
    terminalGrowthRate: 2.5,
    sharesOutstanding: 0,
    projectionYears: 5
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputs.symbol) return;
    
    setIsLoading(true);
    setError(null);
    setReasoning(null);
    
    try {
      const result = await analyzeStockWithGemini(inputs.symbol);
      
      setInputs(prev => ({
        ...prev,
        ...result.inputs
      }));
      setReasoning(result.reasoning);
      setSources(result.sources);
    } catch (err: any) {
      setError(err.message || "分析股票失败。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
                <TrendingUp size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ValuMate</h1>
          </div>
          <div className="flex items-center text-sm text-slate-500">
             <span className="hidden sm:inline">专业 DCF 估值模型</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Hero */}
        <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">股票估值引擎</h2>
            <p className="text-slate-600 max-w-2xl">
                输入股票代码并利用 Gemini AI 自动获取财务数据，或手动输入您的假设，计算公司的内在价值。
            </p>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <span className="font-bold mr-2">错误:</span> {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <DCFForm 
                inputs={inputs} 
                setInputs={setInputs} 
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
            />
            
            <div className="bg-slate-100 rounded-xl p-5 text-slate-500 text-sm">
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    工作原理
                </h4>
                <p>
                    现金流折现 (DCF) 模型基于公司预期的未来现金流来估算其投资价值。
                    DCF 分析试图根据未来的资金产生情况，计算出投资在今天的价值。
                </p>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {inputs.currentPrice > 0 && inputs.freeCashFlow > 0 ? (
                 <DCFResultDisplay inputs={inputs} reasoning={reasoning} sources={sources} />
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-8 text-slate-400">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <TrendingUp size={48} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-500">尚未生成估值</p>
                    <p className="text-center max-w-xs mt-2">输入代码并点击“AI 自动填充”，或手动输入数据查看估值结果。</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
