import { useState, useEffect } from 'react';
import { ConfigProvider, theme, Select, Segmented, Button, Space } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Database, 
  Fingerprint, 
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import * as Div from './utils/divination';
import ParticlesBackground from './ParticlesBackground';

function App() {
  const [time, setTime] = useState(new Date());
  const [text0, setText0] = useState('');
  const [text1, setText1] = useState('');
  const [inputType, setInputType] = useState('1');
  const [tiandiPos, setTiandiPos] = useState<number[]>([0, 1, 2, 3]);

  // Lottery Pattern (6 historical periods + 1 target)
  const [caipiaos, setCaipiaos] = useState<{ issue: string; nums: string }[]>(
    Array(6).fill({ issue: '', nums: '' })
  );
  const [targetLottery, setTargetLottery] = useState('');
  const [activeLotteryBtn, setActiveLotteryBtn] = useState<number[]>([0, 1, 2]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Parity Pattern
  const [parityNums, setParityNums] = useState(['', '', '', '', '', '', '']);
  const [parityPics, setParityPics] = useState([Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN]);
  const [isTiandiExpanded, setIsTiandiExpanded] = useState(true);
  const [isLotteryExpanded, setIsLotteryExpanded] = useState(true);
  const [isParityExpanded, setIsParityExpanded] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Results State
  const [results, setResults] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAutoMode) {
      // Initial fetch
      fetchLotteryData();
      // Set interval
      interval = setInterval(() => {
        fetchLotteryData();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoMode, sortOrder]);

  const getNumFromURL = () => {
    const str = "0123456789";
    let res = "";
    for (let i = 0; i < 5; i++) res += str[Math.floor(Math.random() * 10)];
    setText0(res);
    if (inputType === '2') {
      setText1(tiandiPos.map(idx => res[idx] || '0').join(''));
    }
  };

  useEffect(() => {
    if (inputType === '2' && text0) {
      setText1(tiandiPos.map(idx => text0[idx] || '0').join(''));
    }
  }, [tiandiPos, text0, inputType]);

  const handleTiandi = () => {
    if (!text1 || text1.length < 4) return alert("请输入4位数字");
    const bgn = [parseInt(text1[0]), parseInt(text1[1])];
    const bin = [parseInt(text1[2]), parseInt(text1[3])];

    processGua(bgn, bin);
  };

  const processGua = (bgn: number[], bin: number[]) => {
    const pg = Div.findPureGua(bgn[0], bgn[1]);
    const baseWuxing = Div.wuxingMap[pg.name];

    const bgp = Div.getPaipan(bgn, baseWuxing);
    const bip = Div.getPaipan(bin, baseWuxing);
    const fspRaw = Div.getPaipan([pg.pureGuaNum, pg.pureGuaNum], baseWuxing);

    // Filtering Fushen based on Main Paipan (bgp)
    // Rule: Hide if same Wuxing (last char of dizhi) exists in ANY of Main Paipan lines
    const wm: Record<string, string> = { "子水": "水", "丑土": "土", "寅木": "木", "卯木": "木", "辰土": "土", "巳火": "火", "午火": "火", "未土": "土", "申金": "金", "酉金": "金", "戌土": "土", "亥水": "水" };
    const bgpWuxing = bgp.map(str => {
      const match = str.match(/[子丑寅卯辰巳午未申酉戌亥][水土木火金]/);
      return match ? wm[match[0]] : '';
    });

    const fsp = fspRaw.map(str => {
      const match = str.match(/[子丑寅卯辰巳午未申酉戌亥][水土木火金]/);
      if (!match) return str;
      const fw = wm[match[0]];
      if (bgpWuxing.includes(fw)) return "__";
      return str;
    });

    const symbolsBen = [Div.symbols[bgn[0]], Div.symbols[bgn[1]]];
    const symbolsBian = [Div.symbols[bin[0]], Div.symbols[bin[1]]];

    // Up/Down
    const udb = symbolsBen.map(g => Div.yinyanggua.find(y => y.gua.every((v, i) => v === g[i]))?.up || false);
    const udbi = symbolsBian.map(g => Div.yinyanggua.find(y => y.gua.every((v, i) => v === g[i]))?.up || false);

    // Canwu
    const yygBen = symbolsBen.map(g => Div.yinyanggua.find(y => y.gua.every((v, i) => v === g[i]))!);
    const yygBian = symbolsBian.map(g => Div.yinyanggua.find(y => y.gua.every((v, i) => v === g[i]))!);

    const eqBen = yygBen[0].yang === yygBen[1].yang;
    const canwuBen = Div.canwuUp.find(c => c.yinyang_equals === eqBen && c.up0 === yygBen[0].up)?.canwu || [0, 0, 0, 0, 0];

    const eqBian = yygBian[0].yang === yygBian[1].yang;
    const canwuBian = Div.canwuUp.find(c => c.yinyang_equals === eqBian && c.up0 === yygBian[0].up)?.canwu || [0, 0, 0, 0, 0];

    const guizang = Div.calculateGuizang(symbolsBen.flat(), symbolsBian.flat());

    // Nine Palaces specialized modes
    const modeTian = Div.calculateNinePalacesMode(2, symbolsBen.flat(), symbolsBian.flat(), guizang);
    const modeDi = Div.calculateNinePalacesMode(3, symbolsBen.flat(), symbolsBian.flat(), guizang);
    const modeLuoshu = Div.calculateNinePalacesMode(5, symbolsBen.flat(), symbolsBian.flat(), guizang);
    const modeXiantian = Div.calculateNinePalacesMode(6, symbolsBen.flat(), symbolsBian.flat(), guizang);
    const yishu = Div.calculateCanwuYishu(guizang);

    // Calculate Middle Palace Guizang Symbols Specifically (Zhong Gong)
    const zgRaw = [
      [symbolsBen[0][0], symbolsBian[1][0], symbolsBen[1][0], symbolsBian[0][0]],
      [symbolsBen[0][1], symbolsBian[1][1], symbolsBen[1][1], symbolsBian[0][1]],
      [symbolsBen[0][2], symbolsBian[1][2], symbolsBen[1][2], symbolsBian[0][2]]
    ];
    const zgSymbols = zgRaw.map(l => Div.zh(l.filter(x => x === Div.YANG).length));

    const ninePalacesGua = Div.calculateNinePalacesGua(symbolsBen.flat(), symbolsBian.flat(), zgSymbols);

    const zhushu = Div.calculateZhubianshu(yygBian, canwuBen);
    const bianshu = Div.calculateZhubianshu(yygBen, canwuBian);

    setResults({
      bgn, bin, bgp, bip, fsp,
      symbolsBen, symbolsBian,
      udb, udbi,
      canwuBen, canwuBian,
      guizang,
      modeTian, modeDi, modeLuoshu, modeXiantian,
      yishu,
      ninePalacesGua,
      zhushu, bianshu
    });
  };

  const handleParityExec = () => {
    parityExecWithNums(parityNums);
  };

  const handleCaipiaohao = (idxs: number[]) => {
    setActiveLotteryBtn(idxs);
    const newParity = [...parityNums];
    caipiaos.forEach((c, i) => {
      if (!c.nums) return;
      newParity[i] = idxs.map(idx => c.nums[idx]).join('');
    });
    setParityNums(newParity);
    // 立即执行一次起卦逻辑
    parityExecWithNums(newParity);
  };

  const parityExecWithNums = (nums: string[]) => {
    const pics = parityPics.map((p, i) => {
      const val = nums[i];
      if (!val) return p;
      const count = Array.from(val).filter(c => parseInt(c) % 2 !== 0).length;
      // 模拟逻辑：基于奇数个数设置阴阳
      if (count === 0) return Div.YIN;
      if (count === 1) return Div.YANG;
      if (count === 2) return Div.LAOYIN;
      return Div.LAOYANG;
    });
    setParityPics(pics);

    const picToBen = (p: string) => (p === Div.YANG || p === Div.LAOYANG) ? Div.YANG : Div.YIN;
    const picToBian = (p: string) => (p === Div.YANG || p === Div.LAOYIN) ? Div.YANG : (p === Div.YIN || p === Div.LAOYANG) ? Div.YIN : Div.YANG;

    const bgSym = [[picToBen(pics[0]), picToBen(pics[1]), picToBen(pics[2])], [picToBen(pics[3]), picToBen(pics[4]), picToBen(pics[5])]];
    const biSym = [[picToBian(pics[0]), picToBian(pics[1]), picToBian(pics[2])], [picToBian(pics[3]), picToBian(pics[4]), picToBian(pics[5])]];

    const findNum = (g: string[]) => {
      const str = g.map(x => x === Div.YANG ? "1" : "0").join("");
      return [1, 4, 6, 7, 8, 5, 3, 2][Div.baguaBinary.indexOf(str)] || 1;
    };

    processGua([findNum(bgSym[0]), findNum(bgSym[1])], [findNum(biSym[0]), findNum(biSym[1])]);
  };

  const fetchLotteryData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${baseUrl}/lottery/latest?lottery_id=HN5FC`);
      const result = await response.json();
      if (result.data) {
        let sorted = [...result.data];
        if (sortOrder === 'asc') {
          sorted = sorted.sort((a, b) => a.Issue.localeCompare(b.Issue));
        } else {
          sorted = sorted.sort((a, b) => b.Issue.localeCompare(a.Issue));
        }

        const newRecords = sorted.slice(0, 6).map(r => ({
          issue: r.Issue,
          nums: r.Numbers.replace(/,/g, '')
        }));
        setCaipiaos(newRecords);

        // Use timeout to ensure state is committed before calculation
        setTimeout(() => {
          const currentIdxs = activeLotteryBtn || [0, 1, 2];
          const newParity = Array(6).fill('');
          newRecords.forEach((c, i) => {
            if (!c.nums) return;
            newParity[i] = currentIdxs.map(idx => c.nums[idx]).join('');
          });
          setParityNums(newParity);
          parityExecWithNums(newParity);
        }, 0);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("无法连接到 ysgo 后端接口，请检查服务是否启动。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          colorBgBase: '#0f172a',
          colorBgContainer: '#1e293b',
          controlHeight: 40,
          fontSize: 14,
        },
        components: {
          Segmented: {
            controlHeight: 32,
            fontSize: 13,
          },
          Select: {
            controlHeight: 32,
            fontSize: 13,
          },
          Button: {
            controlHeight: 32,
            fontSize: 13,
          }
        }
      }}
    >
      <ParticlesBackground />
      <div className="layout">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              type="text" 
              icon={isSidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />} 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              style={{ color: 'var(--text-secondary)' }}
            />
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              云生 <span style={{ fontSize: '0.5em', opacity: 0.6, fontWeight: 'normal' }}>| 六期成卦系统</span>
            </motion.h1>
          </div>
          <motion.div 
            id="Date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {time.getFullYear()}年{time.getMonth() + 1}月{time.getDate()}日 {time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}:{time.getSeconds().toString().padStart(2, '0')}
          </motion.div>
        </header>

        <div className="content-wrapper">
          <AnimatePresence initial={false}>
            {isSidebarVisible && (
              <motion.aside 
                className="sidebar"
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{ 
                  width: isMobile ? '100%' : 420, 
                  opacity: 1, 
                  marginRight: isMobile ? 0 : 24 
                }}
                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
          {/* Tiandi Mode */}
          <motion.section 
            className="card" 
            style={{ marginBottom: '20px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header" onClick={() => setIsTiandiExpanded(!isTiandiExpanded)} style={{ cursor: 'pointer' }}>
              <span className="card-title">🌓 天地数模式</span>
              {isTiandiExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <AnimatePresence>
              {isTiandiExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-group">
                    <label className="label">提取随机数</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input type="text" value={text0} onChange={e => setText0(e.target.value)} placeholder="数据位" style={{ flex: 1, minWidth: '120px' }} />
                      <button className="btn btn-primary" onClick={getNumFromURL} style={{ width: isMobile ? '100%' : '80px' }}>获取</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">输入模式</label>
                    <Segmented
                      block
                      value={inputType}
                      onChange={value => setInputType(value as string)}
                      options={[
                        { label: '手动输入', value: '1', icon: <Fingerprint size={14} /> },
                        { label: '联动数据', value: '2', icon: <Database size={14} /> },
                      ]}
                    />
                  </div>
                  {inputType === '2' && (
                    <div className="form-group">
                      <label className="label">定位提取 (4位)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { label: '万千百十', idxs: [0, 1, 2, 3] },
                          { label: '万千百个', idxs: [0, 1, 2, 4] },
                          { label: '千百十个', idxs: [1, 2, 3, 4] },
                          { label: '万千十个', idxs: [0, 1, 3, 4] },
                          { label: '万百十个', idxs: [0, 2, 3, 4] },
                        ].map((p, i) => (
                          <button key={i} className="btn-tool"
                            style={{
                              background: tiandiPos.join('') === p.idxs.join('') ? 'var(--primary)' : '',
                              color: tiandiPos.join('') === p.idxs.join('') ? 'white' : 'var(--text-secondary)'
                            }}
                            onClick={() => setTiandiPos(p.idxs)}>{p.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="label">转换数值</label>
                    <input type="text" value={text1} onChange={e => setText1(e.target.value)} placeholder="4位数字" disabled={inputType === '2'} />
                    <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={handleTiandi}>天地数起卦</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Lottery Mode */}
          <motion.section 
            className="card" 
            style={{ marginBottom: '20px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header" onClick={() => setIsLotteryExpanded(!isLotteryExpanded)} style={{ cursor: 'pointer' }}>
              <span className="card-title">🧩 期号定位</span>
              {isLotteryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <AnimatePresence>
              {isLotteryExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', justifyContent: 'flex-end' }}>
                    <Space size={8}>
                      <Select
                        size="small"
                        value={isAutoMode ? 'auto' : 'manual'}
                        onChange={val => setIsAutoMode(val === 'auto')}
                        style={{ width: 95 }}
                        options={[
                          { label: '手动', value: 'manual' },
                          { label: '自动同步', value: 'auto' },
                        ]}
                        popupMatchSelectWidth={false}
                      />
                      <Segmented
                        size="small"
                        value={sortOrder}
                        onChange={val => setSortOrder(val as any)}
                        options={[
                          { label: '倒', value: 'desc' },
                          { label: '正', value: 'asc' },
                        ]}
                      />
                      {!isAutoMode && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />}
                          onClick={fetchLotteryData}
                          loading={isLoading}
                        >
                          同步
                        </Button>
                      )}
                      {isAutoMode && <span className="pulse-dot" title="自动同步中"></span>}
                    </Space>
                  </div>
                  <div className="lottery-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {caipiaos.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '100px', whiteSpace: 'nowrap' }} title={item.issue}>
                            {item.issue || `第 ${i + 1} 期`}
                          </span>
                          <input type="text" value={item.nums}
                            onChange={e => {
                              const next = [...caipiaos];
                              next[i] = { ...next[i], nums: e.target.value };
                              setCaipiaos(next);
                            }}
                            placeholder="数据"
                            style={{ flex: 1, padding: '6px 8px', minWidth: '80px' }} />
                        </div>
                      ))}
                    </div>

                    <div className="lottery-btns">
                      {[
                        { label: '前三位', idxs: [0, 1, 2] },
                        { label: '万千十', idxs: [0, 1, 3] },
                        { label: '万千个', idxs: [0, 1, 4] },
                        { label: '万百十', idxs: [0, 2, 3] },
                        { label: '万百个', idxs: [0, 2, 4] },
                        { label: '万十个', idxs: [0, 3, 4] },
                        { label: '中三位', idxs: [1, 2, 3] },
                        { label: '千百个', idxs: [1, 2, 4] },
                        { label: '千十个', idxs: [1, 3, 4] },
                        { label: '后三位', idxs: [2, 3, 4] }
                      ].map((b, i) => (
                        <button key={i} className="btn-tool"
                          disabled={!caipiaos.every(v => v.nums.length >= 3)}
                          style={{
                            background: activeLotteryBtn?.join('') === b.idxs.join('') ? 'var(--primary)' : '',
                            opacity: caipiaos.every(v => v.nums.length >= 3) ? 1 : 0.4
                          }}
                          onClick={() => handleCaipiaohao(b.idxs)}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Parity Mode */}
          <motion.section 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-header" onClick={() => setIsParityExpanded(!isParityExpanded)} style={{ cursor: 'pointer' }}>
              <span className="card-title">⚖️ 奇偶特征</span>
              {isParityExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <AnimatePresence>
              {isParityExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="parity-grid">
                    {['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'].map((label, i) => (
                      <div className="yao-row" key={i}>
                        <span className="yao-label">{label}</span>
                        <input type="text" value={parityNums[i]} onChange={e => {
                          const next = [...parityNums];
                          next[i] = e.target.value;
                          setParityNums(next);
                        }} />
                        <Select
                          value={parityPics[i]}
                          onChange={val => {
                            const next = [...parityPics];
                            next[i] = val;
                            setParityPics(next);
                          }}
                          className="yao-select"
                          style={{ width: isMobile ? '100%' : 90 }}
                          options={[
                            { label: Div.LAOYIN, value: Div.LAOYIN },
                            { label: Div.YANG, value: Div.YANG },
                            { label: Div.YIN, value: Div.YIN },
                            { label: Div.LAOYANG, value: Div.LAOYANG },
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleParityExec}>执行奇偶成卦</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
          </motion.aside>
        )}
      </AnimatePresence>

        <main className="main-content">
          <motion.section 
            className="card" 
            style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="card-title">🎯 结果比对</span>
            <input type="text" value={targetLottery}
              onChange={e => setTargetLottery(e.target.value)}
              placeholder="输入目标数字"
              style={{ width: '150px', margin: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={`badge ${results?.zhushu?.includes(targetLottery) ? 'badge-active' : ''}`} style={{ width: '70px', height: '32px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>主方</div>
            <div className={`badge ${results?.bianshu?.includes(targetLottery) ? 'badge-active' : ''}`} style={{ width: '70px', height: '32px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>客方</div>
          </div>
        </motion.section>

        <motion.div 
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header"><span className="card-title">⚛️ 核心排盘</span></div>
           <AnimatePresence mode="wait">
            {results ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="charts-v"
              >
                {/* Result visualization components go here */}
                <GuaTable title="伏神" data={results.fsp} index={0} />
                <GuaTable title="本" data={results.bgp} index={1} />
                <GuaTable title="本卦" symbols={results.symbolsBen} upDown={results.udb} index={2} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <GuaTable title="主数" data={results.canwuBen} isVertical index={3} />
                  <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>{results.zhushu.join('/')}</div>
                </div>

                <GuaTable title="变" data={results.bip} index={4} />
                <GuaTable title="变卦" symbols={results.symbolsBian} upDown={results.udbi} index={5} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <GuaTable title="客数" data={results.canwuBian} isVertical index={6} />
                  <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>{results.bianshu.join('/')}</div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}
              >
                请输入数据并“成卦分析”以查看排盘结果
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="charts-v" style={{ marginTop: '24px' }}>
                  <GuaTable title="✨ 归藏" data={results.guizang} index={7} />
                  <GuaTable title="🔢 参伍倚数" data={results.yishu} index={8} />
                  <motion.div className="gua-card" whileHover={{ scale: 1.05 }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', padding: '4px' }}>🕸️ 九宫 (核心卦位)</div>
                    <NinePalaces data={results.ninePalacesGua} isGua />
                  </motion.div>
                  <motion.div className="gua-card" whileHover={{ scale: 1.05 }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', padding: '4px' }}>🕸️ 九宫 (中宫值)</div>
                    <NinePalaces data={results.modeLuoshu} />
                  </motion.div>
                </div>

                <div className="charts-v" style={{ marginTop: '24px' }}>
                  <motion.div className="gua-card" whileHover={{ scale: 1.05 }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', padding: '4px' }}>🔢 天干数</div>
                    <NinePalaces data={results.modeTian} />
                  </motion.div>
                  <motion.div className="gua-card" whileHover={{ scale: 1.05 }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', padding: '4px' }}>🔢 地支数</div>
                    <NinePalaces data={results.modeDi} />
                  </motion.div>
                  <motion.div className="gua-card" whileHover={{ scale: 1.05 }}>
                    <div className="card-title" style={{ fontSize: '0.8rem', padding: '4px' }}>🔢 先天序数</div>
                    <NinePalaces data={results.modeXiantian} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  </div>
</ConfigProvider>
  );
}

function NinePalaces({ data, isGua }: { data: any[], isGua?: boolean }) {
  return (
    <div className="box-wrap">
      {data.map((val, i) => (
        <div key={i} className="box">
          {isGua ? (
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
              {val.map((s: string, j: number) => <span key={j}>{s}</span>)}
            </div>
          ) : val}
        </div>
      ))}
    </div>
  );
}

function GuaTable({ title, data, symbols, upDown, index }: any) {
  return (
    <motion.div 
      className="gua-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index || 0) * 0.05 + 0.5 }}
      whileHover={{ y: -5, borderColor: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
    >
      <table className="table_gua">
        <thead><tr><th>{title}</th></tr></thead>
        <tbody>
          {symbols ? (
            <tr style={{ display: 'flex' }}>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {symbols[0].map((s: string, i: number) => <div key={i}>{s}</div>)}
                  {symbols[1].map((s: string, i: number) => <div key={i}>{s}</div>)}
                </div>
              </td>
              {upDown && (
                <td className="up-down-col">
                  {upDown.map((u: boolean, i: number) => <div key={i} style={{ color: u ? 'var(--danger)' : '' }}>{u ? '↑' : '↓'}</div>)}
                </td>
              )}
            </tr>
          ) : (
            data.map((val: any, i: number) => (
              <tr key={i}><td>{val}</td></tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}

export default App;
