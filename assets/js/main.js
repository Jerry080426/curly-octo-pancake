(() => {
  'use strict';

  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* =========================================================
     PUBLIC NOTES / SUPABASE
     把 Project URL 和 anon public key 填到下面两项，即可公开留言。
     只使用 anon public key，绝对不要使用 service_role key。
     留空时留言仅保存在当前浏览器，标记为 LOCAL PREVIEW。
     ========================================================= */
  const SUPABASE_URL = '';
  const SUPABASE_ANON_KEY = '';
  const GUESTBOOK_TABLE = 'messages';
  const guestbookEnabled = Boolean(SUPABASE_URL.trim() && SUPABASE_ANON_KEY.trim());
  const notesEndpoint = guestbookEnabled ? `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${GUESTBOOK_TABLE}` : '';
  const notesHeaders = guestbookEnabled ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {};
  const NOTES_LOCAL_KEY = 'timeMachine05.notes.v1';
  const NOTES_COOLDOWN_KEY = 'timeMachine05.lastNote.v1';

  /* 节点文案与图片：直接修改下面 parts 中对应项即可。
     图片替换 assets/img/gallery/ 中的同名文件，不需要改代码。 */
  const parts = {
    camera: {
      n: '01', name: '观测窗', en: 'OPTICAL WINDOW', group: 'parts',
      material: '旧数码相机镜头 / 白色环形外壳',
      join: '螺丝固定 · 热熔胶 · 麻绳缠绕',
      desc: '镜头把世界框进一个矩形，快门把流动的时间切成一个瞬间。它被嵌在白色环体的中心，成为整台机器朝向外界的一只眼。',
      image: 'assets/img/gallery/camera-detail.webp',
      caption: 'PLATE 01 / CAMERA + RING',
    },
    reel: {
      n: '02', name: '牵引索', en: 'TENSION LINE', group: 'parts',
      material: '渔轮 / 鱼线 / 铜色编织线',
      join: '穿线 · 缠绕 · 扎带固定',
      desc: '渔轮收放鱼线，锚定、拉扯不同时空的坐标。线的张力在白色底座与机身之间来回传递。',
      image: 'assets/img/gallery/reel.webp',
      caption: 'PLATE 02 / REEL + LINE',
    },
    nozzle: {
      n: '03', name: '能量口', en: 'ENERGY NOZZLE', group: 'parts',
      material: '玩具枪管 / 弹簧 / 彩色塑料件',
      join: '插接 · 弹簧卡扣 · 热熔胶',
      desc: '枪口把发射翻译成推进，让机器从斜坡上向前冲出。黄色、红色与蓝色的塑料件保留了玩具的性格。',
      image: 'assets/img/gallery/nozzle.webp',
      caption: 'PLATE 04 / NOZZLE + SPRING',
    },
    signal: {
      n: '04', name: '信号接口', en: 'SIGNAL PORT', group: 'pipes',
      material: '白色插头 / 螺旋线 / 铜线',
      join: '铜线缠绕 · 热缩管 · 插接',
      desc: '白色插头与螺旋线从机器里伸出，像一条仍在传输的神经。它们不隐藏线路，而是把线路变成可见的造型。',
      image: 'assets/img/gallery/connector.webp',
      caption: 'PLATE 05 / PLUG + SIGNAL',
    },
    net: {
      n: '05', name: '时间之网', en: 'TIME NET', group: 'soft',
      material: '渔网 / 麻绳 / 旧帆布',
      join: '打结 · 缠绕 · 绑扎',
      desc: '麻绳与渔网把散落的零件打成结，所有时刻彼此勾连。网从底座垂落，像一段仍在下坠的时间。',
      image: 'assets/img/gallery/net-detail.webp',
      caption: 'PLATE 06 / NET + KNOT',
    },
    stage: {
      n: '06', name: '曲面舞台', en: 'CURVED STAGE', group: 'skeleton',
      material: '48 层白色纸板 / 白色喷涂',
      join: '层叠胶合 · 切割 · 表面喷涂',
      desc: '四十八层白色纸板托住倾斜的机器，不是地面，是被弯曲的时间。每一层的偏移都记录着手工切割的误差。',
      image: 'assets/img/gallery/base.webp',
      caption: 'PLATE 07 / 48-LAYER BASE',
    },
    ring: {
      n: '07', name: '环体骨架', en: 'RING FRAME', group: 'skeleton',
      material: '白色环形骨架 / 铜管 / 螺栓',
      join: '螺栓 · 铆接 · 结构胶',
      desc: '白色环体是整台机器的头部，也是承力核心。它将相机、手柄与枪管固定在同一个圆形秩序里。',
      image: 'assets/img/gallery/ring.webp',
      caption: 'PLATE 08 / RING + COPPER',
    },
    pipe: {
      n: '08', name: '管路关节', en: 'PIPE JOINT', group: 'pipes',
      material: '铜管 / 编织线 / 白色软管',
      join: '插入 · 扎带 · 缠绕 · 胶固定',
      desc: '铜管从环体内部穿出，与白色软管和编织线相接。没有隐藏的接口，所有连接都以可见的方式暴露在表面。',
      image: 'assets/img/gallery/pipe.webp',
      caption: 'PLATE 09 / PIPE JOINT',
    },
  };

  const plates = {
    front: {
      label: '正面', en: 'FRONT', index: '01', image: 'assets/img/plates/front.webp',
      alt: '综合模型正面，圆形观测口与彩色零件.',
      desc: '机器以圆形观测口面对观看者。白色环体、铜管与彩色零件在这一面汇聚；点击热点，读取构件的材料与连接方式。',
      hotspots: [
        { part: 'camera', x: 56.5, y: 38 },
        { part: 'pipe', x: 66, y: 43 },
        { part: 'reel', x: 31, y: 49 },
        { part: 'signal', x: 82, y: 68 },
        { part: 'stage', x: 78, y: 91 },
      ],
    },
    side: {
      label: '侧面', en: 'SIDE', index: '02', image: 'assets/img/plates/side.webp',
      alt: '综合模型侧面，倾斜机身与白色底座.',
      desc: '倾斜的机身与水平的层积底座形成受力关系。玩具枪、渔网与弯曲的白色地形从侧面伸展开来。',
      hotspots: [
        { part: 'camera', x: 40, y: 55 },
        { part: 'nozzle', x: 67, y: 59 },
        { part: 'net', x: 44.5, y: 71 },
        { part: 'stage', x: 78, y: 82 },
      ],
    },
    head: {
      label: '头部', en: 'HEAD', index: '03', image: 'assets/img/plates/head.webp',
      alt: '综合模型头部与环形观测口近景.',
      desc: '从头部俯看，白色环体像一枚被拆开的日晷。相机、插头、铜管与电路在同一高度交叠。',
      hotspots: [
        { part: 'ring', x: 57, y: 42 },
        { part: 'signal', x: 51, y: 5 },
        { part: 'stage', x: 72, y: 88 },
      ],
    },
    pipe: {
      label: '管路关节', en: 'PIPE JOINT', index: '04', image: 'assets/img/plates/pipe.webp',
      alt: '综合模型管路、铜管与电路板近景.',
      desc: '铜管、白色软管、螺旋线与电路板挤在同一段剖面里。管路不承担隐藏功能，它们本身就是结构。',
      hotspots: [
        { part: 'pipe', x: 34, y: 51 },
        { part: 'signal', x: 58, y: 5 },
        { part: 'ring', x: 63, y: 35 },
      ],
    },
    base: {
      label: '底部支撑', en: 'BASE', index: '05', image: 'assets/img/plates/base.webp',
      alt: '综合模型底部，48层白色层积底座与渔网.',
      desc: '四十八层白色纸板被切割、错位、胶合，形成一个不稳定的曲面。机器的重量从圆形底盘落入这层地形。',
      hotspots: [
        { part: 'stage', x: 80, y: 84 },
        { part: 'net', x: 37, y: 64 },
        { part: 'ring', x: 58, y: 80 },
        { part: 'nozzle', x: 90, y: 56 },
      ],
    },
  };

  const groups = {
    skeleton: {
      label: '骨架', en: 'FRAME / STRUCTURE', image: 'assets/img/groups/skeleton.webp',
      desc: '白色环体、金属支架与四十八层纸板构成承力骨架。它们不模仿机械结构，而是用旧材料自身的刚性重新组织受力。',
      note: '白色环体 / 金属支架 / 48层纸板',
      parts: ['stage', 'ring'],
    },
    pipes: {
      label: '管线', en: 'PIPEWORK / CONNECTIONS', image: 'assets/img/groups/pipes.webp',
      desc: '铜管、白色软管、编织线与插头被保留在表面。连接工艺包括插接、缠绕、扎带与热缩管固定，所有接口都可见。',
      note: '铜管 / 软管 / 插头 / 编织线',
      parts: ['signal', 'pipe'],
    },
    parts: {
      label: '零件模块', en: 'MODULES / PARTS', image: 'assets/img/groups/parts.webp',
      desc: '摄像头、照相机、手柄、玩具枪与钓具被拆到零件层级。这里只保留零件：外壳、镜头、机身、按键、摇杆、枪管、竿节与线杯。',
      note: '摄像头零件 / 照相机零件 / 手柄零件 / 枪械零件 / 钓具零件',
      parts: ['camera', 'nozzle', 'reel'],
    },
    soft: {
      label: '软性材料', en: 'FLEXIBLE / BINDING', image: 'assets/img/groups/soft.webp',
      desc: '渔网、网袋与麻绳不承重，负责打结、垂坠和缠绕。它们把分散的硬质零件重新绑成一个整体。',
      note: '渔网 / 网袋 / 麻绳 / 打结',
      parts: ['net'],
    },
  };

  const orbitViews = [
    { src: 'assets/img/orbit/01.webp', alt: '综合模型多角度环视 01' },
    { src: 'assets/img/orbit/02.webp', alt: '综合模型多角度环视 02' },
    { src: 'assets/img/orbit/03.webp', alt: '综合模型多角度环视 03' },
    { src: 'assets/img/orbit/04.webp', alt: '综合模型多角度环视 04' },
    { src: 'assets/img/orbit/05.webp', alt: '综合模型多角度环视 05' },
    { src: 'assets/img/orbit/06.webp', alt: '综合模型多角度环视 06' },
    { src: 'assets/img/orbit/07.webp', alt: '综合模型多角度环视 07' },
    { src: 'assets/img/orbit/08.webp', alt: '综合模型多角度环视 08' },
    { src: 'assets/img/orbit/09.webp', alt: '综合模型多角度环视 09' },
    { src: 'assets/img/orbit/10.webp', alt: '综合模型多角度环视 10' },
    { src: 'assets/img/orbit/11.webp', alt: '综合模型多角度环视 11' },
    { src: 'assets/img/orbit/12.webp', alt: '综合模型多角度环视 12' },
  ];

  const presetOrbit = { front: 4, side: 6, head: 4, pipe: 4, base: 9 };
  const presetOrder = ['front', 'side', 'head', 'pipe', 'base'];
  const groupOrder = ['all', 'skeleton', 'pipes', 'parts', 'soft'];
  const partPreset = { camera: 'front', reel: 'front', nozzle: 'side', signal: 'front', net: 'side', stage: 'base', ring: 'head', pipe: 'pipe' };

  const dom = {
    viewer: $('#viewer'), stage: $('#stage'), plane: $('#plane'),
    layerA: $('#layerA'), layerB: $('#layerB'), hotspots: $('#hotspots'),
    stageLoader: $('#stageLoader'), loadProgress: $('#loadProgress'),
    viewModeLabel: $('#viewModeLabel'), viewCount: $('#viewCount'),
    presetRow: $('#presetRow'), groupRow: $('#groupRow'), orbitBtn: $('#orbitBtn'),
    viewRail: $('#viewRail'), autoBtn: $('#autoBtn'), fullBtn: $('#fullBtn'),
    zoomIn: $('#zoomIn'), zoomOut: $('#zoomOut'), resetBtn: $('#resetBtn'), zoomLevel: $('#zoomLevel'),
    infoKicker: $('#infoKicker'), infoTitle: $('#infoTitle'), infoEn: $('#infoEn'),
    infoDesc: $('#infoDesc'), infoMeta: $('#infoMeta'), infoImage: $('#infoImage'),
    infoImageCap: $('#infoImageCap'), infoImageBtn: $('#infoImageBtn'),
    infoCard: $('#infoCard'), infoFoot: $('#infoFoot'),
    randomNode: $('#randomNode'),
    pipelineImage: $('#pipelineImage'), pipelineCapIndex: $('#pipelineCapIndex'), pipelineCapText: $('#pipelineCapText'), pipelineList: $('#pipelineList'),
    notesStatus: $('#notesStatus'), notesCount: $('#notesCount'), notesConfigNote: $('#notesConfigNote'),
    noteForm: $('#noteForm'), noteName: $('#noteName'), noteContent: $('#noteContent'), noteHoney: $('#noteHoney'),
    noteCounter: $('#noteCounter'), noteFormStatus: $('#noteFormStatus'), noteSubmit: $('#noteSubmit'),
    starInput: $('#starInput'), ratingValue: $('#ratingValue'), averageRating: $('#averageRating'), averageStars: $('#averageStars'),
    notesList: $('#notesList'), randomNote: $('#randomNote'), noteRefresh: $('#noteRefresh'),
    lightbox: $('#lightbox'), lightboxImage: $('#lightboxImage'), lightboxTitle: $('#lightboxTitle'),
    lightboxCaption: $('#lightboxCaption'), lightboxClose: $('#lightboxClose'),
  };

  const state = {
    mode: 'plate', preset: 'front', group: 'all', part: null,
    zoom: 1, panX: 0, panY: 0, tilt: 0,
    viewFloat: 4, auto: false, drag: null, autoTimer: null, autoRaf: null,
    currentInfo: { image: plates.front.image, title: '正面', caption: 'PLATE 05 / FRONT' },
    lastPreset: 'front',
    lightboxOpen: false,
    loadedCount: 0,
  };

  let notesData = [];
  let notesRating = 0;
  let notesLoaded = false;
  let lastNoteAt = 0;
  try { lastNoteAt = Number(localStorage.getItem(NOTES_COOLDOWN_KEY)) || 0; } catch (err) { lastNoteAt = 0; }

  const nViews = orbitViews.length;

  function normalizeView(v) {
    return ((v % nViews) + nViews) % nViews;
  }

  function updateViewRail(active) {
    Array.from(dom.viewRail.children).forEach((button, i) => {
      button.classList.toggle('is-active', i === active);
      button.classList.toggle('is-near', i === (active + 1) % nViews || i === (active - 1 + nViews) % nViews);
    });
  }

  function buildViewRail() {
    dom.viewRail.replaceChildren();
    orbitViews.forEach((view, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `环视角度 ${i + 1}`);
      button.addEventListener('click', () => {
        stopAuto();
        enterOrbit(i, true);
      });
      dom.viewRail.appendChild(button);
    });
  }

  function applyPlaneTransform() {
    dom.plane.style.transform = `translate3d(${state.panX}px, ${state.panY}px, 0) scale(${state.zoom}) rotateY(${state.tilt}deg)`;
    dom.plane.style.setProperty('--inv', String(1 / state.zoom));
  }

  function clampPan() {
    const maxX = Math.max(0, (dom.stage.clientWidth * (state.zoom - 1)) / 2 + 46);
    const maxY = Math.max(0, (dom.stage.clientHeight * (state.zoom - 1)) / 2 + 46);
    state.panX = clamp(state.panX, -maxX, maxX);
    state.panY = clamp(state.panY, -maxY, maxY);
  }

  function resetTransform() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.tilt = 0;
    dom.zoomLevel.textContent = '100%';
    applyPlaneTransform();
  }

  function setZoom(next) {
    state.zoom = clamp(next, 1, 3);
    clampPan();
    dom.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    applyPlaneTransform();
  }

  function showStill(src, alt) {
    if (!src) return;
    dom.layerA.src = src;
    dom.layerA.alt = alt || '';
    dom.layerA.style.opacity = '1';
    dom.layerB.style.opacity = '0';
    dom.layerB.removeAttribute('src');
  }

  function renderOrbit(v) {
    const norm = normalizeView(v);
    const i0 = Math.floor(norm);
    const i1 = (i0 + 1) % nViews;
    const mix = norm - i0;
    const a = orbitViews[i0], b = orbitViews[i1];

    if (dom.layerA.getAttribute('src') !== a.src) dom.layerA.src = a.src;
    if (dom.layerB.getAttribute('src') !== b.src) dom.layerB.src = b.src;
    dom.layerA.alt = a.alt;
    dom.layerB.alt = '';
    dom.layerA.style.opacity = String(1 - mix);
    dom.layerB.style.opacity = String(mix);

    state.viewFloat = v;
    const display = Math.round(norm) % nViews;
    dom.viewCount.textContent = `${String(display + 1).padStart(2, '0')} / ${String(nViews).padStart(2, '0')}`;
    dom.viewModeLabel.textContent = 'ORBIT / 自由环视';
    updateViewRail(display);
  }

  function enterOrbit(index = state.viewFloat, reset = false) {
    stopAuto();
    state.mode = 'orbit';
    state.group = 'all';
    state.part = null;
    state.preset = null;
    dom.hotspots.replaceChildren();
    dom.hotspots.classList.add('is-hidden');
    updateControlButtons();
    if (reset) resetTransform();
    renderOrbit(index);
    updateInfoOrbit();
  }

  function enterOrbitFromPreset() {
    const start = presetOrbit[state.preset] ?? 0;
    state.mode = 'orbit';
    state.group = 'all';
    state.part = null;
    state.preset = null;
    dom.hotspots.replaceChildren();
    dom.hotspots.classList.add('is-hidden');
    updateControlButtons();
    renderOrbit(start);
    updateInfoOrbit();
  }

  function updateControlButtons() {
    $$('.preset-row button').forEach((b) => b.classList.toggle('is-active', state.mode === 'plate' && b.dataset.preset === state.preset));
    $$('.group-row button').forEach((b) => {
      const active = state.mode === 'group' ? b.dataset.group === state.group : b.dataset.group === 'all';
      b.classList.toggle('is-active', active);
    });
  }

  function renderHotspots(plateKey) {
    const plate = plates[plateKey];
    dom.hotspots.replaceChildren();
    if (!plate) return;
    plate.hotspots.forEach((spot) => {
      const part = parts[spot.part];
      if (!part) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hotspot';
      button.dataset.part = part.n;
      button.style.setProperty('--x', `${spot.x}%`);
      button.style.setProperty('--y', `${spot.y}%`);
      button.setAttribute('aria-label', `${part.n} ${part.name}：${part.material}`);
      button.innerHTML = `<span>${part.n}</span><em>${part.name}</em>`;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectPart(spot.part);
      });
      if (state.part === spot.part) button.classList.add('is-active');
      dom.hotspots.appendChild(button);
    });
    dom.hotspots.classList.remove('is-hidden');
  }

  function selectPart(id) {
    const part = parts[id];
    if (!part) return;
    state.part = id;
    $$('.hotspot').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.part === part.n));
    updateInfoPart(part);
    if (window.matchMedia('(max-width:920px)').matches) {
      window.setTimeout(() => {
        dom.infoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }

  function setPlate(key) {
    const plate = plates[key];
    if (!plate) return;
    stopAuto();
    state.mode = 'plate';
    state.preset = key;
    state.lastPreset = key;
    state.group = 'all';
    state.part = null;
    showStill(plate.image, plate.alt);
    renderHotspots(key);
    updateControlButtons();
    resetTransform();
    dom.viewCount.textContent = `PLATE ${plate.index} / 05`;
    dom.viewModeLabel.textContent = `INSPECT / ${plate.label}`;
    updateViewRail(presetOrbit[key] ?? 0);
    updateInfoPreset(plate);
  }

  function setGroup(key) {
    if (key === 'all') {
      setPlate(state.lastPreset || 'front');
      return;
    }
    const group = groups[key];
    if (!group) return;
    stopAuto();
    state.mode = 'group';
    state.group = key;
    state.preset = null;
    state.part = null;
    showStill(group.image, `${group.label}部件档案`);
    dom.hotspots.replaceChildren();
    dom.hotspots.classList.add('is-hidden');
    updateControlButtons();
    resetTransform();
    dom.viewCount.textContent = 'GROUP ARCHIVE';
    dom.viewModeLabel.textContent = `ARCHIVE / ${group.label}`;
    updateViewRail(-1);
    updateInfoGroup(group);
  }

  function updateInfo({ kicker, title, en, desc, meta, image, imageAlt, cap, foot }) {
    dom.infoKicker.textContent = kicker;
    dom.infoTitle.textContent = title;
    dom.infoEn.textContent = en;
    dom.infoDesc.textContent = desc;
    dom.infoMeta.innerHTML = meta.map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`).join('');
    dom.infoImage.src = image;
    dom.infoImage.alt = imageAlt || title;
    dom.infoImageCap.textContent = cap;
    if (foot) dom.infoFoot.innerHTML = foot;
    state.currentInfo = { image, title, caption: cap };
  }

  function updateInfoPreset(plate) {
    updateInfo({
      kicker: `VIEW / ${plate.en}`,
      title: plate.label,
      en: `${plate.en} / ANNOTATED VIEW`,
      desc: plate.desc,
      meta: [['视角', plate.label], ['热点', `${plate.hotspots.length} 个结构节点`]],
      image: plate.image,
      imageAlt: plate.alt,
      cap: `PLATE ${plate.index} / ${plate.en}`,
      foot: '<span class="copper">点击模型热点</span><span>点击图像放大</span>',
    });
  }

  function updateInfoGroup(group) {
    updateInfo({
      kicker: `GROUP / ${group.en}`,
      title: group.label,
      en: group.en,
      desc: group.desc,
      meta: [['分组', group.note], ['构件', group.parts.map((p) => parts[p]?.name).filter(Boolean).join(' / ')]],
      image: group.image,
      imageAlt: `${group.label}部件档案`,
      cap: `ARCHIVE / ${group.label}`,
      foot: '<span class="copper">部件档案视图</span><span>点击图像放大</span>',
    });
  }

  function updateInfoOrbit() {
    updateInfo({
      kicker: 'MODE / ORBIT',
      title: '自由环视',
      en: 'MULTI-VIEW / DRAG TO ORBIT',
      desc: '拖拽切换观察角度，滚轮缩放，右键平移。选择上方任一机位，回到带有结构热点的标注视图。',
      meta: [['模式', '多角度环视'], ['素材', '实拍 12 视角']],
      image: orbitViews[Math.round(normalizeView(state.viewFloat)) % nViews].src,
      imageAlt: '综合模型多角度环视',
      cap: 'MULTI-VIEW / 12 ANGLES',
      foot: '<span class="copper">拖拽环视</span><span>选择机位查看热点</span>',
    });
  }

  function updateInfoPart(part) {
    updateInfo({
      kicker: `NODE / ${part.n}`,
      title: part.name,
      en: part.en,
      desc: part.desc,
      meta: [['材料 / MATERIAL', part.material], ['连接 / JOIN', part.join], ['分组 / GROUP', groups[part.group]?.label || '—']],
      image: part.image,
      imageAlt: `${part.name}细节`,
      cap: part.caption,
      foot: '<span class="copper">结构节点</span><span>点击图像放大</span>',
    });
  }

  function stopAuto() {
    state.auto = false;
    dom.autoBtn?.setAttribute('aria-pressed', 'false');
    if (state.autoTimer) clearInterval(state.autoTimer);
    state.autoTimer = null;
    if (state.autoRaf) cancelAnimationFrame(state.autoRaf);
    state.autoRaf = null;
  }

  function animateViewTo(target, duration = 1200) {
    if (state.autoRaf) cancelAnimationFrame(state.autoRaf);
    const from = state.viewFloat;
    const delta = target - from;
    const start = performance.now();
    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      renderOrbit(from + delta * ease(t));
      if (t < 1) state.autoRaf = requestAnimationFrame(step);
      else state.autoRaf = null;
    };
    state.autoRaf = requestAnimationFrame(step);
  }

  function startAuto() {
    if (state.auto) return;
    if (state.mode !== 'orbit') enterOrbit(presetOrbit[state.preset] ?? 0, false);
    state.auto = true;
    dom.autoBtn.setAttribute('aria-pressed', 'true');
    clearInterval(state.autoTimer);
    state.autoTimer = setInterval(() => {
      const current = Math.round(state.viewFloat);
      animateViewTo(current + 1, 1300);
    }, 2800);
  }

  function toggleAuto() {
    state.auto ? stopAuto() : startAuto();
  }

  function buildPresetButtons() {
    $$('.preset-row button').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.preset) setPlate(button.dataset.preset);
      });
    });
    $$('.group-row button').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.group) setGroup(button.dataset.group);
      });
    });
    dom.orbitBtn.addEventListener('click', () => {
      stopAuto();
      enterOrbit(0, true);
    });
    dom.randomNode.addEventListener('click', focusRandomPart);
  }

  function focusRandomPart() {
    const ids = Object.keys(parts);
    const id = ids[Math.floor(Math.random() * ids.length)];
    const preset = partPreset[id] || 'front';
    setPlate(preset);
    selectPart(id);
  }

  function getHotspotForPart(id) {
    const part = parts[id];
    if (!part) return null;
    return Array.from(dom.hotspots.querySelectorAll('.hotspot')).find((h) => h.dataset.part === part.n) || null;
  }

  function openLightbox(image, title, caption) {
    if (!image) return;
    state.lightboxOpen = true;
    dom.lightboxImage.src = image;
    dom.lightboxImage.alt = title || '';
    dom.lightboxTitle.textContent = title || '图像';
    dom.lightboxCaption.textContent = caption || '';
    dom.lightbox.classList.add('is-open');
    dom.lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    window.setTimeout(() => dom.lightboxClose.focus({ preventScroll: true }), 180);
  }

  function closeLightbox() {
    if (!state.lightboxOpen) return;
    state.lightboxOpen = false;
    dom.lightbox.classList.remove('is-open');
    dom.lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  /* =========================================================
     PUBLIC NOTES — local preview / Supabase public feed
     ========================================================= */
  function readLocalNotes() {
    try {
      const data = JSON.parse(localStorage.getItem(NOTES_LOCAL_KEY) || '[]');
      return Array.isArray(data) ? data.filter((n) => n && typeof n.content === 'string') : [];
    } catch (err) { return []; }
  }

  function writeLocalNotes() {
    try { localStorage.setItem(NOTES_LOCAL_KEY, JSON.stringify(notesData.filter((n) => n._local))); } catch (err) { /* ignore */ }
  }

  function setNotesStatus(kind, text) {
    if (!dom.notesStatus) return;
    dom.notesStatus.className = `notes-status ${kind || ''}`;
    const label = dom.notesStatus.querySelector('span');
    if (label) label.textContent = text;
  }

  function setNotesConfigNote(visible, text) {
    if (!dom.notesConfigNote) return;
    dom.notesConfigNote.classList.toggle('is-visible', visible);
    if (text) dom.notesConfigNote.textContent = text;
  }

  function noteTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function updateNotesCount() {
    if (dom.notesCount) dom.notesCount.textContent = String(notesData.length);
  }

  function ratingOf(entry) {
    const rating = Number(entry?.rating);
    return rating >= 1 && rating <= 5 ? rating : 0;
  }

  function updateAverageRating() {
    const ratings = notesData.map(ratingOf).filter((r) => r > 0);
    const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    if (dom.averageRating) dom.averageRating.textContent = ratings.length ? average.toFixed(1) : '—';
    if (dom.averageStars) {
      dom.averageStars.replaceChildren();
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        if (i <= Math.round(average)) star.className = 'is-on';
        dom.averageStars.appendChild(star);
      }
      dom.averageStars.setAttribute('aria-label', ratings.length ? `平均 ${average.toFixed(1)} 星，共 ${ratings.length} 人评分` : '暂无评分');
    }
    updateNotesCount();
  }

  function renderNotes() {
    if (!dom.notesList) return;
    dom.notesList.replaceChildren();

    if (!notesData.length) {
      const empty = document.createElement('div');
      empty.className = 'notes-empty';
      empty.textContent = guestbookEnabled ? '还没有公开留言。为模型打一个分，写下第一条。' : '还没有本地留言。为模型打一个分，写下第一条。';
      dom.notesList.appendChild(empty);
    } else {
      notesData.forEach((entry) => {
        const card = document.createElement('article');
        card.className = 'note-card';
        const rating = ratingOf(entry);

        const top = document.createElement('div');
        top.className = 'note-card-top';

        const author = document.createElement('span');
        author.className = 'note-card-author';
        author.textContent = entry.nickname || '匿名';
        if (entry._local) {
          const local = document.createElement('span');
          local.className = 'note-card-local';
          local.textContent = 'LOCAL';
          author.appendChild(local);
        }

        const time = document.createElement('time');
        time.dateTime = entry.created_at || '';
        time.textContent = noteTime(entry.created_at);
        top.append(author, time);

        const ratingRow = document.createElement('div');
        ratingRow.className = 'note-card-rating';
        const stars = document.createElement('span');
        stars.className = 'note-stars';
        stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        stars.setAttribute('aria-label', `${rating} 星`);
        const score = document.createElement('small');
        score.textContent = rating ? `${rating} / 5` : '未评分';
        ratingRow.append(stars, score);

        const text = document.createElement('p');
        text.className = 'note-card-text';
        text.textContent = entry.content;
        card.append(top, ratingRow, text);
        dom.notesList.appendChild(card);
      });
    }
    dom.notesList.classList.toggle('is-single', notesData.length === 1);
    updateAverageRating();
  }

  async function loadNotes(force = false) {
    if (notesLoaded && !force) return;
    notesLoaded = true;

    if (!guestbookEnabled) {
      notesData = readLocalNotes();
      setNotesStatus('is-local', `LOCAL PREVIEW · 仅此浏览器 ${notesData.length} 条`);
      setNotesConfigNote(true, '本地预览 · 留言只保存在这台设备。连接公开留言服务后，才会对所有访客显示。');
      if (dom.noteFormStatus) dom.noteFormStatus.textContent = '本地预览 · 评分不会公开';
      renderNotes();
      return;
    }

    setNotesStatus('is-public', 'PUBLIC FEED · 正在读取公开留言');
    setNotesConfigNote(false);
    try {
      const url = `${notesEndpoint}?select=id,nickname,content,rating,created_at&is_hidden=eq.false&order=created_at.desc&limit=60`;
      const res = await fetch(url, { headers: notesHeaders, cache: 'no-store' });
      if (!res.ok) throw new Error(`read ${res.status}`);
      const data = await res.json();
      notesData = Array.isArray(data) ? data : [];
      setNotesStatus('is-public', `PUBLIC FEED · ${notesData.length} 条公开留言`);
      setNotesConfigNote(false);
      if (dom.noteFormStatus) dom.noteFormStatus.textContent = '匿名公开 · 1–5 星';
      renderNotes();
    } catch (err) {
      console.error('Guestbook read failed:', err);
      notesData = [];
      setNotesStatus('is-error', 'PUBLIC FEED · 连接失败');
      setNotesConfigNote(true, '公开留言连接失败。请检查 Supabase URL、anon key 与 RLS 策略。');
      if (dom.noteFormStatus) dom.noteFormStatus.textContent = '连接失败 · 暂时无法发布';
      renderNotes();
    }
  }

  function paintRating(value) {
    const buttons = dom.starInput ? Array.from(dom.starInput.querySelectorAll('.star-btn')) : [];
    buttons.forEach((button) => {
      const active = Number(button.dataset.rating) <= value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-checked', Number(button.dataset.rating) === value ? 'true' : 'false');
    });
    if (dom.ratingValue) dom.ratingValue.textContent = value ? `${value} / 5 星` : '未评分';
  }

  function setRating(value) {
    notesRating = value;
    paintRating(value);
  }

  function setupRating() {
    if (!dom.starInput) return;
    const buttons = Array.from(dom.starInput.querySelectorAll('.star-btn'));
    buttons.forEach((button) => {
      const value = Number(button.dataset.rating);
      button.addEventListener('mouseenter', () => paintRating(value));
      button.addEventListener('mouseleave', () => paintRating(notesRating));
      button.addEventListener('click', () => {
        setRating(value);
        dom.noteFormStatus.textContent = `${value} 星 · 可以提交评分`;
      });
    });
  }

  function updateNoteCounter() {
    if (!dom.noteCounter || !dom.noteContent) return;
    dom.noteCounter.textContent = `${dom.noteContent.value.length} / 120`;
  }

  async function submitNote(event) {
    event.preventDefault();
    const content = dom.noteContent.value.trim().replace(/\s+/g, ' ');
    const nickname = (dom.noteName.value.trim() || '匿名').slice(0, 16);

    if (dom.noteHoney.value) return;
    if (!notesRating) {
      dom.noteFormStatus.textContent = '先给模型打一个分（1–5 星）。';
      dom.starInput.querySelector('.star-btn')?.focus();
      return;
    }
    if (!content) {
      dom.noteFormStatus.textContent = '再写一句，对模型说点什么。';
      dom.noteContent.focus();
      return;
    }
    if (content.length > 120) {
      dom.noteFormStatus.textContent = '最多 120 字。';
      return;
    }
    const wait = 20000 - (Date.now() - lastNoteAt);
    if (wait > 0) {
      dom.noteFormStatus.textContent = `请 ${Math.ceil(wait / 1000)} 秒后再提交。`;
      return;
    }

    dom.noteSubmit.disabled = true;
    const payload = { nickname, content, rating: notesRating, is_hidden: false };

    try {
      if (guestbookEnabled) {
        const res = await fetch(notesEndpoint, {
          method: 'POST',
          headers: { ...notesHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`post ${res.status}`);
        const created = await res.json();
        notesData.unshift(Array.isArray(created) && created[0] ? created[0] : { ...payload, created_at: new Date().toISOString() });
        setNotesStatus('is-public', `PUBLIC FEED · ${notesData.length} 条公开留言`);
        dom.noteFormStatus.textContent = '已公开 · 谢谢你的评分与留言。';
      } else {
        notesData.unshift({ ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString(), _local: true });
        writeLocalNotes();
        setNotesStatus('is-local', `LOCAL PREVIEW · 仅此浏览器 ${notesData.length} 条`);
        dom.noteFormStatus.textContent = '已保存到本机预览。';
      }

      lastNoteAt = Date.now();
      try { localStorage.setItem(NOTES_COOLDOWN_KEY, String(lastNoteAt)); } catch (err) { /* ignore */ }
      dom.noteContent.value = '';
      dom.noteName.value = '';
      setRating(0);
      updateNoteCounter();
      renderNotes();
      const first = dom.notesList.querySelector('.note-card');
      if (first) {
        first.classList.add('is-random');
        window.setTimeout(() => first.classList.remove('is-random'), 1700);
      }
    } catch (err) {
      console.error('Guestbook write failed:', err);
      dom.noteFormStatus.textContent = '提交失败，请稍后再试。';
      setNotesStatus('is-error', guestbookEnabled ? 'PUBLIC FEED · 写入失败' : 'LOCAL PREVIEW · 保存失败');
    } finally {
      dom.noteSubmit.disabled = false;
    }
  }

  function randomReadNote() {
    const cards = Array.from(dom.notesList.querySelectorAll('.note-card'));
    if (!cards.length) {
      dom.noteFormStatus.textContent = '还没有留言可以抽取。';
      return;
    }
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.classList.add('is-random');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    window.setTimeout(() => card.classList.remove('is-random'), 1700);
  }

  function setupNotes() {
    if (!dom.noteForm) return;
    setupRating();
    paintRating(0);
    dom.noteForm.addEventListener('submit', submitNote);
    dom.noteContent.addEventListener('input', updateNoteCounter);
    dom.randomNote.addEventListener('click', randomReadNote);
    dom.noteRefresh.addEventListener('click', () => loadNotes(true));
    loadNotes();
  }

  function setupPipeline() {
    if (!dom.pipelineList) return;
    const items = Array.from(dom.pipelineList.querySelectorAll('.pipe-item'));
    items.forEach((button) => {
      button.addEventListener('click', () => {
        items.forEach((b) => b.classList.toggle('is-active', b === button));
        const src = button.dataset.image;
        if (dom.pipelineImage && src) {
          dom.pipelineImage.style.opacity = '0.35';
          const preload = new Image();
          preload.onload = () => {
            dom.pipelineImage.src = src;
            dom.pipelineImage.style.opacity = '1';
          };
          preload.onerror = () => { dom.pipelineImage.style.opacity = '1'; };
          preload.src = src;
        }
        if (dom.pipelineCapIndex) dom.pipelineCapIndex.textContent = button.dataset.index || '';
        if (dom.pipelineCapText) dom.pipelineCapText.textContent = button.dataset.text || '';
      });
    });
  }


  function setupGallery() {
    $$('.evidence-card').forEach((card) => {
      const partId = card.dataset.part;
      card.addEventListener('mouseenter', () => {
        if (state.mode !== 'plate') return;
        const hotspot = getHotspotForPart(partId);
        if (hotspot) hotspot.classList.add('is-hover');
      });
      card.addEventListener('mouseleave', () => {
        const hotspot = getHotspotForPart(partId);
        if (hotspot) hotspot.classList.remove('is-hover');
      });
      card.addEventListener('click', () => {
        openLightbox(card.dataset.full, card.dataset.title, card.dataset.caption);
      });
    });
  }

  function setupStage() {
    dom.stage.addEventListener('contextmenu', (e) => e.preventDefault());

    dom.stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.hotspot')) return;
      if (e.pointerType === 'mouse' && e.button === 2) {
        e.preventDefault();
        stopAuto();
        state.drag = { mode: 'pan', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startPanX: state.panX, startPanY: state.panY };
        dom.stage.classList.add('is-dragging');
        try { dom.stage.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }
      if (e.button !== 0) return;
      stopAuto();
      state.drag = {
        mode: 'rotate', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
        startView: state.mode === 'orbit' ? state.viewFloat : (presetOrbit[state.preset] ?? 0),
        pendingMode: state.mode !== 'orbit',
        moved: false,
      };
      dom.stage.classList.add('is-dragging');
      try { dom.stage.setPointerCapture(e.pointerId); } catch (err) {}
    });

    dom.stage.addEventListener('pointermove', (e) => {
      const drag = state.drag;
      if (!drag || drag.pointerId !== e.pointerId) return;
      if (drag.mode === 'pan') {
        state.panX = drag.startPanX + (e.clientX - drag.startX);
        state.panY = drag.startPanY + (e.clientY - drag.startY);
        clampPan();
        applyPlaneTransform();
        return;
      }
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        drag.moved = true;
        if (drag.pendingMode) {
          enterOrbitFromPreset();
          drag.startView = state.viewFloat;
          drag.pendingMode = false;
        }
      }
      state.viewFloat = drag.startView + dx / 78;
      state.tilt = clamp(dx / 55, -4.5, 4.5);
      renderOrbit(state.viewFloat);
      applyPlaneTransform();
    });

    const endDrag = (e) => {
      if (!state.drag || (e && e.pointerId !== state.drag.pointerId)) return;
      const drag = state.drag;
      state.drag = null;
      dom.stage.classList.remove('is-dragging');
      state.tilt = 0;
      applyPlaneTransform();
      if (drag.mode === 'rotate' && drag.moved) {
        animateViewTo(Math.round(state.viewFloat), 320);
      }
      if (drag.pointerId !== null) {
        try { dom.stage.releasePointerCapture(drag.pointerId); } catch (err) {}
      }
    };
    dom.stage.addEventListener('pointerup', endDrag);
    dom.stage.addEventListener('pointercancel', endDrag);
    dom.stage.addEventListener('lostpointercapture', endDrag);

    dom.stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      stopAuto();
      setZoom(state.zoom * Math.exp(-e.deltaY * 0.0012));
    }, { passive: false });

    dom.stage.addEventListener('dblclick', (e) => {
      if (e.target.closest('.hotspot')) return;
      stopAuto();
      if (state.zoom > 1.1) resetTransform();
      else setZoom(1.7);
    });

    dom.zoomIn.addEventListener('click', () => { stopAuto(); setZoom(state.zoom + 0.25); });
    dom.zoomOut.addEventListener('click', () => { stopAuto(); setZoom(state.zoom - 0.25); });
    dom.resetBtn.addEventListener('click', () => { stopAuto(); resetTransform(); });
    dom.autoBtn.addEventListener('click', toggleAuto);

    dom.fullBtn.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) await dom.viewer.requestFullscreen();
        else await document.exitFullscreen();
      } catch (err) {}
    });
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.lightboxOpen) { closeLightbox(); e.preventDefault(); return; }
        stopAuto();
        return;
      }
      if (e.target.matches('input, textarea, select')) return;
      if (state.lightboxOpen) return;
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowRight') {
        stopAuto();
        if (state.mode !== 'orbit') enterOrbitFromPreset();
        renderOrbit(state.viewFloat + 1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        stopAuto();
        if (state.mode !== 'orbit') enterOrbitFromPreset();
        renderOrbit(state.viewFloat - 1);
        e.preventDefault();
      } else if (e.key === '+' || e.key === '=') {
        stopAuto(); setZoom(state.zoom + 0.25); e.preventDefault();
      } else if (e.key === '-') {
        stopAuto(); setZoom(state.zoom - 0.25); e.preventDefault();
      } else if (e.key === '0') {
        stopAuto(); resetTransform();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        setPlate(presetOrder[Number(e.key) - 1]);
      } else if (key === 'g') {
        const current = state.mode === 'group' ? groupOrder.indexOf(state.group) : 0;
        setGroup(groupOrder[(current + 1) % groupOrder.length]);
      } else if (key === 'a') {
        toggleAuto();
      } else if (key === 'r') {
        focusRandomPart();
      } else if (key === 'n') {
        document.querySelector('#notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (key === 'f') {
        dom.fullBtn.click();
      }
    });
  }

  function preload() {
    const all = [
      ...orbitViews.map((v) => v.src),
      ...Object.values(plates).map((p) => p.image),
    ];
    const unique = [...new Set(all)];
    let done = 0;
    unique.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        done += 1;
        const pct = Math.round((done / unique.length) * 100);
        if (dom.loadProgress) dom.loadProgress.style.width = `${pct}%`;
        if (done >= 4) dom.stageLoader?.classList.add('is-hidden');
      };
      img.src = src;
    });
    window.setTimeout(() => dom.stageLoader?.classList.add('is-hidden'), 1200);
  }

  function init() {
    buildViewRail();
    buildPresetButtons();
    setupStage();
    setupKeyboard();
    setupGallery();
    setupNotes();
    setupPipeline();
    preload();

    dom.infoImageBtn.addEventListener('click', () => {
      openLightbox(state.currentInfo.image, state.currentInfo.title, state.currentInfo.caption);
    });
    dom.lightboxClose.addEventListener('click', closeLightbox);
    dom.lightbox.addEventListener('click', (e) => { if (e.target === dom.lightbox) closeLightbox(); });

    // initial annotated front view
    setPlate('front');
    dom.stageLoader?.classList.add('is-hidden');
  }

  init();
})();
