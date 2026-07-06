import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiTrendingUp, FiShoppingBag, FiAward, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import { SkeletonCard, SkeletonBox } from '../components/common/SkeletonLoader';

const formatSmallINR = (val) => {
  if (!val) return '₹0.00';
  const n = parseFloat(val?.$numberDecimal || val || 0);
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const TrendingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/trending/products?limit=10'),
          api.get('/trending/categories?limit=5')
        ]);
        setProducts(prodRes.data?.data?.products || []);
        setCategories(catRes.data?.data?.categories || []);
      } catch (error) {
        console.error('Failed to fetch trending data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <Helmet><title>Trending Insights | OrderPulse</title></Helmet>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500 mb-1">Market Intelligence</p>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          Trending Insights
          <FiTrendingUp className="text-rose-500" size={32} />
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Discover what's hot and driving sales right now.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Categories */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card-panel flex flex-col h-full overflow-hidden relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-rose-600/10 to-transparent blur-xl"></div>
            <div className="p-6 border-b border-slate-200 dark:border-rose-500/10 relative z-10">
              <h3 className="card-header flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <FiBarChart2 size={18} />
                Hot Categories
              </h3>
            </div>
            <div className="flex-1 p-6 relative z-10">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <SkeletonBox key={i} className="w-full h-16 rounded-2xl" />)}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center text-slate-500 py-10">No trending categories available.</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, idx) => (
                    <div key={cat.category} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/[0.05] hover:border-rose-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white capitalize">{cat.category}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cat.totalQuantitySold} items sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-rose-600 dark:text-rose-400">{formatSmallINR(cat.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Trending Products */}
        <div className="lg:col-span-2">
          <div className="card-panel flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-indigo-500/10">
              <h3 className="card-header flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <FiShoppingBag size={18} />
                Top Trending Products
              </h3>
            </div>
            <div className="flex-1 p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} className="h-24" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center text-slate-500 py-10">No trending products available.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((prod, idx) => (
                    <div key={prod.productId} className="relative p-5 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/[0.05] hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 flex items-start gap-4 overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiAward className="text-indigo-500" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1">{prod.category}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">{prod.productName}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-[10px] uppercase text-slate-500">Sales</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{prod.totalQuantitySold}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-500">Revenue</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{formatSmallINR(prod.totalRevenue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
