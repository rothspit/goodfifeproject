'use client';

import { useState, useEffect } from 'react';
import { dashboardAPI, reservationAPI } from '../lib/api';
import type { DashboardKPI } from '../types';

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get KPIs
      const kpiData = await dashboardAPI.getKPIs();
      setKpis(kpiData);

      // Get last 7 days sales
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const sales = await dashboardAPI.getSalesData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setSalesData(sales);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'daily' | 'monthly') => {
    try {
      if (type === 'daily') {
        const report = await dashboardAPI.generateDailyReport(reportDate);
        downloadReport(report, `daily_report_${reportDate}.json`);
      } else {
        const date = new Date(reportDate);
        const report = await dashboardAPI.generateMonthlyReport(
          date.getFullYear(),
          date.getMonth() + 1
        );
        downloadReport(report, `monthly_report_${date.getFullYear()}_${date.getMonth() + 1}.json`);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('レポート生成に失敗しました');
    }
  };

  const downloadReport = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading || !kpis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Sales */}
        <div className="dashboard-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">本日の売上</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(kpis.todaySales)}</p>
          <p className="text-sm opacity-75 mt-1">{kpis.todayOrders}件の予約</p>
        </div>

        {/* New Customers */}
        <div className="dashboard-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">新規顧客</h3>
          <p className="text-3xl font-bold mt-2">{kpis.newCustomers}人</p>
          <p className="text-sm opacity-75 mt-1">今月</p>
        </div>

        {/* Repeat Rate */}
        <div className="dashboard-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">リピート率</h3>
          <p className="text-3xl font-bold mt-2">{formatPercent(kpis.repeatRate)}</p>
          <p className="text-sm opacity-75 mt-1">過去30日</p>
        </div>

        {/* Average Order Value */}
        <div className="dashboard-card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-sm font-medium opacity-90">平均客単価</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(kpis.avgOrderValue)}</p>
          <p className="text-sm opacity-75 mt-1">全期間</p>
        </div>

        {/* Cast Utilization */}
        <div className="dashboard-card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <h3 className="text-sm font-medium opacity-90">キャスト稼働率</h3>
          <p className="text-3xl font-bold mt-2">{formatPercent(kpis.castUtilization)}</p>
          <p className="text-sm opacity-75 mt-1">本日</p>
        </div>

        {/* Total Metrics */}
        <div className="dashboard-card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <h3 className="text-sm font-medium opacity-90">今月の予約数</h3>
          <p className="text-3xl font-bold mt-2">{kpis.todayOrders * 7}件</p>
          <p className="text-sm opacity-75 mt-1">想定値</p>
        </div>
      </div>

      {/* Sales Chart (Last 7 Days) */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">過去7日間の売上推移</h2>
        {salesData.length > 0 ? (
          <div className="space-y-2">
            {salesData.map((day: any) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="bg-blue-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full flex items-center justify-end px-3 text-white text-sm font-medium"
                      style={{ width: `${Math.min((day.total / 100000) * 100, 100)}%` }}
                    >
                      {day.total > 0 && formatCurrency(day.total)}
                    </div>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {day.count}件
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">データがありません</p>
        )}
      </div>

      {/* Report Generation */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">レポート自動生成</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              レポート対象日
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="input-field max-w-xs"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => generateReport('daily')}
              className="btn-primary"
            >
              日次レポート生成
            </button>
            <button
              onClick={() => generateReport('monthly')}
              className="btn-secondary"
            >
              月次レポート生成
            </button>
          </div>
          <p className="text-sm text-gray-500">
            ※レポートはJSON形式でダウンロードされます
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">クイック統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-blue-600">{kpis.todayOrders}</p>
            <p className="text-sm text-gray-600 mt-1">本日予約</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-green-600">{kpis.newCustomers}</p>
            <p className="text-sm text-gray-600 mt-1">新規顧客</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(kpis.avgOrderValue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">平均客単価</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-pink-600">
              {formatPercent(kpis.repeatRate)}
            </p>
            <p className="text-sm text-gray-600 mt-1">リピート率</p>
          </div>
        </div>
      </div>
    </div>
  );
}
