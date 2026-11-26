import * as T from './vendor/build/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/examples/jsm/environments/RoomEnvironment.js';

const mat = (color, metalness=0, roughness=.45) => new T.MeshStandardMaterial({color,metalness,roughness});
const pinX = i => 1.12*(i-2.5);
const group = (parent, name) => {
  const node = new T.Group(); node.name = name; parent.add(node); return node;
};
function box(parent, name, dimensions, position, material, radius=.035) {
  const mesh = new T.Mesh(new RoundedBoxGeometry(...dimensions,2,radius),material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
}
function trace(parent, points, material, width=.024) {
  for (let i=1;i<points.length;i++) {
    const a=new T.Vector3(...points[i-1]), b=new T.Vector3(...points[i]);
    const mesh=new T.Mesh(new T.BoxGeometry(width,.012,a.distanceTo(b)+width/2),material);
    mesh.position.copy(a).lerp(b,.5);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),b.sub(a).normalize());
    parent.add(mesh);
  }
}
function outline(node,x,w,z,material,width) {
  trace(node,[[x-w,0,1-z],[x+w,0,1-z],[x+w,0,1+z],[x-w,0,1+z],[x-w,0,1-z]],material,width);
}
function makeContact(body,i,material) {
  const profile=new T.Shape();
  profile.moveTo(-.66,.81);
  profile.bezierCurveTo(-.2,.83,.17,.80,.40,.58);
  profile.bezierCurveTo(.58,.45,.56,.25,.77,.11);
  profile.quadraticCurveTo(.90,.05,1.12,.051);
  profile.lineTo(1.12,.008);
  profile.quadraticCurveTo(.83,.006,.73,.061);
  profile.bezierCurveTo(.53,.16,.49,.43,.34,.54);
  profile.bezierCurveTo(.09,.74,-.29,.78,-.66,.77);
  profile.closePath();
  const mesh=new T.Mesh(new T.ExtrudeGeometry(profile,{
    depth:.43,bevelEnabled:true,bevelSize:.014,bevelThickness:.013,bevelSegments:2,curveSegments:13
  }),material);
  mesh.name=`Pin ${i+1} spring and SMT toe`;
  mesh.rotation.y=-Math.PI/2;
  mesh.position.x=pinX(i)+.215;
  body.add(mesh);
}

function textureCanvas(width, height=width) {
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  return [canvas,canvas.getContext('2d')];
}

function brushedTexture() {
  const [canvas,context]=textureCanvas(256,128);
  let seed=9173;
  const noise=()=>{
    seed=(1664525*seed+1013904223)>>>0;
    return seed/4294967296;
  };
  const sample=context.createImageData(canvas.width,canvas.height);
  for(let y=0;y<canvas.height;y++){
    const grain=noise();
    for(let x=0;x<canvas.width;x++){
      const value=95+grain*101+noise()*44;
      const index=(y*canvas.width+x)*4;
      sample.data.set([value,value,value,255],index);
    }
  }
  context.putImageData(sample,0,0);
  const map=new T.CanvasTexture(canvas);
  map.wrapS=map.wrapT=T.RepeatWrapping;
  map.repeat.set(.34,1.3);
  return map;
}

function shieldPlate(shield, material) {
  const plate=new T.Shape().moveTo(-3.94,-1.19).lineTo(3.94,-1.19)
    .lineTo(3.94,1.19).lineTo(-3.94,1.19).closePath();
  for(const [x,y,w,h] of [[-3.11,-.66,.59,.33],[3.11,-.66,.59,.33],[-2.63,.71,.46,.31],[2.63,.71,.46,.31]]){
    const slot=new T.Path().moveTo(x-w/2,y-h/2).lineTo(x-w/2,y+h/2)
      .lineTo(x+w/2,y+h/2).lineTo(x+w/2,y-h/2).closePath();
    plate.holes.push(slot);
  }
  const geometry=new T.ExtrudeGeometry(plate,{depth:.085,bevelEnabled:true,bevelSegments:3,bevelSize:.039,bevelThickness:.032});
  const uv=geometry.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+4)/8,(uv.getY(i)+1.25)/2.5);
  const panel=new T.Mesh(geometry,material);
  panel.rotation.x=-Math.PI/2;
  panel.position.set(0,1.405,-.2);
  shield.add(panel);
}

function boardMark(board) {
  const [canvas,context]=textureCanvas(768,64);
  context.font='600 43px monospace';
  context.fillStyle='#d3e9d5';
  context.fillText('ORB-240 REV D  ·  J14',10,49);
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  const label=new T.Mesh(new T.PlaneGeometry(4.25,.35),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));
  label.rotation.x=-Math.PI/2;
  label.position.set(1.67,.073,2.08);
  board.add(label);
}

export function makeConnector() {
  const assembly=new T.Group();
  assembly.name='ORB-240 Rev D · J14';
  const board=group(assembly,'PCB · ORB-240 Rev D');
  const mask=group(assembly,'Mask overlay');
  const body=group(assembly,'ALT-C6 six-position SMT');
  const shield=group(assembly,'Metal shield');
  const brush=brushedTexture();
  const gold=new T.MeshPhysicalMaterial({color:'#ca8c33',metalness:.87,roughness:.25,clearcoat:.28});
  const copper=mat('#9d784d',.68,.37), metal=mat('#637175',.93,.39);
  metal.bumpMap=brush;
  metal.bumpScale=.043;
  metal.roughnessMap=brush;
  const dark=mat('#1f2525',.23,.49), cream=mat('#a49374',.04,.53), solder=mat('#b1b5ae',.82,.31);
  const recess=mat('#514a3c',.06,.63), bevel=mat('#bdac89',.03,.36);
  const green=new T.MeshPhysicalMaterial({color:'#063c39',metalness:.33,roughness:.48,clearcoat:.36,clearcoatRoughness:.38});
  green.bumpMap=brush;
  green.bumpScale=.017;
  const edge=mat('#66533a',.18,.63), rim=mat('#8ee7bc',.15,.38);
  rim.emissive.set('#32856d');
  rim.emissiveIntensity=.36;
  const muted=mat('#548468',.39,.48);
  const active=gold.clone(); active.emissive.set('#da6e17');
  const amber=mat('#ffb55d',.3,.36); amber.emissive.set('#d36f21'); amber.emissiveIntensity=.7;
  box(board,'Laminate',[9.7,.27,4.75],[0,-.16,0],edge,.065);
  box(board,'Green solder mask',[9.68,.075,4.73],[0,.018,0],green);
  box(board,'Bottom coating',[9.68,.047,4.73],[0,-.30,0],green);
  for (const y of [-.088,-.159,-.232]) box(board,'Copper layer',[9.69,.013,4.744],[0,y,0],copper,.006);

  boardMark(board);
  for (const x of [-4.17,4.17]) {
    for (const z of [-1.76,1.74]) {
      const ring=new T.Mesh(new T.TorusGeometry(.133,.036,9,28),copper);
      const hole=new T.Mesh(new T.CircleGeometry(.099,24),dark);
      for (const mesh of [ring,hole]) {
        mesh.rotation.x=-Math.PI/2; mesh.position.set(x,.062,z); board.add(mesh);
      }
    }
    box(board,'Board IC',[.50,.23,.86],[x*.89,.18,.01],dark);
    for(let i=0;i<5;i++) for(const side of [-1,1])
      box(board,'IC lead',[.13,.044,.067],[x*.89+side*.27,.091,-.31+i*.15],solder,.02);
  }
  for(let i=0;i<6;i++) {
    const x=pinX(i);
    box(board,`J14 flat pad ${i+1}`,[.61,.048,.73],[x,.075,1],i===3?gold:solder);
    trace(board,[[x,.061,1.32],[x,.061,1.52],[x*1.19+.18,.061,1.85],[x*1.19+.18,.061,2.13]],copper,.033);
    trace(board,[[x,.061,.64],[x,.061,-.27],[x*1.18,.061,-.65],[x*1.18,.061,-1.72]],muted);
    box(board,'SMD capacitor',[.50,.18,.29],[x*1.18,.145,-1.46],dark);
    for(const side of [-1,1]) box(board,'SMD terminal',[.12,.085,.30],[x*1.18+side*.20,.103,-1.46],solder);
    outline(mask,x,.38,.48,rim,.024);
    makeContact(body,i,i===3?active:gold);
    box(body,'Recessed socket', [.84,.88,.11],[x,.65,-.575],recess,.035);
    box(body,'Molded upper lip',[.96,.12,.22],[x,1.02,.88],bevel,.045);
    for(const side of [-1,1]){
      const via=new T.Mesh(new T.RingGeometry(.024,.045,12),copper);
      via.rotation.x=-Math.PI/2;
      via.position.set(x+side*.21,.065,-.97+side*.20);
      board.add(via);
    }
  }
  trace(board,[[-3.5,.061,1.48],[3.5,.061,1.48],[3.5,.061,-.9],[-3.5,.061,-.9],[-3.5,.061,1.48]],rim,.014);
  box(body,'Rear insulator',[7.27,1.22,.27],[0,.66,-.75],cream,.06);
  box(body,'Upper insulator',[7.28,.26,1.79],[0,1.15,.04],cream,.06);
  box(body,'Lower insulator',[7.28,.22,1.47],[0,.12,-.11],cream);
  for(let i=0;i<7;i++){
    const x=(i-3)*1.12;
    box(body,'Insulator partition',[.17,.99,1.52],[x,.64,.04],cream,.052);
    box(body,'Beveled guide',[.22,.86,.24],[x,.58,.82],bevel,.056);
  }
  for(const x of [-3.56,3.56]) {
    box(body,'Outer wall',[.28,1.16,1.83],[x,.64,.03],cream);
    box(body,'SMT hold-down foot',[.38,.13,.67],[x*1.05,.09,.28],solder);
  }
  for (const x of [-3.55,3.55]) {
    box(shield,'Pressed edge',[.07,.064,2.31],[x,1.545,-.2],solder,.021);
    box(shield,'Retaining tab',[.27,.12,.23],[x,1.12,.85],metal,.018);
  }
  for (const x of [-3.43,3.43]) trace(board,[[x,.062,.88],[x*1.06,.062,.88],[x*1.06,.062,1.37]],copper,.027);
  shieldPlate(shield,metal);
  for(const x of [-3.94,3.94]) box(shield,'Folded wall',[.15,.66,2.45],[x,1.16,-.20],metal);
  trace(mask,[[-3.8,.005,-.31],[3.8,.005,-.31],[3.8,.005,1.71],[-3.8,.005,1.71],[-3.8,.005,-.31]],rim,.012);
  box(mask,'Translucent layer',[7.65,.033,2.10],[0,-.028,.70],
    new T.MeshPhysicalMaterial({color:'#65baa9',roughness:.24,metalness:.14,clearcoat:.80,transparent:true,opacity:.23,depthWrite:false}));
  const delta=group(mask,'Solder-mask overlap');
  const x=pinX(5);
  outline(delta,x,.38,.63,amber,.040);
  trace(delta,[[x+.42,.025,1.48],[x+.60,.025,1.48],[x+.60,.025,1.63],[x+.42,.025,1.63]],amber,.026);
  return {assembly,board,mask,body,shield,delta,active};
}

const poses=[
  {camera:[7.8,6.5,12.6],look:[0,.45,0],lift:[.03,0,.07],turn:-.1},
  {camera:[5.6,5.4,15.8],look:[0,1.83,.14],lift:[2.65,1.25,.69],turn:-.065},
  {camera:[3.8,4.7,14.1],look:[.36,1.88,.52],lift:[2.72,1.22,.51],turn:-.04},
  {camera:[.3,11.7,4.2],look:[.85,.20,.64],lift:[3.1,2.05,.43],turn:0},
  {camera:[7.0,5.8,15.1],look:[0,1.55,.08],lift:[2.56,1.24,.68],turn:-.105},
];

export function attachScene(root, marker, state) {
  let renderer;
  try { renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.55));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.97;
  renderer.domElement.setAttribute('aria-hidden','true');
  root.append(renderer.domElement);
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(34,1,.1,80);
  const room=new RoomEnvironment();
  const pmrem=new T.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(room,.035).texture;
  scene.environmentIntensity=.92;
  room.dispose();
  pmrem.dispose();
  scene.add(new T.HemisphereLight('#bed9da','#29312c',.76));
  const key=new T.DirectionalLight('#ffdfb6',3.15);
  key.position.set(-3,9,7); scene.add(key);
  const rim=new T.DirectionalLight('#73c5d7',2.1);
  rim.position.set(2,3,-7); scene.add(rim);
  const edgeLight=new T.DirectionalLight('#ffe1a2',.85);
  edgeLight.position.set(7,1,4); scene.add(edgeLight);
  const model=makeConnector();
  const [shadowCanvas,shadowContext]=textureCanvas(128);
  const fade=shadowContext.createRadialGradient(64,64,14,64,64,64);
  fade.addColorStop(0,'#020908db');
  fade.addColorStop(.47,'#02090891');
  fade.addColorStop(1,'#02090800');
  shadowContext.fillStyle=fade;
  shadowContext.fillRect(0,0,128,128);
  const shadow=new T.Mesh(new T.PlaneGeometry(13.4,7.2),new T.MeshBasicMaterial({
    map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false
  }));
  shadow.rotation.x=-Math.PI/2;
  shadow.position.y=-.37;
  model.assembly.add(shadow);
  scene.add(model.assembly);
  const look=new T.Vector3(), anchor=new T.Vector3();
  let current=state.progress, previous=NaN, width=0, height=0;
  const frame=(force=false) => {
    const target=state.progress;
    current=state.reduced||Math.abs(target-current)<.002?target:T.MathUtils.lerp(current,target,.145);
    if(!force&&current===previous)return;
    previous=current;
    const i=Math.min(3,Math.floor(current)), f=T.MathUtils.smoothstep(current-i,0,1);
    const a=poses[i], b=poses[i+1], mix=(key,k)=>T.MathUtils.lerp(a[key][k],b[key][k],f);
    const moveBack=Math.max(0,1-Math.abs(current-3)/.65);
    const aspectScale=Math.max(1,1.21/camera.aspect)*(1+.12*moveBack);
    camera.position.set(mix('camera',0),mix('camera',1),mix('camera',2)).multiplyScalar(aspectScale);
    look.set(mix('look',0),mix('look',1),mix('look',2)); camera.lookAt(look);
    model.assembly.rotation.y=T.MathUtils.lerp(a.turn,b.turn,f);
    model.shield.position.set(0,mix('lift',0),-4*moveBack);
    model.body.position.set(0,mix('lift',1),-3.85*moveBack);
    model.mask.position.y=mix('lift',2);
    shadow.material.opacity=.7*(1-moveBack);
    model.mask.visible=current>.36;
    model.delta.visible=current>2.51;
    model.active.emissiveIntensity=current>1.46&&current<2.55?.74:0;
    model.assembly.updateMatrixWorld(true);
    renderer.render(scene,camera);
    if (current>2.51&&current<3.55) model.mask.localToWorld(anchor.set(3.31,.021,1.61));
    else model.body.localToWorld(anchor.set(.56,.45,.57));
    anchor.project(camera);
    marker.style.setProperty('--x',`${(anchor.x*.5+.5)*width}px`);
    marker.style.setProperty('--y',`${(-anchor.y*.5+.5)*height}px`);
  };
  const resize=new ResizeObserver(() => {
    width=root.clientWidth; height=root.clientHeight;
    if(!width||!height)return;
    camera.aspect=width/height;
    camera.zoom = width >= 1000 ? 1.47 : width >= 670 ? 1.29 : .94;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height); frame(true);
  });
  resize.observe(root);
  renderer.setAnimationLoop(()=>{if(!document.hidden&&width&&height)frame()});
  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();
    root.dataset.failed='true';
    renderer.setAnimationLoop(null);
  });
  return renderer;
}
