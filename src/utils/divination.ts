// Divination Core Logic (Ported to TypeScript)

export const YIN = "▄ 　▄";
export const YANG = "▄▄▄▄";
export const LAOYIN = "×";
export const LAOYANG = "◯";

export const symbols = [
  [YIN, YIN, YIN], [YANG, YANG, YANG], [YIN, YIN, YIN], [YANG, YIN, YIN],
  [YIN, YANG, YANG], [YIN, YANG, YIN], [YANG, YIN, YANG], [YIN, YIN, YANG],
  [YANG, YANG, YIN], [YANG, YANG, YANG]
];

export const baguaBinary = ["111", "011", "101", "001", "110", "010", "100", "000"];

export const baguaNum = [
  ['9', '4', '2', '7', '8', '3', '1', '6'],
  ['1', '6', '8', '3', '2', '7', '9', '4'],
  ['1,9', '4', '6', '7', '8', '5', '3', '2,10'],
  [' ', '10', '7', '4', '5,6', '1', '2,3', '8,9'],
  ['1,3', '2', '10', '9', '4', '5', '7', '6,8'],
  ['6', '7', '9', '3', '4', '1', '8', '2'],
  ['1', '2', '3', '4', '5', '6', '7', '8'],
  ['7', '6', '4', '2', '3', '8', '1', '5']
];

export const baguaNames = ["坤", "乾", "坤", "艮", "兑", "坎", "离", "震", "巽", "乾"];

export const yinyanggua = [
  { gua: [YANG, YANG, YANG], up: true, yang: true, name: '乾' },
  { gua: [YANG, YIN, YIN], up: true, yang: true, name: '艮' },
  { gua: [YIN, YANG, YIN], up: false, yang: true, name: '坎' },
  { gua: [YIN, YIN, YANG], up: true, yang: true, name: '震' },
  { gua: [YIN, YIN, YIN], up: false, yang: false, name: '坤' },
  { gua: [YIN, YANG, YANG], up: false, yang: false, name: '兑' },
  { gua: [YANG, YIN, YANG], up: true, yang: false, name: '离' },
  { gua: [YANG, YANG, YIN], up: false, yang: false, name: '巽' }
];

export const canwuUp = [
  { yinyang_equals: false, up0: true, canwu: [5, 4, 3, 2, 1] },
  { yinyang_equals: false, up0: false, canwu: [6, 7, 8, 9, 10] },
  { yinyang_equals: true, up0: true, canwu: [9, 7, 5, 3, 1] },
  { yinyang_equals: true, up0: false, canwu: [2, 4, 6, 8, 10] }
];

export const wuxingMap: Record<string, string> = { "乾": "金", "兑": "金", "离": "火", "震": "木", "巽": "木", "坎": "水", "艮": "土", "坤": "土" };
export const baguaMap: Record<number, string> = { 0: "坤", 1: "乾", 2: "坤", 3: "艮", 4: "兑", 5: "坎", 6: "离", 7: "震", 8: "巽", 9: "乾" };
export const dizhi = ["子水", "丑土", "寅木", "卯木", "辰土", "巳火", "午火", "未土", "申金", "酉金", "戌土", "亥水"];

export const yaozhiMap: Record<string, number[]> = {
  "乾": [0, 2, 4, 6, 8, 10], "坤": [7, 5, 3, 1, 11, 9], "艮": [4, 6, 8, 10, 0, 2],
  "兑": [5, 3, 1, 11, 9, 7], "坎": [2, 4, 6, 8, 10, 0], "离": [3, 1, 11, 9, 7, 5],
  "震": [0, 2, 4, 6, 8, 10], "巽": [1, 11, 9, 7, 5, 3]
};

export const baguaTiangan: Record<string, string[]> = {
  "乾": ["甲", "甲", "甲", "壬", "壬", "壬"], "坤": ["乙", "乙", "乙", "癸", "癸", "癸"], "艮": ["丙", "丙", "丙", "丙", "丙", "丙"],
  "兑": ["丁", "丁", "丁", "丁", "丁", "丁"], "坎": ["戊", "戊", "戊", "戊", "戊", "戊"], "离": ["己", "己", "己", "己", "己", "己"],
  "震": ["庚", "庚", "庚", "庚", "庚", "庚"], "巽": ["辛", "辛", "辛", "辛", "辛", "辛"]
};

export const wuxingShengke: Record<string, string[]> = {
  "金": ["土", "水", "火", "木", "金"], "木": ["水", "火", "金", "土", "木"],
  "水": ["金", "木", "土", "火", "水"], "火": ["木", "土", "水", "金", "火"],
  "土": ["火", "金", "木", "水", "土"]
};

export const pureGuaMap = [null, 1, 3, 6, 8, 1, 6, 1, 1, 2, 4, 5, 7, 7, 4, 4, 4, 1, 3, 6, 8, 6, 6, 6, 1, 2, 4, 5, 7, 7, 7, 4, 7, 8, 3, 8, 8, 8, 6, 3, 1, 2, 5, 5, 5, 7, 5, 4, 2, 3, 3, 3, 8, 8, 6, 3, 1, 2, 2, 5, 2, 7, 5, 4, 2];

export const convertToStandardNum = (n: number) => {
  const m: Record<number, number> = { 1: 0, 9: 0, 2: 7, 0: 7, 3: 6, 4: 1, 5: 5, 6: 2, 7: 3, 8: 4 };
  return m[n] || 0;
};

export const findPureGua = (o: number, i: number) => {
  const so = convertToStandardNum(o), si = convertToStandardNum(i), idx = so * 8 + si + 1, p = pureGuaMap[idx] || 1;
  return { pureGuaNum: p, name: baguaNames[p] };
};

export const calculateLiuYao = (o: number, i: number, baseWuxing?: string) => {
  const bg = baguaMap[o] || "乾", ig = baguaMap[i] || "乾", p = findPureGua(o, i).pureGuaNum, pn = baguaNames[p], wx = baseWuxing || wuxingMap[pn];
  const yz = [yaozhiMap[ig][0], yaozhiMap[ig][1], yaozhiMap[ig][2], yaozhiMap[bg][3], yaozhiMap[bg][4], yaozhiMap[bg][5]];
  const yt = [baguaTiangan[ig][0], baguaTiangan[ig][1], baguaTiangan[ig][2], baguaTiangan[bg][3], baguaTiangan[bg][4], baguaTiangan[bg][5]];
  return yz.map((z, k) => {
    const dwx = dizhi[z].slice(-1), sk = wuxingShengke[wx];
    let rl = "兄弟";
    if (dwx === sk[0]) rl = "父母"; else if (dwx === sk[1]) rl = "子孙"; else if (dwx === sk[2]) rl = "官鬼"; else if (dwx === sk[3]) rl = "妻财";
    return { tiangan: yt[k], dizhi: dizhi[z], liuqin: rl };
  });
};

export const getPaipan = (n: number[], baseWuxing?: string) => {
  const ys = calculateLiuYao(n[0], n[1], baseWuxing);
  return ys.map(y => y.liuqin + y.tiangan + y.dizhi).reverse(); 
};

// --- New Logic for Guizang and Nine Palaces ---

export const zh = (o: number) => o % 2 > 0 ? YANG : YIN;
export const zh3 = (o: string) => o === YANG ? 1 : 0;
export const getBaguaNum = (o: string) => {
    const m: Record<string, number> = { "111": 0, "000": 7, "100": 6, "011": 1, "010": 5, "101": 2, "001": 3, "110": 4 };
    return m[o] || 0;
};

export const calculateGuizang = (vBen: string[], vBian: string[]) => {
    const b = vBen.map(zh3);
    const bi = vBian.map(zh3);
    const h1 = b[0] + bi[0] + b[3] + bi[3];
    const h2 = b[1] + bi[1] + b[4] + bi[4];
    const h3 = b[2] + bi[2] + b[5] + bi[5];
    const h4 = b[1] + bi[1] + b[2] + bi[2];
    const h5 = b[2] + bi[2] + b[3] + bi[3];
    const h6 = b[3] + bi[3] + b[4] + bi[4];
    return [h1, h2, h3, h4, h5, h6].map(zh);
};

export const calculateNinePalacesMode = (k: number, vBen: string[], vBian: string[], h: string[]) => {
    const b = vBen.map(zh3);
    const bi = vBian.map(zh3);
    const h3 = h.map(zh3);
    
    const datasets = [
        [b[1], b[2], b[3]],
        [b[0], b[1], b[2]],
        [b[2], b[3], b[4]],
        [bi[0], bi[1], bi[2]],
        [h3[0], h3[1], h3[2]],
        [bi[3], bi[4], bi[5]],
        [bi[1], bi[2], bi[3]],
        [b[3], b[4], b[5]],
        [bi[2], bi[3], bi[4]]
    ];

    return datasets.map(set => {
        const key = set.map(v => zh3(zh(v))).join('');
        return baguaNum[k][getBaguaNum(key)];
    });
};

export const bgyinyang = (o: string) => ["111", "100", "010", "001"].includes(o) ? 1 : 0;
export const shengjang = (o: string) => ["111", "100", "101", "001"].includes(o) ? 1 : 0;

export const calculateCanwuYishu = (h: string[]) => {
    const h3 = h.map(zh3);
    const s1 = shengjang(h3.slice(0, 3).join(''));
    const y1 = bgyinyang(h3.slice(0, 3).join(''));
    const y2 = bgyinyang(h3.slice(3, 6).join(''));
    const cwa = [[5, 4, 3, 2, 1], [6, 7, 8, 9, 10], [9, 7, 5, 3, 1], [2, 4, 6, 8, 10]];
    const cn = ((y1 + y2) % 2 === 0) ? (s1 === 1 ? 2 : 3) : (s1 === 1 ? 0 : 1);
    return cwa[cn];
};

export const calculateNinePalacesGua = (vBen: string[], vBian: string[], vZg: string[]) => {
    // Mapping lines (Yao) to Palaces as per original JS logic
    // vBen and vBian are arrays of 6 symbols [初...上]
    // Note: JS IDs were 1-indexed and matched Yao 1..6
    return [
       [vBen[1], vBen[2], vBen[3]], // 巽宫 (Line 2,3,4)
       [vBen[0], vBen[1], vBen[2]], // 离宫 (Line 1,2,3)
       [vBen[2], vBen[3], vBen[4]], // 坤宫 (Line 3,4,5)
       [vBian[0], vBian[1], vBian[2]], // 兑宫
       [vZg[0], vZg[1], vZg[2]],     // 中宫
       [vBian[3], vBian[4], vBian[5]], // 乾宫
       [vBian[1], vBian[2], vBian[3]], // 坎宫
       [vBen[3], vBen[4], vBen[5]],  // 艮宫
       [vBian[2], vBian[3], vBian[4]]  // 震宫
    ];
};

export const calculateZhubianshu = (yyg: any[], canwu: number[]) => {
    const r: string[] = [];
    if (yyg[0].yang || yyg[0].name === '离') {
        if (['艮', '兑', '乾'].includes(yyg[1].name)) r.push(canwu[0].toString());
        if (['坎', '离'].includes(yyg[1].name)) r.push(canwu[2].toString());
        if (['震', '巽', '坤'].includes(yyg[1].name)) r.push(canwu[4].toString());
    }
    if (!yyg[0].yang || yyg[0].name === '坎') {
        if (['乾', '震', '艮', '离'].includes(yyg[1].name)) r.push(canwu[1].toString());
        if (['坤', '巽', '兑', '坎'].includes(yyg[1].name)) r.push(canwu[3].toString());
    }
    return r;
};
