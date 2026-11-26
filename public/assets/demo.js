(() => {
  const bench = document.querySelector('.workbench-section');
  if (!bench) return;
  const get = id => document.getElementById(id);
  const main = get('case-main');
  const panel = get('source-panel');
  const queue = get('queue');
  const feedback = get('workbench-status');
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey = 'circuitdatum-demo-v1';
  const event = action => window.cdTrack?.('reviewer_interaction', {action});
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {} };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
  const titles = ['Pin 4 function mismatch','Solder-mask clearance','Missing latch dimension'];
  const mark = 'DEMO · SIMULATED DATA';
  const content = {
    'CD-019': {title:'Connector mismatch', pending:'awaiting', initial:'Awaiting reviewer'},
    'CD-020': {title:'Missing evidence', pending:'needs-evidence', initial:'Needs evidence'}
  };
  let data, record, mode = 'overlay', confirm = false, openingButton = '', helpful = false;
  const state = c => saved[c.id]?.decision || content[c.id].pending;
  const label = c => ({rejected:'Rejected for Rev D',open:'Left open',awaiting:'Awaiting reviewer','needs-evidence':'Needs evidence'}[state(c)]);
  function renderQueue() {
    const filter = get('queue-filter').value;
    const cases = data.cases.filter(c => filter==='all'||state(c)===filter||(filter==='needs-evidence'&&c.id==='CD-020'&&state(c)==='open'));
    queue.innerHTML = cases.length ? cases.map(c => `<a href="/demo/cases/${c.id}/" ${c.id===record.id?'aria-current="page"':''}>
      <b>${c.id}</b><strong>${content[c.id].title}</strong><span>${safe(c.board_revision)} · ${safe(c.designator)} · ${safe(c.review.assigned_name)}</span><em>${label(c)}</em></a>`).join('') : '<p>No cases in this state.</p>';
  }
  const tabLabels = {'approved':'Approved part','candidate':'Candidate','overlay':'Overlay','rules':'Board limits'};
  function renderDiagram() {
    const f = get('comparison');
    f.dataset.mode = mode;
    const selected = mode === 'approved' ? record.approved_part : mode === 'candidate' ? record.candidate_part : mode === 'rules' ? record.board_revision : `${record.approved_part} and ${record.candidate_part}`;
    const source = record.id==='CD-020' ? '1.80 mm board limit · Candidate maximum missing' :
       ({approved:'Pin 4 ENABLE · Recommended opening 3.00 mm',candidate:'Pin 4 FAULT_N · Recommended opening 3.40 mm',overlay:'Pin 4 ENABLE → FAULT_N · Mask opening +0.20 mm',rules:'J14.4 routes to ENABLE · 3.20 mm mask opening limit'}[mode]);
    f.innerHTML = `<p class="kicker">${safe(record.board)} ${safe(record.board_revision)} · ${record.designator}</p><strong>${safe(selected)}</strong><div class="map-pads">${[1,2,3,4,5,6].map(i=>`<i class="${i===4&&record.id==='CD-019'&&mode!=='approved'?'hot':''}"><span>${i}</span></i>`).join('')}</div><span class="comparison-note">${source}</span>`;
    main.querySelectorAll('[data-compare]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.compare===mode)));
  }
  function render() {
    renderQueue();
    const current = state(record);
    const rejected = current==='rejected', open = current==='open';
    const unresolved = record.id==='CD-020';
    const findings = record.findings.map((finding,index)=>`<article class="finding-row"><h3>${titles[unresolved?2:index]}</h3>
      <p>${safe(finding.proposed_observation)}</p>${finding.unresolved_gap?`<p><b>Unresolved</b> ${safe(finding.unresolved_gap)}</p>`:''}
      <div class="source-buttons">${finding.source_references.map((r,idx)=>`<button type="button" class="small-button" id="ref-${index}-${idx}" data-source="${index}:${idx}">${idx===2||r.id.startsWith('BRD')?'Board rule':idx===0&&record.id!=='CD-020'?'Approved datasheet':'Candidate datasheet'}</button>`).join('')}</div></article>`).join('');
    const action = rejected ? 'Preserve the record and share the revision-specific rejection in your existing sourcing workflow.' :
      unresolved ? 'Library owner requests an authorized drawing with maximum rear latch overhang.' : 'Review both source-linked findings before recording a decision.';
    main.innerHTML = `<div class="case-heading"><p class="kicker">${record.id} · MX6-SMT</p><h2>${content[record.id].title}</h2><p>${record.board} ${record.board_revision} at ${record.designator} · ${record.approved_part} vs ${record.candidate_part}</p></div>
      <div class="comparison-tabs" role="group" aria-label="Footprint view">${Object.entries(tabLabels).map(([key,title])=>`<button type="button" data-compare="${key}" aria-pressed="false">${title}</button>`).join('')}</div>
      <div id="comparison" class="comparison"></div>${findings}
      <div class="decision-box"><p class="kicker">Engineering review · ${mark}</p><h3>${label(record)}</h3>
      <p>${record.review.assigned_name} · ${record.review.role}</p><p>${action}</p>
      <div class="actions">${!rejected&&!open?(!unresolved?`<button class="button dark-button" type="button" data-action="request-rejection"><span class="tool-icon" data-icon="clipboard-text" aria-hidden="true"></span>Record rejection</button>`:'')+
        `<button class="button outline" type="button" data-action="open">Leave open</button>`:''}
      ${unresolved?`<button class="button outline" type="button" data-action="request-source">${saved[record.id]?.requestedAt?'Drawing request recorded':'Record drawing request'}</button>`:''}</div>
      ${confirm?`<div class="confirm"><p>Reject ${record.candidate_part} for ${record.board} ${record.board_revision} at ${record.designator} on both findings?</p><button class="button dark-button" type="button" data-action="reject">Confirm rejection</button> <button class="small-button" type="button" data-action="cancel">Cancel</button></div>`:''}
      ${saved[record.id]?.at?`<p class="history">Latest review · ${new Date(saved[record.id].at).toLocaleString()}</p>`:''}
      <details class="export-summary" ${helpful?'open':''}><summary>View export summary</summary><p>${mark} · ${label(record)} · ${record.review.scope}</p><button type="button" class="small-button" data-action="export"><span class="tool-icon" data-icon="download-simple" aria-hidden="true"></span>Download example record</button></details>
      </div>`;
    renderDiagram();
  }
  function openSource(button) {
    const [f,r] = button.dataset.source.split(':').map(Number);
    const ref = record.findings[f].source_references[r];
    const source = data.sources.find(s => s.id===ref.id);
    openingButton = button.id;
    panel.innerHTML = `<p class="kicker">${mark}</p><h2 id="source-heading" tabindex="-1">Source evidence</h2><b>${safe(source.title)}</b><p class="source-meta">${safe(source.id)} · ${safe(source.version)} · ${safe(source.version_date)}</p><p>${safe(ref.locator)}</p><blockquote>${safe(ref.excerpt)}</blockquote><button class="small-button" type="button" id="close-source"><span class="tool-icon" data-icon="arrow-left" aria-hidden="true"></span>Back to finding</button>`;
    get('source-heading').focus({preventScroll:true});
    if(matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({behavior:'instant',block:'start'});
    event('open-source');
  }
  panel.addEventListener('click',e=>{
    if(!e.target.closest('#close-source')) return;
    panel.innerHTML = '<h2 id="source-heading" tabindex="-1">Source evidence</h2><p>Open a source beside a finding to inspect its version, locator and excerpt.</p>';
    get(openingButton)?.focus();
  });
  function exportRecord() {
    const item = structuredClone(record);
    const current=state(record), resolved=current==='rejected';
    const action = saved[record.id] || {};
    const now = new Date().toISOString();
    item.review.decision = resolved ? 'rejected' : current==='awaiting' ? 'awaiting' : 'open';
    item.review.display_label = label(record);
    item.review.decision_at = action.at || null;
    item.review.reason = resolved ? 'Pin function and solder-mask clearance conflicts' : record.id==='CD-020' ? 'Latch overhang value is missing' : 'Awaiting engineering review';
    item.review.history = [{at:item.created_at,state:content[record.id].pending},...(action.at?[{at:action.at,state:current,actor:item.review.assigned_name}]:[])];
    item.findings.forEach(f=>{if(!f.unresolved_gap) f.disposition = resolved?'confirmed':'proposed'});
    item.handoff.export_status = 'example-downloaded';
    item.handoff.exported_at = now;
    if(record.id==='CD-019'&&!resolved) item.handoff.next_action = 'Review the findings and record the engineering disposition.';
    if(action.requestedAt) item.handoff.drawing_requested_at = action.requestedAt;
    const refs = new Set(item.findings.flatMap(f=>f.source_references.map(r=>r.id)));
    window.cdDownload(`circuitdatum-${item.id.toLowerCase()}-simulated.json`,{schema_version:data.schema_version,dataset_type:'fictional',watermark:mark,exported_at:now,sources:data.sources.filter(s=>refs.has(s.id)),cases:[item]});
    feedback.innerHTML = 'Example downloaded. <a href="/pilot/">Request a paid evaluation</a>';
    event('export');
  }
  get('queue-filter').addEventListener('change',()=>data&&renderQueue());
  get('reset-demo').addEventListener('click',()=>{if(!data)return;saved={};persist();confirm=false;helpful=false;render();feedback.textContent='Demo decisions reset.';event('reset')});
  main.addEventListener('click',e=>{
    const button=e.target.closest('button');
    if(!button||!record)return;
    if(button.dataset.compare){mode=button.dataset.compare;renderDiagram();event('compare');return;}
    if(button.dataset.source){openSource(button);return;}
    const action=button.dataset.action;
    if(action==='export'){exportRecord();return;}
    if(action==='request-rejection'||action==='cancel'){
      confirm=action==='request-rejection';render();main.querySelector(`[data-action="${confirm?'reject':'request-rejection'}"]`)?.focus();return;
    }
    if(!['reject','open','request-source'].includes(action))return;
    const at=new Date().toISOString();
    saved[record.id]={...saved[record.id],...(action==='request-source'?{requestedAt:at}:{decision:action==='reject'?'rejected':'open',at})};
    persist();confirm=false;helpful=true;render();
    main.querySelector('.export-summary summary')?.focus();
    feedback.textContent = action==='request-source' ? 'Drawing request recorded locally in the simulation.' : action==='reject' ? 'Revision-specific rejection recorded locally.' : 'Case left open locally.';
    event(action);
  });
  fetch('/assets/example.json').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(result=>{
    data=result;record=data.cases.find(c=>c.id===bench.dataset.case);
    render();window.cdTrack?.('demo_start',{entry:location.pathname==='/demo/'?'demo':'case'});
  }).catch(()=>{main.innerHTML='<p>Could not load the case. Try refreshing or <a href="/assets/example.json">download the example record</a>.</p>'});
})();
