
import React from 'react';
import { SellerNotification } from '../types';

interface NotificationDropdownProps {
  notifications: SellerNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewAll: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  notifications, 
  onMarkAsRead,
  onClearAll,
  onViewAll,
  onClose 
}) => {
  const latest = notifications.slice(0, 5);

  return (
    <div className="absolute top-full right-0 mt-3 w-80 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
      <div className="p-4 bg-slate-800/50 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
           <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Recent Activity</h3>
           {notifications.length > 0 && (
             <button onClick={onClearAll} className="text-[8px] text-indigo-400 font-black uppercase hover:text-white transition-colors ml-2">Clear All</button>
           )}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {latest.length > 0 ? latest.map((n) => (
          <div 
            key={n.id} 
            onClick={() => onMarkAsRead(n.id)}
            className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex gap-3 items-start ${n.isRead ? 'opacity-50 hover:bg-white/5' : 'bg-indigo-600/5 hover:bg-indigo-600/10'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'quality_removal' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {n.type === 'quality_removal' 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                }
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-300 leading-snug font-medium">{n.message}</p>
              <span className="text-[9px] text-slate-600 font-bold uppercase mt-1 block">{new Date(n.timestamp).toLocaleDateString()}</span>
            </div>
            {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1"></div>}
          </div>
        )) : (
          <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-widest opacity-50">No new alerts</div>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full py-3 bg-slate-800/80 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest transition-all"
      >
        View All History
      </button>
    </div>
  );
};

export default NotificationDropdown;
