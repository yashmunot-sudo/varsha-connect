import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Clock, AlertTriangle, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDelegationScreenProps {
  lang: string;
}

const TaskDelegationScreen: React.FC<TaskDelegationScreenProps> = ({ lang }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: employees } = useAllEmployees();
  const [tab, setTab] = useState<'assigned_to' | 'assigned_by'>('assigned_to');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'done'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: myTasks } = useQuery({
    queryKey: ['tasks_assigned_to', user?.employeeId],
    enabled: !!user?.employeeId,
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, employees!tasks_created_by_fkey(name, emp_code)')
        .eq('assigned_to', user!.employeeId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: createdTasks } = useQuery({
    queryKey: ['tasks_created_by', user?.employeeId],
    enabled: !!user?.employeeId,
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, employees!tasks_assigned_to_fkey(name, emp_code)')
        .eq('created_by', user!.employeeId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const tasks = tab === 'assigned_to' ? myTasks : createdTasks;
  const now = new Date();

  const filteredTasks = tasks?.filter(t => {
    if (filter === 'pending') return t.status !== 'Done';
    if (filter === 'done') return t.status === 'Done';
    if (filter === 'overdue') return t.due_date && new Date(t.due_date) < now && t.status !== 'Done';
    return true;
  }) || [];

  const handleAcknowledge = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({
      status: 'Acknowledged',
      acknowledged_at: new Date().toISOString(),
    } as any).eq('id', taskId);
    if (error) toast.error(error.message);
    else { toast.success('✓ Acknowledged'); queryClient.invalidateQueries({ queryKey: ['tasks_assigned_to'] }); }
  };

  const handleComplete = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({
      status: 'Done',
      completed_at: new Date().toISOString(),
    } as any).eq('id', taskId);
    if (error) toast.error(error.message);
    else { toast.success('✓ Completed'); queryClient.invalidateQueries({ queryKey: ['tasks_assigned_to'] }); }
  };

  const canCreate = ['manager', 'hr_admin', 'owner', 'plant_head', 'supervisor'].includes(user?.role || '');

  const statusColors: Record<string, string> = {
    Assigned: 'bg-warning/10 text-warning',
    Acknowledged: 'bg-info/10 text-info',
    'In Progress': 'bg-primary/10 text-primary',
    Done: 'bg-success/10 text-success',
  };

  const priorityColors: Record<string, string> = {
    Normal: 'text-muted-foreground',
    Urgent: 'text-warning',
    Critical: 'text-destructive',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'कार्य / Tasks' : 'Tasks / कार्य'}
        </h2>
        {canCreate && (
          <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            <Plus className="w-3.5 h-3.5" /> {lang === 'hi' ? 'नया' : 'New'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('assigned_to')} className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all ${tab === 'assigned_to' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {lang === 'hi' ? 'मुझे दिए गए' : 'Assigned to me'}
        </button>
        {canCreate && (
          <button onClick={() => setTab('assigned_by')} className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all ${tab === 'assigned_by' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {lang === 'hi' ? 'मैंने दिए हुए' : 'Assigned by me'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'pending', 'overdue', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f === 'all' ? (lang === 'hi' ? 'सभी' : 'All') :
             f === 'pending' ? (lang === 'hi' ? 'लंबित' : 'Pending') :
             f === 'overdue' ? (lang === 'hi' ? 'अतिदेय' : 'Overdue') :
             (lang === 'hi' ? 'पूर्ण' : 'Done')}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.map(task => {
          const isOverdue = task.due_date && new Date(task.due_date) < now && task.status !== 'Done';
          return (
            <div key={task.id} className={`bg-card rounded-xl border ${isOverdue ? 'border-destructive/30' : 'border-border'} card-shadow p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{task.title}</div>
                  {task.description && <div className="text-[10px] text-muted-foreground mt-0.5">{task.description}</div>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[task.status] || 'bg-muted text-muted-foreground'}`}>
                  {task.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span className={`font-semibold ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                {task.due_date && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {task.due_date} {task.due_time || ''}
                  </span>
                )}
                {isOverdue && <span className="text-destructive font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Overdue</span>}
              </div>

              {/* Actions for assigned_to me */}
              {tab === 'assigned_to' && task.status === 'Assigned' && (
                <button onClick={() => handleAcknowledge(task.id)} className="w-full py-2 rounded-xl bg-info text-primary-foreground text-xs font-bold active:scale-[0.97] transition-all">
                  {lang === 'hi' ? 'स्वीकार करें / Acknowledge' : 'Acknowledge / स्वीकार करें'}
                </button>
              )}
              {tab === 'assigned_to' && (task.status === 'Acknowledged' || task.status === 'In Progress') && (
                <button onClick={() => handleComplete(task.id)} className="w-full py-2 rounded-xl bg-success text-primary-foreground text-xs font-bold active:scale-[0.97] transition-all flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {lang === 'hi' ? 'पूर्ण / Done' : 'Mark Done / पूर्ण'}
                </button>
              )}
            </div>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {lang === 'hi' ? 'कोई कार्य नहीं' : 'No tasks'}
          </div>
        )}
      </div>

      {/* Create form modal */}
      {showCreateForm && <CreateTaskForm lang={lang} employeeId={user?.employeeId} employees={employees || []} onClose={() => setShowCreateForm(false)} />}
    </div>
  );
};

const CreateTaskForm: React.FC<{
  lang: string;
  employeeId?: string;
  employees: any[];
  onClose: () => void;
}> = ({ lang, employeeId, employees, onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [empSearch, setEmpSearch] = useState('');

  const filteredEmps = empSearch
    ? employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.emp_code.toLowerCase().includes(empSearch.toLowerCase())).slice(0, 10)
    : employees.slice(0, 10);

  const handleSubmit = async () => {
    if (!title || !assignTo || !employeeId) return;
    setSubmitting(true);
    const { error } = await supabase.from('tasks').insert({
      title,
      description: description || null,
      assigned_to: assignTo,
      created_by: employeeId,
      priority,
      due_date: dueDate || null,
      due_time: dueTime || null,
    } as any);
    if (error) toast.error(error.message);
    else {
      // Notify assignee
      await supabase.from('notifications').insert({
        employee_id: assignTo,
        title: lang === 'hi' ? 'नया कार्य / New Task' : 'New Task / नया कार्य',
        body: title,
        type: 'task',
      });
      toast.success(lang === 'hi' ? '✓ कार्य बनाया' : '✓ Task created');
      queryClient.invalidateQueries({ queryKey: ['tasks_created_by'] });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-3 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'नया कार्य / New Task' : 'New Task / नया कार्य'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'शीर्षक' : 'Title'} *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'विवरण' : 'Description'}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground resize-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'किसको दें' : 'Assign To'} *</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={empSearch} onChange={e => setEmpSearch(e.target.value)} placeholder={lang === 'hi' ? 'खोजें...' : 'Search...'} className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground" />
          </div>
          {empSearch && (
            <div className="mt-1 max-h-32 overflow-y-auto border border-border rounded-xl bg-card">
              {filteredEmps.map(e => (
                <button key={e.id} onClick={() => { setAssignTo(e.id); setEmpSearch(`${e.name} (${e.emp_code})`); }} className="w-full text-left px-3 py-2 text-xs hover:bg-muted">
                  {e.name} ({e.emp_code}) · {e.department}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'प्राथमिकता' : 'Priority'}</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'अंतिम तिथि' : 'Due Date'}</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitting || !title || !assignTo} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'कार्य बनाएं / Create Task' : 'Create Task / कार्य बनाएं')}
        </button>
      </div>
    </div>
  );
};

export default TaskDelegationScreen;
