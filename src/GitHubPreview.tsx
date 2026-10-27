import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { fetchPublicFile, fetchPublicTree, parsePublicRepo, type GitEntry, type RepoSnapshot } from './github';

export default function GitHubPreview() {
  const [repoInput, setRepoInput] = useState('imjarvissingh/pocketdev');
  const [snapshot, setSnapshot] = useState<RepoSnapshot | null>(null);
  const [selected, setSelected] = useState<GitEntry | null>(null);
  const [contents, setContents] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [requestId, setRequestId] = useState(0);
  const files = useMemo(() => snapshot?.entries.filter(e => e.type === 'blob' && e.path.toLowerCase().includes(filter.toLowerCase())).slice(0, 150) ?? [], [snapshot, filter]);
  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();
    setLoading(true); setSnapshot(null); setSelected(null); setContents(''); setError('');
    let repo;
    try { repo = parsePublicRepo(repoInput); }
    catch(e) { setError(e instanceof Error ? e.message : 'Invalid repository'); setLoading(false); return; }
    fetchPublicTree(repo, controller.signal).then(setSnapshot).catch(e => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Repository request failed');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
    // Explicit user submission drives each read request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);
  useEffect(() => {
    if (!snapshot || !selected) return;
    const controller = new AbortController();
    setFileLoading(true); setContents(''); setError('');
    fetchPublicFile(snapshot.repo, selected, controller.signal).then(setContents).catch(e => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'File request failed');
    }).finally(() => { if (!controller.signal.aborted) setFileLoading(false); });
    return () => controller.abort();
  }, [snapshot,selected]);
  function load(e: FormEvent) { e.preventDefault(); setRequestId(n => n+1); }
  return <div className="repo-explorer">
    <h3>Explore public GitHub code</h3>
    <p className="support">Real repository files, read-only. No login, tokens or remote writes. Private repositories are not supported.</p>
    <form className="form repo-load" onSubmit={load}>
      <label>Public repository (owner/repo)
        <input value={repoInput} onChange={e=>setRepoInput(e.target.value)} placeholder="owner/repository" required autoCapitalize="none" spellCheck={false}/>
      </label>
      <button className="primary" type="submit" disabled={loading}>{loading?'Loading…':'Load repository'}</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    {snapshot && <div className="repo-result">
      <div className="repo-meta"><strong>{snapshot.repo.owner}/{snapshot.repo.repo}</strong><span>Public · Read only</span></div>
      <p className="support">Pinned commit: <code>{snapshot.commitSha.slice(0,12)}</code> · {snapshot.entries.length} entries{snapshot.truncated?' · Truncated tree':''}</p>
      {snapshot.truncated && <p className="warning">This repository tree was truncated. Some files may be missing.</p>}
      <label className="repo-search">Filter files <input placeholder="Search filenames" value={filter} onChange={e=>setFilter(e.target.value)}/></label>
      <div className="repo-files" aria-label="Public repository files">{files.map(f=><button key={f.path} className={'repo-file '+(selected?.sha===f.sha?'chosen':'')} onClick={()=>setSelected(f)}>▤ <span>{f.path}</span><small>{typeof f.size==='number'?Math.round(f.size/1024)+' KB':''}</small></button>)}</div>
      {selected && <div className="repo-source"><div className="repo-source-header"><strong>{selected.path}</strong><span>READ ONLY · {selected.sha.slice(0,9)}</span></div>{fileLoading?<p className="support">Loading file…</p>:<pre tabIndex={0}><code>{contents || '(empty file or preview unavailable)'}</code></pre>}</div>}
    </div>}
    <p className="preview-note">This public-file preview is not GitHub sign-in. Private repos, branches, commits, patches and PRs require a later authenticated backend.</p>
  </div>;
}
