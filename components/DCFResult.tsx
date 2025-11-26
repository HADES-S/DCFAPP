import React from 'react';
import { DCFResult, DCFInputs } from '../types';
import { calculateDCF, formatCurrency, formatNumber } from '../utils/dcfCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface DCFResultProps {
  inputs: DCFInputs;
  reasoning: string | null;
  sources: string[];
}

export const DCFResultDisplay: React.FC<DCFResultProps> = ({ inputs, reasoning, sources }) => {
  const result: DCFResult = calculateDCF(inputs);
  const { isUndervalued, upsideDownside, intrinsicValuePerShare } = result;

  // Data for chart
  const chartData = result.projections.map(p => ({
    name: `第 ${p.year} 年`,
    fcf: p.fcf,
    discounted: p.discountedFcf
  }));

  // Append Terminal Value (Present Value) to chart for visualization
  const chartDataWithTV = [
    ...chartData,
    { name: '终值 (现值)', fcf: result.terminalValue, discounted: result.presentTerminalValue }
  ];

  return (
    <div className="space-y-6">
      {/* Main Valuation Card */}
      <div className={`rounded-xl shadow-lg border p-8 text-white relative overflow-hidden ${isUndervalued ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-20">
            {isUndervalued ? <TrendingUp size={100} /> : <TrendingDown size={100} />}
        </div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-medium opacity-90 mb-2">每股内在价值</h2>
          <div className="text-5xl font-bold mb-4">{formatCurrency(intrinsicValuePerShare)}</div>
          
          <div className="flex items-center space-x-4 text-lg">
            <div className="opacity-90">
              当前: <span className="font-semibold">{formatCurrency(inputs.currentPrice)}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold bg-white ${isUndervalued ? 'text-emerald-700' : 'text-red-700'}`}>
              {upsideDownside > 0 ? '+' : ''}{upsideDownside.toFixed(2)}% {isUndervalued ? '上涨空间' : '下跌空间'}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="font-semibold text-lg">{isUndervalued ? '低估 (Undervalued)' : '高估 (Overvalued)'}</p>
            <p className="text-sm opacity-80">基于您的输入假设。</p>
          </div>
        </div>
      </div>

      {/* AI Reasoning Section */}
      {reasoning && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="flex items-center text-blue-800 font-semibold mb-2">
                <Activity className="w-4 h-4 mr-2" />
                AI 分析与假设
            </h3>
            <p className="text-blue-900/80 text-sm leading-relaxed mb-3">
                {reasoning}
            </p>
            {sources.length > 0 && (
              <div className="text-xs text-blue-800/60">
                <span className="font-semibold">来源:</span>
                <ul className="list-disc list-inside mt-1">
                  {sources.slice(0, 3).map((s, i) => (
                    <li key={i} className="truncate"><a href={s} target="_blank" rel="noreferrer" className="hover:underline">{s}</a></li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">企业价值 (Enterprise Value)</div>
            <div className="text-slate-800 font-bold text-lg">
                {formatNumber(result.totalEnterpriseValue / 1000000)}M
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">终值 (现值)</div>
            <div className="text-slate-800 font-bold text-lg">
                {formatNumber(result.presentTerminalValue / 1000000)}M
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-800 font-semibold mb-4">预测现金流 (折现后)</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataWithTV} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis hide />
                <ReTooltip 
                    cursor={{fill: '#f1f5f9'}}
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="discounted" radius={[4, 4, 0, 0]}>
                   {chartDataWithTV.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartDataWithTV.length - 1 ? '#3b82f6' : '#94a3b8'} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
            蓝色柱代表终值的现值
        </p>
      </div>

    </div>
  );
};
