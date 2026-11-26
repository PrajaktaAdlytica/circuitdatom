from pathlib import Path
import html, json

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
E=html.escape
D='/demo/'
P='/pilot/'
DEMO='DEMO · SIMULATED DATA'
MODULES=[
 ('datasheet-intake','Datasheet Intake','Every extracted detail should lead back to its source.','Turn licensed replacement-part datasheets into cited pin functions, package dimensions and tolerances.','Approved datasheet set','Licensed PDFs, source versions and approved library references.','Open extracted fields alongside their table or drawing. Check them and keep missing values visible.','Versioned source set with reviewer corrections and unresolved fields.','Component engineers check the values. Data owners authorize access.'),
 ('component-fit-review','Component Fit Review','Put the replacement against the actual board revision.','Compare an alternate with the released part and board revision. Surface possible pin, pad and clearance mismatches.','First paid evaluation','A candidate, approved part, authorized design library and exact board revision.','Compare pin mapping, pad geometry and solder-mask clearance. Open the cited pin tables or board rule.','Revision-scoped decision with findings and attached source references.','Component engineers review fit. Design owners control release.'),
 ('qualification-pack','Qualification Pack','Give reviewers the evidence behind the decision.','Carry reviewed evidence, open questions and an engineer’s decision into one versioned qualification record.','Engineering qualification record','A reviewed comparison, authorized sources and the team’s checklist.','Check source dates, assigned owners and unresolved items. Review decision history before export.','An exportable handoff record with the decision and remaining evidence gaps.','The named reviewer records the decision. Engineering authorizes release.'),
 ('component-change-monitor','Component Change Monitor','See which reviewed alternates a source change could affect.','Compare documentation versions and route affected replacement relationships for review.','Component change review period','New and prior source versions, documented alternates and a review period.','Inspect before and after values, match affected relationships and assign review.','A proposed change review with affected revisions and a next action.','The library manager validates the relationship and assigns review.'),
]
M={m[0]:m for m in MODULES}
USES=[
 ('oem','Industrial electronics OEM','Check an alternate before the next board release.','Begin with one released controller board and its approved component record. Replay a closed family of decisions.','component-fit-review'),
 ('manufacturer','Contract electronics manufacturer','Give the customer the evidence behind a substitute.','Use authorized customer records to prepare cited findings, open items and named sign-off.','qualification-pack'),
 ('library','ECAD library operations','See which reviewed alternates need a second look.','Trace a changed datasheet to affected relationships and assign follow-up.','component-change-monitor'),
]
FAQ=[
 ('Where does the candidate come from?','Use your current cross-reference, distributor or procurement process. You supply the candidates for the pilot.'),
 ('What can the public demo do?','Inspect fictional sources, record a simulated rejection or leave a case open, and export a fictional record.'),
 ('Who signs off on a real part?','Your authorized engineer owns qualification and release. Your library owner controls changes to released libraries.'),
 ('What if evidence is incomplete?','The review names the missing item, its owner and next action. The case can remain open.'),
 ('What files should we prepare?','Licensed datasheets, authorized board and library revisions, and prior decisions in one component family. Agree how to exchange them before sharing.'),
 ('How much does the evaluation cost?','The evaluation is scoped and quoted during discovery. The proposed annual team license is $60,000 with part-library tiers.'),
]
def product(s): return '/products/'+s+'/'
MODULE_ICONS = {
    'datasheet-intake':'file-search', 'component-fit-review':'crosshair',
    'qualification-pack':'clipboard-text', 'component-change-monitor':'clock-counter-clockwise',
    'permission':'plugs-connected'
}
def icon(name):
    return f'<span class="tool-icon" data-icon="{name}" aria-hidden="true"></span>'

def link_icon(url):
    route=url.split('?')[0].split('#')[0]
    return {
        '/pilot/':'flask', '/demo/':'crosshair', '/platform/':'stack', '/pricing/':'ruler',
        '/integrations/':'plugs-connected', '/trust/':'shield-check', '/contact/':'envelope-simple',
        '/resources/':'books', '/sign-in/':'sign-in',
    }.get(route, 'download-simple' if route.startswith('/assets/') else
          MODULE_ICONS.get(route.strip('/').split('/')[-1],'arrow-right'))

def a(url,label,kind='text'):
    glyph = icon(link_icon(url)) if 'button' in kind else ''
    return f'<a class="{kind}" href="{url}"{" data-pilot-cta" if url==P else ""}>{glyph}<span>{label}</span></a>'
def pair(first,second): return f'<div class="actions">{a(*first,"button primary")}{a(*second,"button outline")}</div>'
def brand():
    return '<a class="brand" href="/" aria-label="CircuitDatum home"><img alt="" src="/assets/brand/circuitdatum-logo-detail.svg" width="298" height="64"></a>'

def navigation():
    mods=''.join(f'<a href="{product(m[0])}"><b>{icon(MODULE_ICONS[m[0]])}{m[1]}</b><small>{m[4]}</small></a>' for m in MODULES)
    return f'''<header class="site-header"><div class="nav-inner">{brand()}
    <button id="menu-toggle" aria-expanded="false" aria-controls="site-nav">{icon('list')}Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main navigation">
    <details><summary>{icon('stack')}Platform</summary><div class="dropdown">{a('/platform/','Platform overview')}{mods}</div></details>
    <details><summary>{icon('briefcase')}Use cases</summary><div class="dropdown">{a('/use-cases/','All use cases')}{''.join(a('/use-cases/#'+u[0],u[1]) for u in USES)}</div></details>
    {a(D,icon('crosshair')+'Demo','text nav-link')}<details><summary>{icon('books')}Resources</summary><div class="dropdown">{a('/resources/','Resource library')}{a('/resources/#example','Annotated record')}{a('/resources/#scorecard','Evaluation scorecard')}{a('/trust/','Trust and permissions')}{a('/sources/','Sources')}</div></details>
    {a('/pricing/',icon('ruler')+'Pricing','text nav-link')}{a('/sign-in/','Sign in','mobile-only')}{a(P,'Request a paid evaluation','mobile-only button primary')}</nav>
    <div class="nav-actions">{a('/sign-in/','Sign in')}{a(P,'Request a paid evaluation','button primary')}</div></div></header>'''
def footer():
    marks={'Products':'cpu','Explore':'crosshair','Resources':'books','Company':'briefcase','Trust':'shield-check'}
    groups=[
     ('Products',[(product(m[0]),m[1]) for m in MODULES]),
     ('Explore',[('/platform/','Platform'),('/use-cases/','Use cases'),('/integrations/','Integrations'),(D,'Fictional demo')]),
     ('Resources',[('/resources/','Resource library'),('/resources/#scorecard','Evaluation scorecard'),('/sources/','Sources'),('/pricing/','Pricing')]),
     ('Company',[('/about/','About'),('/contact/','Contact'),(P,'Paid evaluation'),('/sign-in/','Sign in')]),
     ('Trust',[('/trust/','Trust and permissions'),('/privacy/','Privacy'),('/terms/','Terms')])]
    return f'''<footer class="footer" data-environment="terminal"><div class="wrap"><div class="footer-head">{brand()}<span>Board-level evidence for component engineering.</span></div>
    <div class="footer-grid">{''.join(f'<div><h2>{icon(marks[name])}{name}</h2>{"".join(a(u,t) for u,t in links)}</div>' for name,links in groups)}</div>
    <div class="footer-base"><span>© CircuitDatum</span><span>Research-stage product concept</span><button id="motion-switch" type="button" aria-pressed="false">{icon('sliders-horizontal')}<span data-label>Reduce motion</span></button></div></div></footer>'''
def page(path,title,description,body,ident='',hero=False,workbench=False):
    dest=PUBLIC/path.strip('/')
    dest.mkdir(parents=True,exist_ok=True)
    (dest/'index.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{E(description,quote=True)}">
    <meta name="theme-color" content="#0b1515">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/favicon-96.png">
    <link rel="icon" type="image/svg+xml" sizes="any" href="/assets/brand/favicon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png">
    <link rel="preload" href="/assets/manrope.woff2" as="font" crossorigin type="font/woff2"><link rel="stylesheet" href="/assets/site.css">
    <title>{E(title)} — CircuitDatum</title><script defer src="/assets/vendor/gsap.min.js"></script><script defer src="/assets/vendor/ScrollTrigger.min.js"></script>
    <script defer src="/assets/vendor/lenis.min.js"></script><script defer src="/assets/site.js"></script>
    {'<script defer src="/assets/hero.js"></script>' if hero else ''}
    {'<script defer src="/assets/demo.js"></script>' if workbench else ''}
    </head><body data-page="{ident}"><a class="skip" href="#content">Skip to content</a>{navigation()}
    <main id="content">{body}</main>{footer()}</body></html>''')
def heading(k,t,d='',direction='up'):
    return f'<div class="section-heading" data-reveal="{direction}"><p class="kicker">{k}</p><h2>{t}</h2>{f"<p>{d}</p>" if d else ""}</div>'
def art(name,kind=''):
    visuals={
     'datasheet-intake':'<div class="paper-doc"><small>DS-ALT-C6 · REV 2</small><strong>Pin assignment</strong><div>Position <span>Function</span></div><div class="focus">04 <span>FAULT_N</span></div><small>p. 3 · table 2 · row 4</small></div><span class="art-tag">Source linked</span>',
     'component-fit-review':'<div class="padmap"><small>J14 / ORB-240 REV D</small><div class="map-pads"><i></i><i></i><i></i><i class="hot"></i><i></i><i></i></div><div class="map-value">PIN 4 <span>ENABLE → FAULT_N</span></div></div>',
     'qualification-pack':'<div class="pack-doc"><small>CD-019 · QUALIFICATION RECORD</small><strong>Engineering disposition</strong><div><i></i> Pin 4 functions compared</div><div><i></i> Solder-mask rule reviewed</div><b>Rejected for Rev D</b></div>',
     'component-change-monitor':'<div class="revision-map"><small>PACKAGE DRAWING</small><div><b>Rev 2</b><i></i><b>Rev 3</b></div><div class="revision-branch">Review alternate relationship</div><small>Assigned to library manager</small></div>',
     'permission':'<div class="revision-map"><small>AUTHORIZED FILE EXCHANGE</small><div><b>Candidate</b><i></i><b>Board data</b></div><div class="revision-branch">Scoped engineering review</div><small>Named data and engineering owners</small></div>',
    }
    title=M[name][1] if name in M else 'Authorized data exchange'
    return f'<div class="artifact {name} {kind}" role="img" aria-label="{title} visual">{visuals[name]}</div>'
def offers():
    return '<div class="offer-grid">'+''.join(f'''<a class="offer" href="{product(m[0])}" data-reveal="{d}">{art(m[0])}
    <div class="offer-body"><p class="kicker">{icon(MODULE_ICONS[m[0]])}{m[4]}</p><h3>{m[1]}</h3><p>{m[3]}</p><span class="text offer-action">Explore {m[1]}{icon('arrow-right')}</span></div></a>''' for d,m in zip(['left','right','left','right'],[MODULES[1],MODULES[0],MODULES[2],MODULES[3]]))+'</div>'
def faq(items=FAQ): return '<div class="faq">'+''.join(f'<details><summary>{q}</summary><p>{v}</p></details>' for q,v in items)+'</div>'
def close(title='Bring one replacement decision your team already made.',desc='Tell us what you were replacing, which board revision mattered and who owned the review.'):
    return f'<section class="close-block dark" data-environment="closing"><div class="wrap" data-reveal="up"><p class="kicker">Component Fit Review pilot</p><h2>{title}</h2><p>{desc}</p>{pair((P,"Request a paid evaluation"),("/contact/","Contact CircuitDatum"))}</div></section>'
def hero(k,t,d,visual,actions='',theme='dark'):
    scene = {'Datasheet Intake':'solder', 'Qualification Pack':'optic',
             'Component Change Monitor':'terminal', 'Component Fit Review':'graphite',
             'Paid pilot':'graphite', 'Company':'closing', 'Pricing':'ledger',
             'Use cases':'optic', 'Trust and permissions':'terminal'}.get(k,'inspection')
    return f'<section class="page-hero {theme}" data-environment="{scene}"><div class="wrap split"><div data-reveal="left"><p class="kicker">{k}</p><h1>{t}</h1><p class="lede">{d}</p>{actions}</div><div data-reveal="right">{visual}</div></div></section>'
def map_rows(labels):
    symbols = ('file-search', 'crosshair', 'clipboard-text')
    return '<div class="workflow-map" data-reveal="right" role="list">'+''.join(
        f'<div class="workflow-row" role="listitem"><span class="workflow-node">{icon(symbols[i % len(symbols)])}</span><div><b>{t}</b><small>{d}</small></div></div>'
        for i,(t,d) in enumerate(labels))+'</div>'
FLOW=[('Candidate and approved part','Cross-reference and authorized source set'),('Source-linked comparison','Pin table, pad geometry and verified board revision'),('Engineering decision','Named reviewer and versioned disposition')]
def preview():
    return f'''<div class="example-panel" data-reveal="up"><div class="example-head"><b>Component Fit Review</b><span>{DEMO}</span></div><div class="example-body">
    <div class="example-queue"><small>CASE QUEUE</small><span><b>CD-019</b> · J14 <em>Two findings</em></span><span><b>CD-020</b> · J22 <em>Needs evidence</em></span></div>
    <div class="example-inspection">{art('component-fit-review')}<div class="example-rule"><span>{icon('ruler')}Mask opening</span><b>3.40 mm <span>/ 3.20 mm max</span></b></div></div>
    <div class="example-source"><div class="example-citation"><small>DS-ALT-C6 · REV 2</small><b>Pin 4 · FAULT_N</b><p>15 Oct 2026 · p. 3 · table 2</p></div><div class="example-disposition"><small>ENGINEERING DISPOSITION</small><b>{icon('clipboard-text')}Rejected for Rev D</b></div></div></div></div>'''
def use_cards(horizontal=False):
    return f'<div class="{"use-track" if horizontal else "use-grid"}">'+''.join(f'''<article class="use-card" id="{u[0]}">{art(u[4])}<div><p class="kicker">{icon(MODULE_ICONS[u[4]])}{u[1]}</p><h3>{u[2]}</h3><p>{u[3]}</p>{a(product(u[4]),"Explore "+M[u[4]][1])}</div></article>''' for u in USES)+'</div>'
def full_home():
    film=f'''<section class="film" id="cinema" data-environment="film" aria-label="3D replacement fit walkthrough"><div class="stage" data-step="0">
    <div class="hero-content"><p class="kicker">Component Fit Review</p><h1>Verify a replacement component<br> against the board it must fit.</h1><p>Source-linked checks for electronics OEMs and contract manufacturers.</p></div>
    <div class="theater"><connector-model id="model" role="img" aria-label="Live 3D illustration of a six-contact connector and board"><p class="model-fallback">3D rendering is unavailable. The annotated findings and demo remain available.</p></connector-model>
    <div class="marker" hidden aria-hidden="true"></div><div class="finding" id="film-finding"><p class="kicker" id="finding-label">ORB-240 REV D · J14</p><b id="finding-value">Same package code</b><p id="finding-detail">See where the alternate differs.</p></div></div>
    <div class="film-footer"><div class="film-meta"><span>{DEMO}</span><span id="scene-caption">Inspect the replacement</span></div>
    {pair((D,'Explore the fictional demo'),(P,'Request a paid evaluation'))}
    <div class="film-controls"><button id="play" type="button">{icon('pause')}<span data-label>Pause</span></button><div class="track" aria-hidden="true"><div id="track-fill"></div></div><a href="#problem" id="skip-intro">{icon('arrow-down')}Skip intro</a></div>
    <nav class="chapters" aria-label="Assembly chapters">{''.join(f'<button type="button" data-chapter="{i}">{icon(symbol)}<span>{name}</span></button>' for i,(name,symbol) in enumerate([('Approach','cpu'),('Separate','stack'),('Pin 4','crosshair'),('Clearance','ruler'),('Review','clipboard-text')]))}</nav></div></div></section>'''
    body=film+f'''
    <section class="section wrap split" id="problem" data-environment="bench">{heading('The substitution problem','Same package code. Different fit.','Replacement parts can share a package code and still route signals differently or exceed what the board allows. A mistaken substitution can delay a release or trigger a redesign.','left')}
    <figure class="photo-frame inspection-visual" data-reveal="right">
      <div class="inspection-image"><img src="/assets/board-macro.jpg" alt="Illustrative six-contact connector on an electronics inspection bench" loading="lazy">
        <span class="inspection-reticle" aria-hidden="true"></span><span class="inspection-scan" aria-hidden="true"></span>
        <div class="inspection-tag"><small>{icon('crosshair')} J14 · PIN 4</small><b>ENABLE <span>→</span> FAULT_N</b></div>
      </div><figcaption><span>ILLUSTRATIVE CONNECTOR</span><span>ORB-240 REV D</span></figcaption>
    </figure>
    <div class="fact-strip inspection-facts">
      <div><span class="fact-icon">{icon('crosshair')}</span><b>Pin functions</b><span>The same position can carry a different signal.</span></div>
      <div><span class="fact-icon">{icon('ruler')}</span><b>Footprint and clearance</b><span>Pads, mask and enclosure geometry affect the design.</span></div>
      <div><span class="fact-icon">{icon('stack')}</span><b>Board revision</b><span>Bind every finding to the exact design.</span></div>
    </div></section>
    <section class="section tint" data-environment="routing"><div class="wrap split">{heading('Workflow','Start with the candidate your team already found.','CircuitDatum proposes checks against the authorized library and board revision. The reviewer checks the evidence and records the disposition.','left')}{map_rows(FLOW)}<div>{a('/integrations/','See where CircuitDatum fits')}</div></div></section>
    <section class="section wrap" id="products" data-environment="vellum">{heading('Proposed product suite','Four products for one qualification workflow.','From licensed sources to engineering review and change follow-up.')}{offers()}</section>
    <section class="section dark" data-environment="graphite"><div class="wrap">{heading('The workbench','See what an engineer would reject.','One fictional connector changes Pin 4 and exceeds the solder-mask opening allowed on ORB-240 Rev D.')}{preview()}<div class="actions">{a(D,'Open the case workbench','button primary')}{a('/resources/#example','View the annotated example','button outline')}</div></div></section>
    <section class="section wrap split" data-environment="authority">{heading('Review authority','Every finding has a source and an owner.','AI proposes values and cites a table or drawing. The engineer checks the original evidence, reviews the board constraint and owns qualification and release.','left')}<div data-reveal="right">{art('qualification-pack')}</div><div>{a('/trust/','See review and data controls')}</div></section>
    <section class="section use-section tint" data-environment="stations"><div class="wrap">{heading('Use cases','Start where substitution decisions already happen.','See the workflow from the board owner, manufacturing partner and ECAD library team.')}<div class="use-controls"><button type="button" data-carousel="previous">{icon('arrow-left')}Previous</button><button type="button" data-carousel="next">Next{icon('arrow-right')}</button><span class="use-progress" aria-hidden="true"></span></div></div><div class="use-window" role="region" aria-label="Use-case cards" tabindex="0">{use_cards(True)}</div><div class="wrap section-link">{a('/use-cases/','Explore all use cases')}</div></section>
    <section class="section wrap split" data-environment="schematic">{heading('Integration and permissions','Work alongside sourcing and ECAD.','Start with authorized files for one family. Agree on data format, rights and transfer during scoping.','left')}<div data-reveal="right">{art('permission')}</div><div class="actions">{a('/integrations/','Explore integration scope','button outline')}{a('/trust/','Review data requirements')}</div></section>
    <section class="section tint" data-environment="copper"><div class="wrap split">{heading('Illustrative review prompts','The questions we want engineering leads to answer.','Customer feedback pending. The fictional record helps us ask how teams handle alternates today.','left')}<div class="feedback" data-reveal="down"><p>Where do you reopen a datasheet after a cross-reference?</p><p>Which board constraint is hardest to verify?</p><p>Would this record support the engineering handoff?</p>{a('/contact/?interest=feedback','Give feedback on the example')}</div></div></section>
    <section class="section wrap split" data-environment="protocol">{heading('Paid evaluation','Replay one component family against your current process.','Bring licensed datasheets, an authorized board library and closed cases. Compare up to 100 candidates against your existing review process.','left')}<div class="score-preview" data-reveal="right"><p class="kicker">Evaluation scorecard</p><b>Missed board-specific discrepancies</b><b>False compatibility suggestions</b><b>Engineer minutes</b>{a('/assets/scorecard.xlsx','Download the scorecard')}</div><div>{a(P,'Request a paid evaluation','button dark-button')}</div></section>
    <section class="section dark" data-environment="ledger"><div class="wrap">{heading('Pricing','Start with a scoped evaluation.')}<div class="pricing-grid" data-reveal="up"><article><p class="kicker">Component Fit Review</p><h3>Quoted after scoping</h3><p>One family, an agreed baseline, and a reviewer readout.</p></article><article><p class="kicker">Annual team license hypothesis</p><h3>$60,000 <small>/ year</small></h3><p>Proposed part-library tiers and individually scoped implementation.</p></article></div><div class="section-link">{a('/pricing/','See pricing and scope','button outline')}</div></div></section>
    <section class="section wrap split" data-environment="appendix">{heading('Questions','What to know before an evaluation.','Start with a candidate and a specific engineering decision.','left')}{faq()}</section>{close()}'''
    page('/','Board-level replacement verification','Source-linked component replacement review against an exact board revision.',body,'home',True)
def products():
    for i,(slug,name,title,summary,unit,inputs,workflow,outcome,owner) in enumerate(MODULES):
        nxt=MODULES[(i+1)%4]
        body=hero(name,title,summary,art(slug),pair((D,'Inspect the fictional case'),(P,'Discuss evaluation scope')))
        body+=f'''<section class="section wrap split" data-environment="vellum">{heading('Review workflow',unit,workflow,'left')}<div data-reveal="right">{art(slug)}<p class="caption">{DEMO}</p></div>
        <div class="fact-strip"><div><b>Inputs</b><span>{inputs}</span></div><div><b>Output</b><span>{outcome}</span></div><div><b>Accountable owner</b><span>{owner}</span></div></div></section>
        <section class="section tint" data-environment="schematic"><div class="wrap split">{heading('Evidence and exceptions','Keep open questions in the record.','Inputs, transfer, retention and reviewer roles are agreed during pilot scoping.','left')}{faq([('What if evidence is incomplete?',FAQ[3][1]),FAQ[2]])}</div></section>
        <section class="section wrap split" data-environment="routing">{heading('Next in the workflow',nxt[1],nxt[3],'left')}<a class="offer" href="{product(nxt[0])}">{art(nxt[0])}<div class="offer-body">Explore {nxt[1]}</div></a></section>{close()}'''
        page(product(slug),name,summary,body,slug)

def field(label,name,options=None,kind='text',required=True,maximum=120):
    req=' required' if required else ''
    if options:
        options=''.join(f'<option value="{E(key,quote=True)}">{E(title)}</option>' for key,title in options)
        widget=f'<select name="{name}"{req}><option value="">Choose an option</option>{options}</select>'
    elif kind=='textarea':
        widget=f'<textarea name="{name}" maxlength="{maximum}" rows="4"{req}></textarea>'
    else:
        widget=f'<input name="{name}" type="{kind}" maxlength="{maximum}"{req}>'
    return f'<label>{label}{widget}</label>'

INTEREST=[('pilot','Paid evaluation'),('demo','Guided demo'),('partner','ECAD or procurement partnership'),('feedback','Example feedback'),('other','Other inquiry')]
ORGS=[('oem','Industrial electronics OEM'),('ems','Contract electronics manufacturer'),('library','ECAD library or design team'),('other','Other')]
ACCESS=[('unknown','Unknown'),('required','Permission required'),('in-progress','Permission in progress'),('authorized','Authorized for scoping')]
def form(mode):
    pilot=mode=='pilot'
    primary=field('Full name','name')+field('Work email','email',kind='email',maximum=160)+field('Role','role')+field('Organization','organization')
    if pilot:
        primary+=field('Organization type','organizationType',ORGS)+field('Primary interest','interest',[INTEREST[0],INTEREST[1],('license','Annual engineering team license')])
        primary+=field('Component family','family')+field('Candidate volume','volume',[('1-25','1–25'),('26-50','26–50'),('51-100','51–100'),('more','More than 100')])
        primary+=field('Current review workflow','workflow',kind='textarea',maximum=900)+field('Data readiness','readiness',ACCESS)
        optional=field('Budget owner role','budgetOwner',required=False)+field('Reviewer role','reviewer',required=False)+field('Integration owner','integrationOwner',required=False)+field('Desired timing','timing',required=False)+field('Baseline notes','notes',kind='textarea',required=False,maximum=900)
        primary+=f'<details class="optional"><summary>Optional scoping details</summary><div class="form-fields">{optional}</div></details>'
    else:
        primary+=field('Primary interest','interest',INTEREST)+field('Short message','message',kind='textarea',maximum=900)
    return f'''<form class="intake-form" data-intake="{mode}"><noscript><p>JavaScript enables local draft preparation.</p></noscript>
      <p class="form-intro">Share business context here. Agree on data access before sharing technical files.</p>
      <div class="form-fields">{primary}</div>
      <fieldset><legend>May we contact you about this request?</legend>
      <label><input name="followUp" type="radio" value="yes" required> Yes</label>
      <label><input name="followUp" type="radio" value="no" required> No</label></fieldset>
      <label class="check"><input name="waitlist" type="checkbox" value="yes"> Email me when early access opens.</label>
      <p class="form-privacy">See the {a('/privacy/','preview privacy notice')}. The preview prepares a local draft for download.</p>
      <div class="actions"><button class="button dark-button" type="button" data-prepare-draft>{icon('clipboard-text')}Prepare {"evaluation request" if pilot else "inquiry"}</button></div>
      <div class="form-result" role="status" hidden></div></form>'''
def scope():
    return '''<div class="scope-card"><p class="kicker">Proposed evaluation scope</p><h3>Component Fit Review</h3>
    <dl><div><dt>Component family</dt><dd>One</dd></div><div><dt>Closed cases</dt><dd>Up to 100</dd></div><div><dt>Evaluation price</dt><dd>Quoted after scoping</dd></div><div><dt>Annual license</dt><dd>$60,000 hypothesis</dd></div><div><dt>Data access</dt><dd>Awaits confirmation</dd></div></dl></div>'''
def doc_sections(rows):
    return '<section class="section wrap doc-body" data-environment="appendix">'+''.join(f'<article data-reveal="up"><h2>{t}</h2><p>{d}</p></article>' for t,d in rows)+'</section>'
def support():
    body=hero('Platform','One engineering record from candidate to reviewed decision.','Connect a versioned source set to board fit review. Carry the disposition into a qualification record and revisit it when source evidence changes.',map_rows(FLOW),pair((D,'Open the demo'),(P,'Request a paid evaluation')))+f'<section class="section wrap">{heading("Product suite","Read, compare, record, revisit.")}{offers()}</section>'+close()
    page('/platform/','Platform','The four proposed products connect replacement engineering evidence.',body,'platform')
    body=hero('Use cases','Review the substitution where its consequences show up.','Scope each review to an approved part, candidate and board revision.',art('component-fit-review'),pair((P,'Review one component family'),(D,'Try the fictional case')))+f'<section class="section wrap">{use_cards()}</section>'+close()
    page('/use-cases/','Use cases','Replacement review for OEMs, manufacturers and ECAD library teams.',body)
    body=hero('Integrations','Bring the candidate and board data your team already uses.','Start with scoped file exchange and agree on the exact permitted format, owner, transfer method and access period.',art('permission'),pair((P,'Discuss integration scope'),('/sources/','See market references')))
    body+=doc_sections([('Candidate intake','A cross-reference or procurement workflow supplies the candidate.'),('Board library','The ECAD owner supplies the authorized library and the verified board revision.'),('Engineering handoff','The reviewer receives the cited record for the existing approval process. Integration formats are evaluated during scoping.')])+close()
    page('/integrations/','Integrations','Proposed handoffs to sourcing, ECAD and engineering review.',body)
    cards=[('example','Annotated Component Fit Review example','Inspect the record with two findings and a named reviewer.','/assets/example.json','Download example JSON','qualification-pack'),
           ('scorecard','Evaluation scorecard','Document the agreed baseline, evaluation measures and decision gate.','/assets/scorecard.xlsx','Download scorecard','datasheet-intake'),
           ('market','Market and demo sources','See the published market references and the fictional source policy.','/sources/','Read sources','component-change-monitor')]
    body=hero('Resources','Take the example into your next engineering review.','Inspect a fictional record or use the scorecard to scope a comparison.',art('qualification-pack'),pair((D,'Open the demo'),(P,'Discuss an evaluation')))
    body+='<section class="section wrap"> <div class="use-grid">'+''.join(f'<article class="use-card" id="{key}" data-reveal="up">{art(v)}<div><h3>{title}</h3><p>{desc}</p>{a(url,cta)}</div></article>' for key,title,desc,url,cta,v in cards)+'</div></section>'
    page('/resources/','Resources','Annotated example, scorecard and primary sources.',body)
    body=hero('Pricing','Price the evaluation around the engineering work.','Start with the fictional walkthrough or scope one paid engineering comparison.',scope(),pair((P,'Request a paid evaluation'),(D,'Open the demo')))
    body+=f'<section class="section wrap">{heading("Engagement options","Compare scope and pricing.")}<div class="pricing-grid pricing-light"><article><p class="kicker">Concept walkthrough</p><h3>Fictional demo</h3><p>Two sample cases, original source excerpts and a sample record.</p>{a(D,"Open the demo")}</article><article><p class="kicker">Paid evaluation</p><h3>Scoped quote</h3><p>One component family, up to 100 candidates, named reviewer and an agreed baseline.</p>{a(P,"Request a paid evaluation")}</article><article><p class="kicker">Annual license hypothesis</p><h3>$60,000 / year</h3><p>Proposed engineering team license. Part-library tiers, implementation and renewal terms are separately scoped.</p>{a("/pilot/?interest=license","Discuss annual scope")}</article></div></section>'
    page('/pricing/','Pricing','Review the quoted evaluation and proposed annual license.',body)
    body=hero('Paid pilot','Compare one component family with your current review process.','Agree on data rights and review responsibilities before replay. Bring licensed datasheets, an authorized board library and closed cases.',scope(),a('#pilot-form','Go to evaluation intake','button primary'))
    body+=f'''<section class="section wrap intake-layout" id="pilot-form" data-environment="protocol"><aside>{heading('Before the pilot','Agree scope and review roles.','Identify the budget owner, data owner and engineering reviewer.')}{map_rows([('Authorize the sources','Licensed datasheets and permitted design library'),('Agree the baseline','Up to 100 closed-case candidate replacements'),('Review the results','Missed discrepancies, false compatibility and engineer minutes')])}<div class="section-link">{a('/assets/scorecard.xlsx','Download the scorecard')}</div></aside>{form('pilot')}</section>'''
    page(P,'Request a paid evaluation','Scope, quote status, permissions and intake for a paid Component Fit Review pilot.',body,'pilot')
    body=hero('Trust and permissions','The evidence is visible. Engineering owns the decision.','Evaluation access starts with licensed documentation, authorized library records and a named reviewer.',map_rows(FLOW),a('/contact/','Discuss data requirements','button primary'))+doc_sections([('Evidence provenance','Retain source ID, revision date, locator, unresolved gap and engineering disposition.'),('Review authority','The engineering owner authorizes qualification and release. The library owner controls changes to design libraries.'),('Data rights','Agree file access, export scope, storage, retention and deletion during pilot scoping.')])
    page('/trust/','Trust and permissions','Review authority, evidence provenance and authorized pilot inputs.',body)
    body=hero('Company','Board-level evidence for replacement-part decisions.','Our mission is to help component engineers make substitution decisions they can explain and review. Component Fit Review is the first proposed paid evaluation.','<figure class="photo-frame"><img src="/assets/board-macro.jpg" alt="Illustrative electronics inspection bench"></figure>',pair(('/contact/','Talk about your workflow'),('/platform/','Explore the platform')))+doc_sections([('The work','Document AI surfaces functions, dimensions and tolerances from authorized sources. The board check puts the candidate against a specific design revision.'),('The team in scope','Component engineers, PCB designers and library managers at industrial OEMs and contract electronics manufacturers.')])
    page('/about/','About','CircuitDatum’s mission and research-stage product focus.',body)
    body=hero('Contact','Talk through a replacement-part workflow.','Reach out about an evaluation, guided demo, potential integration or feedback on the fictional record.',art('permission'),a('#contact-form','Go to contact form','button primary'))
    body+=f'<section class="section wrap intake-layout" id="contact-form"><aside>{heading("Ways to connect","Start with the engineering question.","Share which part, board revision and decision matter for your team.")}{a(D,"Explore the self-guided demo")}</aside>{form("contact")}</section>'
    page('/contact/','Contact','Paid evaluation, guided demo, partner and general inquiries.',body,'contact')
    refs=[
      ('Siemens Valor NPI','https://www.siemens.com/en-us/products/pcb/valor/valor-npi/','PCB manufacturing and component fit context.'),
      ('Siemens alternate component visualization','https://blogs.sw.siemens.com/electronic-systems-design/2025/10/27/valor-npi-2510/','Visual package-to-pad compatibility review.'),
      ('Z2Data Cross References','https://www.z2data.com/products/part-risk-manager/features/cross-references/','Alternate package, pinout and parameter comparison.'),
      ('Altium component validation','https://www.altium.com/documentation/altium-designer/components-libraries/workspace-component-validation','Library validation workflow context.')]
    body=hero('Sources','Market references and demo evidence.','Demo datasheets, board geometry, reviewers and account records are original simulated examples.',art('datasheet-intake'),a(D,'Inspect a fictional source','button primary'))+doc_sections([(name,desc+' '+a(url,'Read primary source')) for name,url,desc in refs])
    page('/sources/','Sources','Published market capabilities and the fictional source policy.',body)
    signin=f'''<form class="intake-form signin-form" data-sign-in aria-label="Workspace sign-in preview">
      <p class="kicker">{icon('sign-in')} Sign-in preview</p>
      <label for="signin-email">Work email</label>
      <input id="signin-email" name="email" type="email" autocomplete="email" maxlength="120" required>
      <button class="button dark-button" type="submit">{icon('arrow-right')}<span>Continue</span></button>
      <p class="signin-status" role="status" hidden>Invited workspace access will be available when sign-in is connected.</p>
    </form>'''
    body=f'''<section class="page-hero signin-page dark" data-environment="inspection">
      <div class="wrap signin-layout">
        <div class="signin-intro" data-reveal="left">
          <p class="kicker">Workspace access</p><h1>Sign in to your review workspace.</h1>
          <p class="lede">Workspace access is by invitation. Enter your work email to continue when your organization has access.</p>
        </div>
        <div class="signin-panel" data-reveal="right">{signin}</div>
        <div class="signin-links" data-reveal="up">
          <a class="signin-link-card" href="{D}">{icon('crosshair')}<span>Open the public demo</span>{icon('arrow-right')}</a>
          <a class="signin-link-card" href="/contact/">{icon('envelope-simple')}<span>Get access help</span>{icon('arrow-right')}</a>
        </div>
      </div>
    </section>'''
    page('/sign-in/','Sign in','Workspace access preview and public demo link.',body,'signin')
    for slug,title,rows in [
      ('privacy','Privacy in this preview',[('Pilot and contact drafts','The packaged preview prepares a downloadable request in your browser. The recipient and live collection provider are confirmed before launch.'),('Demo decisions','Fictional case decisions, preset notes, and display preferences remain in browser storage until reset or cleared.'),('Analytics','The preview emits local events for interactions. Contact details, source records and case data stay outside the event payload.'),('Questions','Use the contact form to prepare a privacy inquiry.')]),
      ('terms','Concept preview terms',[('Simulated records','The walkthrough uses invented documents, geometry, organizations and people to show the proposed review process.'),('Engineering ownership','The authorized engineering team is responsible for qualification and release. Demo decisions are fictional.'),('Evaluation scope','A paid evaluation proceeds under a signed scope after evidence permissions and reviewer responsibilities are agreed.')]),
    ]:
        page('/'+slug+'/',title,rows[0][1],f'<section class="quiet-hero wrap"><p class="kicker">Concept preview</p><h1>{title}</h1></section>'+doc_sections(rows))

def workbench(case='CD-019'):
    return f'''<section class="section wrap workbench-section" id="workbench" data-environment="appendix" data-case="{case}" aria-labelledby="workbench-heading">
    <div class="workbench-head"><div><p class="kicker">{DEMO}</p><h1 id="workbench-heading">Component Fit Review</h1></div><div class="actions">{a('/demo/account/','Simulated pilot account','button outline')}{a(P,'Request a paid evaluation','button dark-button')}</div></div>
    <div class="workbench"><aside class="queue"><h2>Case queue</h2><label>Filter cases<select id="queue-filter"><option value="all">All cases</option><option value="awaiting">Awaiting reviewer</option><option value="needs-evidence">Needs evidence</option><option value="rejected">Rejected</option></select></label><nav id="queue" aria-label="Demo cases"><a href="/demo/cases/CD-019/">CD-019 · Connector mismatch</a><a href="/demo/cases/CD-020/">CD-020 · Missing evidence</a></nav><button class="small-button" type="button" id="reset-demo">{icon('arrow-counter-clockwise')}Reset demo decisions</button></aside>
    <div class="case-main" id="case-main"><p class="load-message">Loading fictional findings…</p><noscript><p>JavaScript enables the workbench. You can still <a href="/assets/example.json">download the example</a>.</p></noscript></div>
    <aside class="source-panel" id="source-panel" aria-labelledby="source-heading"><h2 id="source-heading" tabindex="-1">Source evidence</h2><p>Open a source beside a finding to inspect its version, locator and excerpt.</p></aside>
    </div><div role="status" aria-live="polite" class="workbench-status" id="workbench-status"></div>
    </section>'''
def demo_pages():
    body=hero('Fictional workbench','Review a fictional replacement connector.','Open the source tables and mask drawing for ORB-240 Rev D. Record a simulated decision or inspect a second case that still needs evidence.',art('component-fit-review'),pair(('#workbench','Start the review'),('/demo/cases/CD-020/','Open the case that needs evidence')))
    page(D,'Fictional demo','Source-linked review for two fictional replacements.',body+workbench(),'demo',workbench=True)
    for ident,title in [('CD-019','Connector mismatch'),('CD-020','Missing evidence')]:
        page(f'/demo/cases/{ident}/',title,'Inspect the evidence and record a local simulated disposition.',workbench(ident),'demo',workbench=True)
    body=hero(DEMO,'Aster Relay Works','DEMO-ARW-01 · Discovery. Scope a Component Fit Review replay for one industrial connector family.',scope(),pair((D,'Open the case workbench'),(P,'Scope an evaluation')))
    fields=[('Budget owner','Dev Malen · Component Engineering Manager'),('Reviewer and operator','Mira Sen · Component engineer. Tessa Vale · ECAD library manager and data owner.'),
      ('Integration owner','Noel Iyer · Manufacturing systems lead'),('Permission status','Demo fixtures only. Representative records await explicit authorization.'),
      ('Current process','Cross-reference shortlist, datasheet comparison, ECAD and DFM review, engineering disposition.'),
      ('Commercial status','Quote and signed scope pending. Proposed annual license $60,000 with part-library tiers.'),
      ('Success threshold','Pending agreement with the sponsor and reviewer.'),
      ('Next action','Review a representative closed case with the budget owner, engineer and data owner.')]
    body+=f'<section class="section wrap split"><div class="scope-card"><h2>Proposed evaluation</h2><dl>{"".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t,d in fields)}</dl></div><div>{heading("Simulated activities","Discovery and permissions")}{map_rows([("22 Oct 2026","Discovery entered"),("23 Oct 2026","Library permission requested"),("26 Oct 2026","Simulated reviewer confirmed")])}{pair(("/demo/cases/CD-019/","Open CD-019"),("/demo/cases/CD-020/","Open CD-020"))}</div></section>'
    page('/demo/account/','Simulated pilot account','Fictional account, access status and next commercial action.',body,'account')

if __name__=='__main__':
    full_home()
    products()
    support()
    demo_pages()
