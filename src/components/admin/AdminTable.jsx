import { Loader2, Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AdminTable = ({ 
  data, 
  loading, 
  activeTab, 
  page, 
  totalCount, 
  setPage, 
  onEdit, 
  onDelete,
  sortConfig,
  onSort 
}) => {
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const safeFormatDate = (dateString) => {
    if (!dateString) return '-';
    try { return format(new Date(dateString), 'MMM d, yyyy'); } catch (e) { return '-'; }
  };

  // Komponent nagłówka tabeli z obsługą kliknięcia
  const SortableHeader = ({ label, column, className = "" }) => {
    // Sprawdzamy, czy ta kolumna jest aktualnie sortowana
    const isActive = sortConfig?.column === column;
    const isAsc = sortConfig?.direction === 'asc';

    return (
      <th 
        className={`p-4 font-medium cursor-pointer hover:text-primary transition-colors select-none group ${className}`}
        onClick={() => onSort(column)} // Wywołanie funkcji sortowania po kliknięciu
        title={`Sort by ${label}`}
      >
        <div className={`flex items-center gap-1 ${className.includes('right') ? 'justify-end' : className.includes('center') ? 'justify-center' : 'justify-start'}`}>
          {label}
          <span className="text-textMuted group-hover:text-primary transition-colors">
            {isActive ? (
              isAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />
            ) : (
              <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />
            )}
          </span>
        </div>
      </th>
    );
  };

  // Wiersz Użytkownika
  const renderUserRow = (item) => (
    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors border-t border-border">
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-textMain">@{item.username || 'unknown'}</span>
          <span className="text-[10px] font-mono text-textMuted">{item.id.slice(0, 6)}...</span>
        </div>
      </td>
      <td className="p-4 text-textMain">{item.full_name || '-'}</td>
      <td className="p-4 text-sm text-textMuted">{item.email}</td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          item.role_id === 2 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {item.role_id === 2 ? 'Admin' : 'User'}
        </span>
      </td>
      <td className="p-4 text-center">
        <Link to={`/profile/${item.id}`} target="_blank" className="text-primary hover:text-primary/80">
          <ExternalLink size={16}/>
        </Link>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button onClick={() => onEdit(item)} variant="ghost" className="p-2 h-8 w-8"><Edit2 size={16}/></Button>
          <Button onClick={() => onDelete(item.id)} variant="ghost" className="p-2 h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></Button>
        </div>
      </td>
    </tr>
  );

  // Wiersz Projektu
  const renderProjectRow = (item) => (
    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors border-t border-border">
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-textMain line-clamp-1" title={item.title}>{item.title}</span>
          <span className="text-xs text-textMuted">Apps: {item.applications?.length || 0}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col text-sm">
          <span className="text-textMain font-medium">{item.profiles?.full_name || 'Unknown'}</span>
          <span className="text-xs text-textMuted">{item.profiles?.email}</span>
        </div>
      </td>
      <td className="p-4 text-xs text-textMuted whitespace-nowrap">{safeFormatDate(item.created_at)}</td>
      <td className="p-4 text-center">
        <span className={`text-[10px] inline-flex w-fit px-2 py-0.5 rounded border ${
          item.status_id === 1 ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-gray-500/20 text-gray-400'
        }`}>
          {item.status_id === 1 ? 'Open' : 'Closed'}
        </span>
        <div className="text-[10px] text-textMuted mt-1">{item.members_current}/{item.members_max} Team</div>
      </td>
      <td className="p-4 text-center">
        <Link to={`/projects/${item.id}`} target="_blank" className="inline-flex p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors">
          <ExternalLink size={16} />
        </Link>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button onClick={() => onEdit(item)} variant="ghost" className="p-2 h-8 w-8"><Edit2 size={16}/></Button>
          <Button onClick={() => onDelete(item.id)} variant="ghost" className="p-2 h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></Button>
        </div>
      </td>
    </tr>
  );

  return (
    <Card className="p-0 overflow-hidden flex flex-col min-h-[400px]">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center py-16">
          <h3 className="text-lg font-medium text-textMain">No results found</h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 text-textMuted text-xs uppercase tracking-wider border-b border-border">
                  {/* Używamy SortableHeader z nazwami kolumn z bazy danych */}
                  {activeTab === 'users' ? (
                    <>
                      <SortableHeader label="User (ID)" column="username" />
                      <SortableHeader label="Full Name" column="full_name" />
                      <SortableHeader label="Email" column="email" />
                      <SortableHeader label="Role" column="role_id" />
                      <th className="p-4 font-medium text-center">Profile</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <SortableHeader label="Project Name" column="title" className="w-1/4" />
                      <SortableHeader label="Leader ID" column="author_id" />
                      <SortableHeader label="Created" column="created_at" />
                      <SortableHeader label="Status" column="status_id" className="text-center" />
                      <th className="p-4 font-medium text-center">View</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map(item => activeTab === 'users' ? renderUserRow(item) : renderProjectRow(item))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalCount > 0 && (
            <div className="border-t border-border p-4 bg-background/30 flex items-center justify-between">
              <span className="text-xs text-textMuted">Page {page} of {totalPages} ({totalCount} items)</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 h-8 w-8"><ChevronLeft size={16}/></Button>
                <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 h-8 w-8"><ChevronRight size={16}/></Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AdminTable;