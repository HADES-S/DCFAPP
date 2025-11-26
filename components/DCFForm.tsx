import React from 'react';
import { DCFInputs } from '../types';
import { Info, RotateCcw } from 'lucide-react';

interface DCFFormProps {
  inputs: DCFInputs;
  setInputs: React.Dispatch<React.SetStateAction<DCFInputs>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 -ml-32 text-xs text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
      {text}
    </div>
  </div>
);

export const DCFForm: React.FC<DCFFormProps> = ({ inputs, setInputs, onAnalyze, isLoading }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'symbol' ? value.toUpperCase() : parseFloat(value) || 0
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">模型参数</h2>
        <button 
          onClick={onAnalyze} 
          disabled={isLoading || !inputs.symbol}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isLoading 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
              获取数据中...
            </>
          ) : (
            'AI 自动填充'
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Ticker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">股票代码 (Ticker)</label>
          <input
            type="text"
            name="symbol"
            value={inputs.symbol}
            onChange={handleChange}
            placeholder="例如：AAPL"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono uppercase"
          />
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              当前股价 ($)
            </label>
            <input
              type="number"
              name="currentPrice"
              value={inputs.currentPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              流通股数
              <Tooltip text="所有股东持有的股份总数。用于计算每股价值。" />
            </label>
            <input
              type="number"
              name="sharesOutstanding"
              value={inputs.sharesOutstanding}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              自由现金流 (FCF)
              <Tooltip text="公司在扣除支持运营和维护资本资产所需的现金流出后产生的现金。" />
            </label>
            <input
              type="number"
              name="freeCashFlow"
              value={inputs.freeCashFlow}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
               {inputs.freeCashFlow > 1000000 ? `约 ${new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(inputs.freeCashFlow)}` : ''}
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              增长率 (%)
              <Tooltip text="未来 5 年自由现金流的预期年增长率。" />
            </label>
            <input
              type="number"
              name="growthRate"
              step="0.1"
              value={inputs.growthRate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              折现率 (WACC %)
              <Tooltip text="必要回报率。风险越高，回报率越高。大型股通常在 7% 到 12% 之间。" />
            </label>
            <input
              type="number"
              name="discountRate"
              step="0.1"
              value={inputs.discountRate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              永续增长率 (%)
              <Tooltip text="公司在 5 年后将永远保持的稳定增长率。通常等于 GDP 增长率 (2-3%)。" />
            </label>
            <input
              type="number"
              name="terminalGrowthRate"
              step="0.1"
              value={inputs.terminalGrowthRate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
           <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              预测年数
            </label>
            <input
              type="number"
              name="projectionYears"
              value={inputs.projectionYears}
              min="1"
              max="10"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
