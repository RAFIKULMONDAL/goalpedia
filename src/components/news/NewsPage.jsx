import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getNews }  from '../../firebase/newsService';
import { NEWS, TICKER } from '../../data/news'; // fallback static data

const TAG_COLORS = {
  Transfer:    'bg-blue-600',
  Injury:      'bg-orange-600',
  Award:       'bg-yellow-600',
  Record:      'bg-purple-600',
  'Match Report': 'bg-green-700',
  Analysis:    'bg-gray-600',
  News:        'bg-[#cc0000]',
};

export default function NewsPage() {
  const { dark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [isLive,   setIsLive]   = useState(false); // true = from API, false = static

  useEffect(() => {
    getNews(20)
      .then(data => {
        if (data.length > 0) {
          setArticles(data);
          setIsLive(true);
        } else {
          // Fall back to static news data if Firestore is empty
          setArticles(NEWS);
          setIsLive(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setArticles(NEWS);
        setIsLive(false);
        setLoading(false);
      });
  }, []);

  const featured = articles.find(a => a.featured) || articles[0];
  const rest     = articles.filter(a => !a.featured && a !== featured).slice(0, 12);

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';

  const tagColor = (tag) => TAG_COLORS[tag] || 'bg-[#cc0000]';

  if (loading) return (
    <div className={`flex-1 flex items-center justify-center py-24 ${t3}`}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[0.72rem] font-bold uppercase tracking-widest">Loading news…</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#cc0000]">
        <h2 className={`text-[0.95rem] font-extrabold uppercase tracking-wide ${t1}`}>News</h2>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[0.54rem] font-bold text-green-400 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </span>
          )}
          <span className={`text-[0.58rem] font-semibold uppercase tracking-widest ${t3}`}>
            {articles.length} articles
          </span>
        </div>
      </div>

      {/* Ticker */}
      <div className={`flex gap-5 overflow-x-auto scrollbar-hide px-3 py-2 rounded mb-4 border-l-4 border-[#cc0000] ${dark ? 'bg-[#222]' : 'bg-gray-50'}`}>
        {(isLive ? articles.slice(0, 5) : TICKER.map(([label, text]) => ({ tag: label, title: text }))).map((item, i) => (
          <div key={i} className={`flex flex-col gap-0.5 min-w-[180px] flex-shrink-0 pr-5 border-r last:border-r-0 last:pr-0 ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
            <span className="text-[0.46rem] font-extrabold text-[#cc0000] uppercase tracking-widest">{item.tag}</span>
            <span className={`text-[0.63rem] font-semibold leading-snug line-clamp-2 ${t1}`}>{item.title}</span>
          </div>
        ))}
      </div>

      {/* Featured article */}
      {featured && (
        <>
          <p className={`text-[0.65rem] font-extrabold uppercase tracking-widest pb-2 mb-3 border-b-2 border-[#cc0000] flex items-center gap-2 ${t1}`}>
            Top Story
            <span className="text-[0.46rem] font-extrabold bg-[#cc0000] text-white px-1.5 py-0.5 rounded uppercase">
              {isLive ? 'Live' : 'Latest'}
            </span>
          </p>
          <a
            href={featured.url || '#'}
            target={featured.url ? '_blank' : '_self'}
            rel="noreferrer"
            className={`block rounded-xl overflow-hidden mb-5 transition-all hover:-translate-y-1 hover:shadow-2xl no-underline ${bg1}`}
          >
            {featured.img && (
              <div className="h-48 overflow-hidden bg-gray-800">
                <img
                  src={featured.img} alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={e => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="p-4">
              <span className={`inline-block text-[0.5rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded text-white mb-2 ${tagColor(featured.tag)}`}>
                {featured.tag}
              </span>
              <h3 className={`text-[0.9rem] font-extrabold uppercase tracking-tight leading-snug mb-1.5 ${t1}`}>
                {featured.title}
              </h3>
              <p className={`text-[0.68rem] leading-relaxed mb-2 line-clamp-3 ${t3}`}>{featured.desc}</p>
              <div className="flex items-center justify-between">
                <p className={`text-[0.54rem] font-semibold uppercase tracking-widest ${t3}`}>{featured.date}</p>
                {featured.source && (
                  <p className={`text-[0.54rem] font-bold uppercase tracking-wide text-[#cc0000]`}>{featured.source}</p>
                )}
              </div>
            </div>
          </a>
        </>
      )}

      {/* Article grid */}
      {rest.length > 0 && (
        <>
          <p className={`text-[0.65rem] font-extrabold uppercase tracking-widest pb-2 mb-3 border-b-2 border-[#cc0000] ${t1}`}>
            Latest Stories
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article, i) => (
              <a
                key={article.firestoreId || article.id || i}
                href={article.url || '#'}
                target={article.url ? '_blank' : '_self'}
                rel="noreferrer"
                className={`rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col no-underline ${bg1}`}
              >
                {article.img ? (
                  <div className="h-36 overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                      src={article.img} alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={e => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className={`h-20 flex items-center justify-center flex-shrink-0 ${dark ? 'bg-[#222]' : 'bg-gray-100'}`}>
                    <span className="text-3xl">📰</span>
                  </div>
                )}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <span className={`text-[0.48rem] font-extrabold uppercase tracking-widest text-white px-1.5 py-0.5 rounded w-fit ${tagColor(article.tag)}`}>
                    {article.tag}
                  </span>
                  <h4 className={`text-[0.75rem] font-bold uppercase leading-snug line-clamp-2 ${t1}`}>
                    {article.title}
                  </h4>
                  <p className={`text-[0.62rem] leading-relaxed flex-1 line-clamp-2 ${t3}`}>{article.desc}</p>
                  <div className={`flex items-center justify-between pt-1.5 mt-auto border-t ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                    <p className={`text-[0.5rem] font-semibold uppercase tracking-widest ${t3}`}>{article.date}</p>
                    {article.source && (
                      <p className="text-[0.5rem] font-bold text-[#cc0000] uppercase">{article.source}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
