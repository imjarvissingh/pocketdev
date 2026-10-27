import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { fetchPublicFile, fetchPublicTree, parsePublicRepo, type GitEntry, type RepoSnapshot } from './github';
import { downloadPatch, getLocalDraft, removeLocalDraft, saveLocalDraft, type DraftKey } from './drafts';
import { checkDraftPatch } from './verification';

export default function GitHubPreview() {
  const [repoInput, setRepoInput] = useState('imjarvissingh/pocketdev');
  const [snapshot, setSnapshot] = useState<RepoSnapshot | null>(null);
  const [selected, setSelected] = useState<GitEntry | null>(null);
  const [contents, setContents] = useState('');
  const [draft, setDraft] = useState('');
  const [draftNotice, setDraftNotice] = useState('');
  const [draftError, setDraftError] = useState('');
  const [checking, setChecking] = useState(false);
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [requestId, setRequestId] = useState(0);
  const files = useMemo(() => snapshot?.entries.filter(e => e.type === 'blob' && e.path.toLowerCase().includes(filter.toLowerCase())).slice(0, 150) ?? [], [snapshot, filter]);
  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();
    setLoading(true); setSnapshot(null); setSelected(null); setContents(''); setDraft(''); setDraftNotice(''); setError('');
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
    setFileLoading(true); setFileLoaded(false); setContents(''); setDraft(''); setDraftError(''); setDraftNotice(''); setVerification(''); setError('');
    fetchPublicFile(snapshot.repo, selected, controller.signal).then(source => {
      setFileLoaded(true); setContents(source);
      const key: DraftKey = { ...snapshot.repo, commitSha: snapshot.commitSha, path: selected.path, blobSha: selected.sha };
      const saved = getLocalDraft(key, localStorage);
      setDraft(saved ?? source);
      if (saved !== null) setDraftNotice('Saved local draft restored for this exact commit.');
    }).catch(e => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'File request failed');
    }).finally(() => { if (!controller.signal.aborted) setFileLoading(false); });
    return () => controller.abort();
  }, [snapshot,selected]);
  function load(e: FormEvent) { e.preventDefault(); setRequestId(n => n+1); }
  function currentKey(): DraftKey | null {
    return snapshot && selected ? { ...snapshot.repo, commitSha: snapshot.commitSha, path: selected.path, blobSha: selected.sha } : null;
  }
  function saveDraft() {
    const key = currentKey(); if (!key) return;
    try { saveLocalDraft(key, draft, localStorage); setDraftError(''); setDraftNotice('Saved only in this browser. Not uploaded or committed.'); }
    catch(e) { setDraftError(e instanceof Error ? e.message : 'Could not save draft'); }
  }
  function discardDraft() {
    const key = currentKey(); if (!key) return;
    removeLocalDraft(key, localStorage); setDraft(contents); setDraftError(''); setDraftNotice('Local draft discarded.');
  }
  async function exportPatch() {
    const key = currentKey(); if (!key || checking) return;
    setChecking(true); setDraftError(''); setVerification('');
    try {
      const checked = await checkDraftPatch(key.path, contents, draft, key.blobSha);
      downloadPatch(key.path, checked.patch);
      setDraftNotice('Patch downloaded locally. No repository modifications.');
      setVerification('Verified original Git blob ' + checked.baseSha.slice(0,12) + ' · +' + checked.linesAdded + ' / -' + checked.linesRemoved + ' lines. ' + checked.note);
    } catch(e) { setDraftError(e instanceof Error ? e.message : 'Could not verify or export patch'); }
    finally { setChecking(false); }
  }
  return <div className="repo-explorer">
    <h3>Explore public GitHub code</h3>
    <p className="support">Read public source at a pinned Git commit, edit a browser-local draft, then export an unverified patch. No login, token, private repository or remote write.</p>
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
      {selected && <div className="repo-source"><div className="repo-source-header"><strong>{selected.path}</strong><span>PINNED · {selected.sha.slice(0,9)}</span></div>{fileLoading?<p className="support">Loading file…</p>:!fileLoaded?<p className="support">File not available for editing. Select another supported text file.</p>:<div className="draft-workspace"><p className="support">Local draft editor · changes stay on this device. Do not enter secrets or confidential code.</p><label htmlFor="draft-editor" className="repo-search">Edit draft (plain text)</label><textarea id="draft-editor" aria-label="Local code draft" spellCheck={false} value={draft} onChange={e=>{setDraft(e.target.value);setDraftNotice('');setVerification('');}} rows={13}/><p className="draft-status">{draft===contents?'Unchanged from pinned Git blob':'Unsaved changes relative to pinned Git blob'} · SHA {snapshot.commitSha.slice(0,12)}</p>{draftError && <p className="error" role="alert">{draftError}</p>}{draftNotice && <p className="support" role="status">{draftNotice}</p>}{verification && <p className="support" role="status">{verification}</p>}<div className="draft-actions"><button className="secondary" type="button" onClick={saveDraft}>Save local draft</button><button className="secondary" type="button" onClick={discardDraft}>Discard draft</button><button className="primary" type="button" disabled={draft===contents || checking} onClick={exportPatch}>{checking?'Checking…':'Verify source & export .patch'}</button></div><details><summary>View original read-only file</summary><pre tabIndex={0}><code>{contents || '(empty file)'}</code></pre></details><p className="preview-note">Exported patches are unverified and are never applied to GitHub automatically.</p></div>}</div>}
    </div>}
    <p className="preview-note">This is not GitHub sign-in. Private repositories, authorized commits and PRs require a reviewed backend. Drafts are stored in browser localStorage; clearing browser data deletes them. Exported patches are not validation or approval.</p>
  </div>;
}
