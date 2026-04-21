import { useState, useEffect } from 'react';
import { ConfigProvider, theme, Select, Segmented, Button, Space } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import * as Div from './utils/divination';
import ParticlesBackground from './ParticlesBackground';

function App() {
  const [time, setTime] = useState(new Date());
  const [text1, setText1] = useState('');

  // Lottery Pattern (6 historical periods + 1 target)
  const [caipiaos, setCaipiaos] = useState<{ issue: string; nums: string }[]>(
    Array(6).fill({ issue: '', nums: '' })
  );
  const [activeLotteryBtn, setActiveLotteryBtn] = useState<number[]>([0, 1, 2]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lotteryOffset, setLotteryOffset] = useState(0);

  // Parity Pattern
  const [parityNums, setParityNums] = useState(['', '', '', '', '', '', '']);
  const [parityPics, setParityPics] = useState([Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN, Div.LAOYIN]);
  const [isLotteryExpanded, setIsLotteryExpanded] = useState(true);
  const [isDivinationExpanded, setIsDivinationExpanded] = useState(true);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
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
      fetchLotteryData(lotteryOffset);
      // Set interval
      interval = setInterval(() => {
        fetchLotteryData(lotteryOffset);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoMode, sortOrder, lotteryOffset]);


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
    parityExecWithNums(newParity);
  };

  const parityExecWithNums = (nums: string[]) => {
    const pics = parityPics.map((p, i) => {
      const val = nums[i];
      if (!val) return p;
      const count = Array.from(val).filter(c => parseInt(c) % 2 !== 0).length;
      if (count === 0) return Div.LAOYIN;
      if (count === 1) return Div.YANG;
      if (count === 2) return Div.YIN;
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

  const updateParityFromCaipiaos = (records: { issue: string; nums: string }[]) => {
    const currentIdxs = activeLotteryBtn || [0, 1, 2];
    const newParity = Array(6).fill('');
    records.forEach((c, i) => {
      if (!c.nums) return;
      newParity[i] = currentIdxs.map(idx => c.nums[idx]).join('');
    });
    setParityNums(newParity);
    parityExecWithNums(newParity);
  };

  const handleSortOrderChange = (newOrder: 'desc' | 'asc') => {
    if (newOrder === sortOrder) return;
    setSortOrder(newOrder);
    if (!isAutoMode) {
      const nextCaipiaos = [...caipiaos].reverse();
      setCaipiaos(nextCaipiaos);
      updateParityFromCaipiaos(nextCaipiaos);
    }
  };

  const fetchLotteryData = async (offsetVal?: number) => {
    const currentOffset = offsetVal !== undefined ? offsetVal : lotteryOffset;
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${baseUrl}/lottery/latest?lottery_id=HN5FC&limit=6&offset=${currentOffset}`);
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
        setTimeout(() => {
          updateParityFromCaipiaos(newRecords);
        }, 0);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
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
          Segmented: { controlHeight: 32, fontSize: 13 },
          Select: { controlHeight: 32, fontSize: 13 },
          Button: { controlHeight: 32, fontSize: 13 }
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
          <motion.div id="Date" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {time.getFullYear()}年{time.getMonth() + 1}月{time.getDate()}日 {time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}:{time.getSeconds().toString().padStart(2, '0')}
          </motion.div>
        </header>

        <div className="content-wrapper">
          <AnimatePresence initial={false}>
            {isSidebarVisible && (
              <motion.aside
                className="sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ overflow: 'visible' }}
              >
                {/* 1. Lottery Mode */}
                <motion.section
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ flex: '1 1 300px', padding: '12px' }}
                >
                  <div className="card-header" onClick={() => setIsLotteryExpanded(!isLotteryExpanded)} style={{ cursor: 'pointer', marginBottom: isLotteryExpanded ? '8px' : 0 }}>
                    <span className="card-title" style={{ fontSize: '0.85rem' }}>🧩 期号定位</span>
                    {isLotteryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <AnimatePresence>
                    {isLotteryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', justifyContent: 'flex-end' }}>
                          <Space size={4}>
                            <Select
                              size="small"
                              value={isAutoMode ? 'auto' : 'manual'}
                              onChange={val => setIsAutoMode(val === 'auto')}
                              style={{ width: 75, fontSize: '11px' }}
                              options={[{ label: '手动', value: 'manual' }, { label: '自动', value: 'auto' }]}
                            />
                            <Segmented
                              size="small"
                              value={sortOrder}
                              onChange={val => handleSortOrderChange(val as any)}
                              options={[{ label: '倒', value: 'desc' }, { label: '正', value: 'asc' }]}
                            />
                            <Button size="small" style={{ fontSize: '11px', padding: '0 4px' }} onClick={() => { setLotteryOffset(lotteryOffset + 1); fetchLotteryData(lotteryOffset + 1); }}>上一期</Button>
                            {!isAutoMode && <Button type="primary" size="small" style={{ fontSize: '11px' }} onClick={() => fetchLotteryData()} loading={isLoading}>同步</Button>}
                          </Space>
                        </div>
                        <div className="lottery-layout">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {caipiaos.map((item, i) => (
                              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '70px' }}>{isAutoMode ? (item.issue || `第 ${i + 1} 期`) : `第 ${i + 1} 期`}</span>
                                <input type="text" value={item.nums} onChange={e => { const next = [...caipiaos]; next[i] = { ...next[i], nums: e.target.value }; setCaipiaos(next); }} style={{ flex: 1, padding: '6px' }} />
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

                {/* 2. Comprehensive Divination Input */}
                <motion.section
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ flex: '1 1 300px', padding: '12px' }}
                >
                  <div className="card-header" onClick={() => setIsDivinationExpanded(!isDivinationExpanded)} style={{ cursor: 'pointer', marginBottom: isDivinationExpanded ? '8px' : 0 }}>
                    <span className="card-title" style={{ fontSize: '0.85rem' }}>☯️ 综合起卦输入</span>
                    {isDivinationExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <AnimatePresence>
                    {isDivinationExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                          <div className="label" style={{ marginBottom: '6px', fontSize: '0.75rem' }}>🌓 天地数</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" value={text1} onChange={e => setText1(e.target.value)} placeholder="4位数值" style={{ flex: 1, height: '32px', fontSize: '12px' }} />
                            <button className="btn btn-primary" style={{ width: '60px', height: '32px', fontSize: '11px', padding: 0 }} onClick={handleTiandi}>起卦</button>
                          </div>
                        </div>
                        <div>
                          <div className="label" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>⚖️ 奇偶特征</div>
                          <div className="parity-grid" style={{ gap: '4px' }}>
                            {['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'].map((label, i) => (
                              <div className="yao-row" key={i} style={{ marginBottom: '2px' }}>
                                <span className="yao-label" style={{ fontSize: '11px', width: '35px' }}>{label}</span>
                                <input type="text" value={parityNums[i]} onChange={e => { const next = [...parityNums]; next[i] = e.target.value; setParityNums(next); }} style={{ height: '28px', fontSize: '12px' }} />
                                <Select
                                  size="small"
                                  value={parityPics[i]}
                                  onChange={val => { const next = [...parityPics]; next[i] = val; setParityPics(next); }}
                                  style={{ width: 85, height: '28px' }}
                                  dropdownStyle={{ minWidth: '110px' }}
                                  options={[
                                    { label: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11px' }}>{Div.LAOYIN}</span>, value: Div.LAOYIN },
                                    { label: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11px' }}>{Div.YANG}</span>, value: Div.YANG },
                                    { label: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11px' }}>{Div.YIN}</span>, value: Div.YIN },
                                    { label: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11px' }}>{Div.LAOYANG}</span>, value: Div.LAOYANG },
                                  ]}
                                />
                              </div>
                            ))}
                          </div>
                          <button className="btn btn-primary" style={{ marginTop: '10px', width: '100%', height: '32px', fontSize: '12px' }} onClick={handleParityExec}>执行成卦</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>

                {/* 3. Immediate Analysis */}
                <motion.section
                  className="card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ flex: '0 1 180px', padding: '6px 8px' }}
                >
                  <div className="card-header" onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)} style={{ cursor: 'pointer', marginBottom: isAnalysisExpanded ? '2px' : 0 }}>
                    <span className="card-title" style={{ fontSize: '0.8rem' }}>⚛️ 即时分析</span>
                    {isAnalysisExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  <AnimatePresence>
                    {isAnalysisExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center' }}>
                          {results ? (
                            <>
                              <div className="gua-card" style={{ width: '100%', padding: '0 4px', border: 'none', background: 'transparent' }}>
                                <div className="card-title" style={{ fontSize: '0.45rem', padding: '0', marginBottom: '0', opacity: 0.7, textAlign: 'left', width: '100%' }}>九宫</div>
                                <NinePalaces data={results.ninePalacesGua} isGua isCompact />
                              </div>
                              <div className="gua-card" style={{ width: '100%', padding: '0 4px', border: 'none', background: 'transparent' }}>
                                <div className="card-title" style={{ fontSize: '0.45rem', padding: '0', marginBottom: '0', opacity: 0.7, textAlign: 'left', width: '100%' }}>天干</div>
                                <NinePalaces data={results.modeTian} isCompact />
                              </div>
                            </>
                          ) : (
                            <div style={{ padding: '15px 0', color: 'var(--text-secondary)', opacity: 0.5, textAlign: 'center', fontSize: '0.7rem' }}>
                              分析待投
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              </motion.aside>
            )}
          </AnimatePresence>

          <main className="main-content">
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="card-header"><span className="card-title">⚛️ 核心排盘</span></div>
              <AnimatePresence mode="wait">
                {results ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="charts-v">
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
                    <GuaTable title="✨ 归藏" data={results.guizang} index={7} />
                    <GuaTable title="🔢 参伍倚数" data={results.yishu} index={8} />
                  </motion.div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>请输入数据并“成卦分析”以查看排盘结果</div>
                )}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}

function NinePalaces({ data, isGua, isCompact }: { data: any[], isGua?: boolean, isCompact?: boolean }) {
  return (
    <div className="box-wrap" style={{ gap: isCompact ? '1px' : '4px', padding: isCompact ? '0' : '2px', background: 'transparent' }}>
      {data.map((val, i) => (
        <div
          key={i}
          className="box"
          style={{ 
            height: isCompact ? '32px' : '60px',
            width: isCompact ? '32px' : '70px',
            fontSize: isCompact ? '11px' : '14px',
            borderRadius: isCompact ? '2px' : '4px',
            padding: isCompact ? '0' : '10px',
            border: isCompact ? '1px solid var(--border)' : 'none'
          }}
        >
          {isGua ? (
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: isCompact ? '6px' : '11px', lineHeight: 0.8 }}>
              {val.map((s: string, j: number) => <span key={j}>{s}</span>)}
            </div>
          ) : val}
        </div>
      ))}
    </div>
  );
}

function GuaTable({ title, data, symbols, upDown, index }: any) {
  const flatSymbols = symbols ? [...symbols[0], ...symbols[1]] : null;
  const flatUpDown = upDown ? [upDown[0], upDown[0], upDown[0], upDown[1], upDown[1], upDown[1]] : null;

  return (
    <motion.div
      className="gua-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index || 0) * 0.05 + 0.5 }}
      whileHover={{ y: -5, borderColor: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
    >
      <table className="table_gua">
        <thead><tr><th colSpan={flatSymbols && flatUpDown ? 2 : 1}>{title}</th></tr></thead>
        <tbody>
          {flatSymbols ? (
            flatSymbols.map((s: string, i: number) => (
              <tr key={i}>
                <td>{s}</td>
                {flatUpDown && i % 3 === 0 && (
                  <td rowSpan={3} className="up-down-row-col" style={{ color: flatUpDown[i] ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '18px', padding: '0 8px' }}>
                    {flatUpDown[i] ? '↑' : '↓'}
                  </td>
                )}
              </tr>
            ))
          ) : (
            data.map((val: any, i: number) => (<tr key={i}><td>{val}</td></tr>))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}

export default App;
