import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { emptyWorkspace, loadWorkspace, makeMockTask, newId, roles, saveWorkspace, type Role, type Workspace } from './model';

type Tab = 'Projects' | 'Workers' | 'Tasks' | 'Code';
const nav: Tab[] = ['Projects', 'Workers', 'Tasks', 'Code'];
const symbol: Record<Role, string> = { 'Team Lead': '◈', Coder: '</>', Reviewer: '✓', Builder: '⬡' };
const fmt = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function App() {
  const [data, setData] = useState<Workspace>(() => {
    if (typeof localStorage === 'undefined') return emptyWorkspace();
    return loadWorkspace();
  });
  const [tab, setTab] = useState<Tab>('Projects');
  const [active, setActive] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [summary, setSummary] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [role, setRole] = useState<Role>('Coder');
  const [taskText, setTaskText] = useState('');
  const [taskWorker, setTaskWorker] = useState('');
  const [error, setError] = useState('');
  const selected = data.projects.find(p => p.id === active) ?? data.projects[0];
  const projectWorkers = useMemo(() => data.workers.filter(w => w.projectId === selected?.id), [data.workers, selected?.id]);
  const projectTasks = useMemo(() => data.tasks.filter(t => t.projectId === selected?.id), [data.tasks, selected?.id]);
  useEffect(() => { saveWorkspace(data); }, [data]);

  function createProject(e: FormEvent) {
    e.preventDefault(); const name = projectName.trim();
    if (!name || name.length > 60) { setError('Project name must be 1–60 characters.'); return; }
    const id = newId();
    setData(d => ({ ...d, projects: [...d.projects, { id, name, summary: summary.trim().slice(0, 180), createdAt: new Date().toISOString() }] }));
    setActive(id); setProjectName(''); setSummary(''); setError(''); setTab('Workers');
  }
  function addWorker(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const name = workerName.trim();
    if (!name || name.length > 40) { setError('Worker name must be 1–40 characters.'); return; }
    setData(d => ({ ...d, workers: [...d.workers, { id: newId(), projectId: selected.id, name, role }] }));
    setWorkerName(''); setError('');
  }
  function runDemo(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const worker = projectWorkers.find(w => w.id === taskWorker) ?? projectWorkers[0];
    if (!worker) { setError('Create a worker first.'); return; }
    try {
      const task = makeMockTask(selected.id, worker, taskText);
      setData(d => ({ ...d, tasks: [task, ...d.tasks] }));
      setTaskText(''); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid request'); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-icon">⌘</span><span>PocketDev<small>Mobile workspace</small></span></div>
      <span className="local-pill"><span className="dot"/> Local preview</span>
    </header>
    <section className="hero">
      <div className="eyebrow">SPRINT 0 · LOCAL PROTOTYPE</div>
      <h1>Build with a team.<br/><em>Own every line.</em></h1>
      <p>Create a project, organize your coding workers and explore the future PocketDev experience.</p>
      <div className="warning" role="status"><strong>DEMO MODE</strong> No AI inference, GitHub connection, code editing, tests, or builds are performed by workers. Demo tasks are simulated only.</div>
    </section>
    <main>
      <div className="workspace-heading">
        <div><span className="eyebrow">YOUR WORKSPACE</span><h2>{selected ? selected.name : 'Get started'}</h2><p>{selected?.summary || (selected ? 'Local-only project · Not connected to GitHub' : 'Your first project starts here.')}</p></div>
        {data.projects.length > 0 && <label className="switcher">Project<select aria-label="Active project" value={selected?.id} onChange={e => { setActive(e.target.value); setError(''); }} >{data.projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>}
      </div>
      <nav className="nav-tabs" aria-label="Workspace sections">{nav.map(n => <button key={n} type="button" className={tab===n?'active':''} onClick={() => {setTab(n); setError('')}} aria-current={tab===n?'page':undefined}>{n}</button>)}</nav>
      {error && <p className="error" role="alert">{error}</p>}
      {tab==='Projects' && <section className="panel">
        <h3>Create a project</h3><p className="support">Projects are saved only in this browser. GitHub connectivity is planned for a later sprint.</p>
        <form onSubmit={createProject} className="form"><label>Project name<input maxLength={60} required placeholder="My portfolio website" value={projectName} onChange={e=>setProjectName(e.target.value)}/></label><label>What are you building? <span className="optional">(optional)</span><textarea maxLength={180} rows={3} placeholder="A simple portfolio website…" value={summary} onChange={e=>setSummary(e.target.value)}/></label><button className="primary" type="submit">＋ Create project</button></form>
        {data.projects.length>0 && <><h3 className="subheading">My projects <span className="count">{data.projects.length}</span></h3><div className="stack">{data.projects.map(p => <button className={'project-card '+(p.id===selected?.id?'chosen':'')} key={p.id} onClick={()=>{setActive(p.id);setTab('Workers')}}><span className="folder-symbol">▣</span><span className="project-content"><strong>{p.name}</strong><small>{p.summary||'Local prototype'}</small></span><span aria-hidden="true">›</span></button>)}</div></>}
      </section>}
      {tab==='Workers' && <section className="panel">
        {!selected ? <Empty title="No project selected" description="Create a project first to add workers." go={()=>setTab('Projects')}/> : <>
          <div className="section-title"><div><h3>AI worker roster <span className="count">{projectWorkers.length}</span></h3><p className="support">These are role profiles. No autonomous worker is running.</p></div></div>
          <div className="worker-grid">{projectWorkers.map(w => <article className="worker-card" key={w.id}><span className={'worker-avatar '+w.role.toLowerCase().replaceAll(' ','-')}>{symbol[w.role]}</span><strong>{w.name}</strong><span className="muted">{w.role}</span><span className="worker-status">● Not running</span></article>)}</div>
          <div className="inner-panel"><h3>Create worker</h3><form className="form" onSubmit={addWorker}><label>Worker name<input maxLength={40} placeholder="Alex" required value={workerName} onChange={e=>setWorkerName(e.target.value)}/></label><label>Worker role<select value={role} onChange={e=>setRole(e.target.value as Role)}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><p className="support">Roles are visual templates only in this sprint. Permissioned tools will come later.</p><button className="primary" type="submit">＋ Add worker</button></form></div>
          {projectWorkers.length>0 && <button className="secondary wide" onClick={()=>setTab('Tasks')}>Open mock task board →</button>}
        </>}
      </section>}
      {tab==='Tasks' && <section className="panel">
        {!selected ? <Empty title="No project selected" description="Create a project before trying the task board." go={()=>setTab('Projects')}/> : <>
          <h3>Mock task board</h3><p className="support">Submit a demonstration request to see a simulated event timeline. It does not call a model or modify files.</p>
          <form className="form" onSubmit={runDemo}><label>Assign to<select disabled={!projectWorkers.length} value={projectWorkers.some(w=>w.id===taskWorker)?taskWorker:projectWorkers[0]?.id ?? ''} onChange={e=>setTaskWorker(e.target.value)}>{projectWorkers.map(w=><option key={w.id} value={w.id}>{w.name} — {w.role}</option>)}</select></label><label>Task request<textarea rows={4} maxLength={600} required value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="Create a responsive landing page…"/></label><button className="primary" type="submit" disabled={!projectWorkers.length}>▷ Simulate task</button></form>
          <h3 className="subheading">Task timeline <span className="count">{projectTasks.length}</span></h3>
          {projectTasks.length===0 ? <p className="empty-hint">No demonstration tasks yet.</p> : <div className="stack">{projectTasks.map(t=><article className="task-card" key={t.id}><div className="task-head"><strong>{t.request}</strong><span className="mock-badge">SIMULATED</span></div><small>{fmt(t.createdAt)} · Demo completed</small><ol>{t.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></article>)}</div>}
        </>}
      </section>}
      {tab==='Code' && <section className="panel"><h3>Repository workspace</h3><div className="empty-code"><span className="big-icon">⌁</span><h4>GitHub integration is next</h4><p>No repositories are connected and no source files have been fetched. This screen is intentionally a placeholder, not a functional editor.</p><span className="mock-badge">NOT IMPLEMENTED</span></div></section>}
    </main>
    <footer><span>POCKETDEV • SPRINT 0</span><span>Local prototype · No cloud costs</span></footer>
  </div>;
}
function Empty({title,description,go}:{title:string;description:string;go:()=>void}) {
  return <div className="empty-code"><span className="big-icon">▣</span><h3>{title}</h3><p>{description}</p><button className="primary" onClick={go}>Create project</button></div>;
}
