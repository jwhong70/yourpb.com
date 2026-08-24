import { createClient } from '@/lib/supabase-server';
import MacroClientPage from '../../components/MacroClientPage';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/app/actions/auth';

export const metadata: Metadata = {
  title: '글로벌 거시경제(Macro) 모니터링 - YOURPB',
  description: '글로벌 경제사이클, 경기조절자(금리/물가/유동성), 리스크 온/오프 상태 및 마켓사이클 신호를 실시간 모니터링합니다.',
};

export default async function MacroPage() {
  const supabase = await createClient();
  const user = await getSessionUser();

  // 2021-01-01 이후 데이터 쿼리
  const startDate = '2021-01-01';

  // Supabase 1000행 한도 페이징 극복을 위한 재귀적 fetchAll 헬퍼 함수
  const fetchAll = async (query: any) => {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) {
        console.error('Error fetching page:', error.message);
        break;
      }
      if (!data || data.length === 0) break;
      allData = [...allData, ...data];
      if (data.length < pageSize) break;
      page++;
    }
    return allData;
  };

  // 병렬 쿼리 수행
  const [
    weoRaw,
    oecdRaw,
    fredQRaw,
    fredWRaw,
    fredMRaw,
    indexRaw,
    fgRaw,
  ] = await Promise.all([
    fetchAll(supabase.from('macro_weo').select('*').in('ticker', [
      'g001_ngdp_rpch_a', 'usa_ngdp_rpch_a', 'kor_ngdp_rpch_a', 'kor_nid_ngdp_a',
      'kor_pcpipch_a', 'kor_ggxcnl_ngdp_a', 'kor_ggxwdg_ngdp_a', 'kor_bca_ngdpd_a',
      'chn_ngdp_rpch_a', 'chn_nid_ngdp_a', 'chn_pcpipch_a', 'chn_ggxcnl_ngdp_a',
      'chn_ggxwdg_ngdp_a', 'chn_bca_ngdpd_a'
    ]).gte('year', 2021)),

    fetchAll(supabase.from('macro_oecd_cli').select('*').in('ticker', [
      'g20', 'united_states', 'korea', 'china'
    ]).gte('date', startDate)),

    fetchAll(supabase.from('macro_fred_q').select('*').in('ticker', [
      'gdpc1', 'pcecc96', 'gpdic1', 'pnfic1', 'prfic1', 'expgsc1', 'impgsc1', 'gcec1', 'ophnfb'
    ]).gte('date', startDate)),

    fetchAll(supabase.from('macro_fred_w').select('*').in('ticker', [
      'gdpnow', 'ic4wsa', 't10y2y', 't10y3m', 'dfedtaru', 'treast', 'wcurcir',
      'rrpontsyd', 'rrpontsyaward', 'sofr', 'wtregen', 'wrbwfrbl', 'baa10y',
      'bamlh0a0hym2ey', 'compout'
    ]).gte('date', startDate)),

    fetchAll(supabase.from('macro_fred_m').select('*').in('ticker', [
      'jtsjol', 'payems', 'unrate', 'totalsl', 'rsafs', 'pce', 'indpro', 'tcu',
      'dgorder', 'mtsds133fms', 'cpiaucsl', 'cpilfesl', 'pcepi', 'pcepilfe',
      'ppifis', 'wpsfd49116', 'wm2ns', 'ttlcons', 'permit', 'houst', 'exhoslusm495s',
      'hsn1f', 'spcs20rsa'
    ]).gte('date', startDate)),

    fetchAll(supabase.from('index_prices').select('*').in('ticker', [
      '^IRX', '^TNX', '^TYX', '^VIX', 'DX-Y.NYB', 'EURUSD=X', 'JPY=X', 'CNY=X',
      'KRW=X', 'TWD=X', 'GC=F', 'MCL=F', 'HG=F', 'ZW=F', 'ZC=F', '^GSPC', '^IXIC',
      '^RUT', '^STOXX50E', '^N225', '^KS11', '000001.SS', '^HSI'
    ]).gte('date', startDate)),

    fetchAll(supabase.from('fear_greed').select('*').gte('date', startDate)),
  ]);

  // 안전장치
  const weo = weoRaw || [];
  const oecd = oecdRaw || [];
  const fredQ = fredQRaw || [];
  const fredW = fredWRaw || [];
  const fredM = fredMRaw || [];
  const indexPrices = indexRaw || [];
  const fearGreed = fgRaw || [];

  // Ticker별 Grouping Helper
  const groupByKey = <T extends { ticker?: string; year?: number; date?: string }>(
    list: T[]
  ): Record<string, T[]> => {
    const acc: Record<string, T[]> = {};
    for (const item of list) {
      const ticker = item.ticker || 'default';
      if (!acc[ticker]) acc[ticker] = [];
      acc[ticker].push(item);
    }
    return acc;
  };

  const weoGroups = groupByKey(weo);
  const oecdGroups = groupByKey(oecd);
  const fredQGroups = groupByKey(fredQ);
  const fredWGroups = groupByKey(fredW);
  const fredMGroups = groupByKey(fredM);
  const indexGroups = groupByKey(indexPrices);

  // 날짜/연도순 오름차순 정렬 Helper
  const sortData = <T extends { date?: string; year?: number }>(list: T[]): T[] => {
    return [...list].sort((a, b) => {
      if (a.year && b.year) return a.year - b.year;
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeA - timeB;
    });
  };

  // null이 아닌 최근 유효 데이터 찾기 Helper
  const getLastValid = <T extends Record<string, any>>(
    list: T[],
    keys: (keyof T)[]
  ): T | null => {
    const sorted = sortData(list);
    for (let i = sorted.length - 1; i >= 0; i--) {
      const item = sorted[i];
      const isValid = keys.every(
        (key) => item[key] !== null && item[key] !== undefined
      );
      if (isValid) return item;
    }
    return null;
  };

  // ----------------------------------------------------
  // 각 지표별 신호 및 차트 데이터 가공
  // ----------------------------------------------------

  // 1.1.1. 세계 GDP
  const w_gdp_imf = sortData(weoGroups['g001_ngdp_rpch_a'] || []);
  const w_gdp_oecd = sortData(oecdGroups['g20'] || []);

  // 1.1.2. 미국 GDP
  const us_gdp_imf = sortData(weoGroups['usa_ngdp_rpch_a'] || []);
  
  const us_gdp_q = sortData(fredQGroups['gdpc1'] || []);
  const us_gdp_q_val = getLastValid(us_gdp_q, ['yoy_pct']);
  const us_gdp_q_sig = us_gdp_q_val ? (us_gdp_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_pce_q = sortData(fredQGroups['pcecc96'] || []);
  const us_pce_q_val = getLastValid(us_pce_q, ['yoy_pct']);
  const us_pce_q_sig = us_pce_q_val ? (us_pce_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_gpdi_q = sortData(fredQGroups['gpdic1'] || []);
  const us_gpdi_q_val = getLastValid(us_gpdi_q, ['yoy_pct']);
  const us_gpdi_q_sig = us_gpdi_q_val ? (us_gpdi_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_pnfi_q = sortData(fredQGroups['pnfic1'] || []);
  const us_pnfi_q_val = getLastValid(us_pnfi_q, ['yoy_pct']);
  const us_pnfi_q_sig = us_pnfi_q_val ? (us_pnfi_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_prfi_q = sortData(fredQGroups['prfic1'] || []);
  const us_prfi_q_val = getLastValid(us_prfi_q, ['yoy_pct']);
  const us_prfi_q_sig = us_prfi_q_val ? (us_prfi_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_exp_q = sortData(fredQGroups['expgsc1'] || []);
  const us_exp_q_val = getLastValid(us_exp_q, ['yoy_pct']);
  const us_exp_q_sig = us_exp_q_val ? (us_exp_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_imp_q = sortData(fredQGroups['impgsc1'] || []);
  const us_imp_q_val = getLastValid(us_imp_q, ['yoy_pct']);
  const us_imp_q_sig = us_imp_q_val ? (us_imp_q_val.yoy_pct <= 0 ? 1 : -1) : null; // 수입은 감소가 호재

  const us_gov_q = sortData(fredQGroups['gcec1'] || []);
  const us_gov_q_val = getLastValid(us_gov_q, ['yoy_pct']);
  const us_gov_q_sig = us_gov_q_val ? (us_gov_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_prod_q = sortData(fredQGroups['ophnfb'] || []);
  const us_prod_q_val = getLastValid(us_prod_q, ['yoy_pct']);
  const us_prod_q_sig = us_prod_q_val ? (us_prod_q_val.yoy_pct >= 0 ? 1 : -1) : null;

  const us_gdp_oecd = sortData(oecdGroups['united_states'] || []);

  const gdpnow = sortData(fredWGroups['gdpnow'] || []);
  const gdpnow_val = getLastValid(gdpnow, ['yield_4w', 'yield_52w']);
  const gdpnow_sig = gdpnow_val
    ? {
        prev: gdpnow_val.yield_4w >= 0 ? 1 : -1,
        yoy: gdpnow_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.1.3. 한국 GDP
  const kr_gdp_imf = sortData(weoGroups['kor_ngdp_rpch_a'] || []);
  const kr_inv_imf = sortData(weoGroups['kor_nid_ngdp_a'] || []);
  const kr_cpi_imf = sortData(weoGroups['kor_pcpipch_a'] || []);
  const kr_bal_imf = sortData(weoGroups['kor_ggxcnl_ngdp_a'] || []);
  const kr_debt_imf = sortData(weoGroups['kor_ggxwdg_ngdp_a'] || []);
  const kr_ca_imf = sortData(weoGroups['kor_bca_ngdpd_a'] || []);
  const kr_gdp_oecd = sortData(oecdGroups['korea'] || []);

  // 1.1.4. 중국 GDP
  const cn_gdp_imf = sortData(weoGroups['chn_ngdp_rpch_a'] || []);
  const cn_inv_imf = sortData(weoGroups['chn_nid_ngdp_a'] || []);
  const cn_cpi_imf = sortData(weoGroups['chn_pcpipch_a'] || []);
  const cn_bal_imf = sortData(weoGroups['chn_ggxcnl_ngdp_a'] || []);
  const cn_debt_imf = sortData(weoGroups['chn_ggxwdg_ngdp_a'] || []);
  const cn_ca_imf = sortData(weoGroups['chn_bca_ngdpd_a'] || []);
  const cn_gdp_oecd = sortData(oecdGroups['china'] || []);

  // ------------------ 1.2. 소비 ------------------
  // 1.2.1. 신규 실업수당 청구건수(4주평균)
  const ic4wsa = sortData(fredWGroups['ic4wsa'] || []);
  const ic4wsa_val = getLastValid(ic4wsa, ['yield_4w', 'yield_52w']);
  const ic4wsa_sig = ic4wsa_val
    ? {
        prev: ic4wsa_val.yield_4w <= 0 ? 1 : -1,
        yoy: ic4wsa_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.2. 구인건수(JOLTS)
  const jtsjol = sortData(fredMGroups['jtsjol'] || []);
  const jtsjol_val = getLastValid(jtsjol, ['mom_pct', 'yoy_pct']);
  const jtsjol_sig = jtsjol_val
    ? {
        prev: jtsjol_val.mom_pct >= 0 ? 1 : -1,
        yoy: jtsjol_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.3. 비농업 부문 고용자수
  const payems = sortData(fredMGroups['payems'] || []);
  const payems_val = getLastValid(payems, ['mom_pct', 'yoy_pct']);
  const payems_sig = payems_val
    ? {
        prev: payems_val.mom_pct >= 0 ? 1 : -1,
        yoy: payems_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.4. 실업률
  const unrate = sortData(fredMGroups['unrate'] || []);
  const unrate_val = getLastValid(unrate, ['mom_pct', 'yoy_pct']);
  const unrate_sig = unrate_val
    ? {
        prev: unrate_val.mom_pct <= 0 ? 1 : -1,
        yoy: unrate_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.5. 총 소비자신용
  const totalsl = sortData(fredMGroups['totalsl'] || []);
  const totalsl_val = getLastValid(totalsl, ['mom_pct', 'yoy_pct']);
  const totalsl_sig = totalsl_val
    ? {
        prev: totalsl_val.mom_pct >= 0 ? 1 : -1,
        yoy: totalsl_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.6. 소매판매
  const rsafs = sortData(fredMGroups['rsafs'] || []);
  const rsafs_val = getLastValid(rsafs, ['mom_pct', 'yoy_pct']);
  const rsafs_sig = rsafs_val
    ? {
        prev: rsafs_val.mom_pct >= 0 ? 1 : -1,
        yoy: rsafs_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.2.7. 개인 소비지출
  const pce = sortData(fredMGroups['pce'] || []);
  const pce_val = getLastValid(pce, ['mom_pct', 'yoy_pct']);
  const pce_sig = pce_val
    ? {
        prev: pce_val.mom_pct >= 0 ? 1 : -1,
        yoy: pce_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 1.3. 생산 ------------------
  // 1.3.1. 산업생산지수
  const indpro = sortData(fredMGroups['indpro'] || []);
  const indpro_val = getLastValid(indpro, ['mom_pct', 'yoy_pct']);
  const indpro_sig = indpro_val
    ? {
        prev: indpro_val.mom_pct >= 0 ? 1 : -1,
        yoy: indpro_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.3.2. 전체 산업가동률
  const tcu = sortData(fredMGroups['tcu'] || []);
  const tcu_val = getLastValid(tcu, ['mom_pct', 'yoy_pct']);
  const tcu_sig = tcu_val
    ? {
        prev: tcu_val.mom_pct >= 0 ? 1 : -1,
        yoy: tcu_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 1.3.3. 내구재 신규주문
  const dgorder = sortData(fredMGroups['dgorder'] || []);
  const dgorder_val = getLastValid(dgorder, ['mom_pct', 'yoy_pct']);
  const dgorder_sig = dgorder_val
    ? {
        prev: dgorder_val.mom_pct >= 0 ? 1 : -1,
        yoy: dgorder_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 2.1. 금리 ------------------
  // 2.1.1. 미국 연방기금금리 목표범위 상단
  const dfedtaru = sortData(fredWGroups['dfedtaru'] || []);
  const dfedtaru_val = getLastValid(dfedtaru, ['yield_4w', 'yield_52w']);
  const dfedtaru_sig = dfedtaru_val
    ? {
        prev: dfedtaru_val.yield_4w <= 0 ? 1 : -1,
        yoy: dfedtaru_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.1.2. 미국 3개월 단기 국채수익률
  const irx = sortData(indexGroups['^IRX'] || []);
  const irx_val = getLastValid(irx, ['yield_4w', 'yield_52w']);
  const irx_sig = irx_val
    ? {
        prev: irx_val.yield_4w <= 0 ? 1 : -1,
        yoy: irx_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.1.3. 미국 10년물 국채수익률
  const tnx = sortData(indexGroups['^TNX'] || []);
  const tnx_val = getLastValid(tnx, ['yield_4w', 'yield_52w']);
  const tnx_sig = tnx_val
    ? {
        prev: tnx_val.yield_4w <= 0 ? 1 : -1,
        yoy: tnx_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.1.4. 미국 30년물 국채수익률
  const tyx = sortData(indexGroups['^TYX'] || []);
  const tyx_val = getLastValid(tyx, ['yield_4w', 'yield_52w']);
  const tyx_sig = tyx_val
    ? {
        prev: tyx_val.yield_4w <= 0 ? 1 : -1,
        yoy: tyx_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.1.5. 미국 국채 10년물 - 2년물 금리차
  const t10y2y = sortData(fredWGroups['t10y2y'] || []);

  // 2.1.6. 미국 국채 10년물 - 3개월물 금리차
  const t10y3m = sortData(fredWGroups['t10y3m'] || []);

  // ------------------ 2.2. 유동성 ------------------
  // 2.2.1. 연방준비제도 총자산
  const treast = sortData(fredWGroups['treast'] || []);
  const treast_val = getLastValid(treast, ['yield_4w', 'yield_52w']);
  const treast_sig = treast_val
    ? {
        prev: treast_val.yield_4w >= 0 ? 1 : -1,
        yoy: treast_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.2. 연준 보유 MBS (동일 티커 wcurcir 적용)
  const mbs = sortData(fredWGroups['wcurcir'] || []);
  const mbs_val = getLastValid(mbs, ['yield_4w', 'yield_52w']);
  const mbs_sig = mbs_val
    ? {
        prev: mbs_val.yield_4w >= 0 ? 1 : -1,
        yoy: mbs_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.3. 화폐발행액(유통화폐)
  const wcurcir = sortData(fredWGroups['wcurcir'] || []);
  const wcurcir_val = getLastValid(wcurcir, ['yield_4w', 'yield_52w']);
  const wcurcir_sig = wcurcir_val
    ? {
        prev: wcurcir_val.yield_4w >= 0 ? 1 : -1,
        yoy: wcurcir_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.4. 역레포 거래총액
  const rrpontsyd = sortData(fredWGroups['rrpontsyd'] || []);
  const rrpontsyd_val = getLastValid(rrpontsyd, ['yield_4w', 'yield_52w']);
  const rrpontsyd_sig = rrpontsyd_val
    ? {
        prev: rrpontsyd_val.yield_4w >= 0 ? 1 : -1,
        yoy: rrpontsyd_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.5. 역레포 응찰금리
  const rrpontsyaward = sortData(fredWGroups['rrpontsyaward'] || []);
  // 2.2.6. SOFR
  const sofr = sortData(fredWGroups['sofr'] || []);

  // 2.2.7. 재무부 일반계정잔액(TGA)
  const wtregen = sortData(fredWGroups['wtregen'] || []);
  const wtregen_val = getLastValid(wtregen, ['yield_4w', 'yield_52w']);
  const wtregen_sig = wtregen_val
    ? {
        prev: wtregen_val.yield_4w >= 0 ? 1 : -1,
        yoy: wtregen_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.8. 연준 예치 지급준비금
  const wrbwfrbl = sortData(fredWGroups['wrbwfrbl'] || []);
  const wrbwfrbl_val = getLastValid(wrbwfrbl, ['yield_4w', 'yield_52w']);
  const wrbwfrbl_sig = wrbwfrbl_val
    ? {
        prev: wrbwfrbl_val.yield_4w >= 0 ? 1 : -1,
        yoy: wrbwfrbl_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.2.9. 미국 연방정부 재정수지
  const mtsds = sortData(fredMGroups['mtsds133fms'] || []);
  const mtsds_val = getLastValid(mtsds, ['mom_pct', 'yoy_pct']);
  const mtsds_sig = mtsds_val
    ? {
        prev: mtsds_val.mom_pct <= 0 ? 1 : -1,
        yoy: mtsds_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 2.3. 물가 ------------------
  // 2.3.1. 헤드라인 CPI
  const cpiaucsl = sortData(fredMGroups['cpiaucsl'] || []);
  const cpiaucsl_val = getLastValid(cpiaucsl, ['mom_pct', 'yoy_pct']);
  const cpiaucsl_sig = cpiaucsl_val
    ? {
        prev: cpiaucsl_val.mom_pct <= 0 ? 1 : -1,
        yoy: cpiaucsl_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.3.2. Core CPI
  const cpilfesl = sortData(fredMGroups['cpilfesl'] || []);
  const cpilfesl_val = getLastValid(cpilfesl, ['mom_pct', 'yoy_pct']);
  const cpilfesl_sig = cpilfesl_val
    ? {
        prev: cpilfesl_val.mom_pct <= 0 ? 1 : -1,
        yoy: cpilfesl_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.3.3. PCE 물가지수
  const pcepi = sortData(fredMGroups['pcepi'] || []);
  const pcepi_val = getLastValid(pcepi, ['mom_pct', 'yoy_pct']);
  const pcepi_sig = pcepi_val
    ? {
        prev: pcepi_val.mom_pct <= 0 ? 1 : -1,
        yoy: pcepi_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.3.4. Core PCE
  const pcepilfe = sortData(fredMGroups['pcepilfe'] || []);
  const pcepilfe_val = getLastValid(pcepilfe, ['mom_pct', 'yoy_pct']);
  const pcepilfe_sig = pcepilfe_val
    ? {
        prev: pcepilfe_val.mom_pct <= 0 ? 1 : -1,
        yoy: pcepilfe_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.3.5. 최종 수요 PPI
  const ppifis = sortData(fredMGroups['ppifis'] || []);
  const ppifis_val = getLastValid(ppifis, ['mom_pct', 'yoy_pct']);
  const ppifis_sig = ppifis_val
    ? {
        prev: ppifis_val.mom_pct <= 0 ? 1 : -1,
        yoy: ppifis_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 2.3.6. Core PPI
  const wpsfd = sortData(fredMGroups['wpsfd49116'] || []);
  const wpsfd_val = getLastValid(wpsfd, ['mom_pct', 'yoy_pct']);
  const wpsfd_sig = wpsfd_val
    ? {
        prev: wpsfd_val.mom_pct <= 0 ? 1 : -1,
        yoy: wpsfd_val.yoy_pct <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 3.1. 리스크 ------------------
  // 3.1.1. CNN 공포/탐욕지수 (fear_greed)
  const fgSorted = sortData(fearGreed);
  const fg_val = fgSorted.length > 0 ? fgSorted[fgSorted.length - 1] : null;
  
  // 1년전 데이터 찾기
  let fg_1y_prev = null;
  if (fg_val) {
    const targetDate = new Date(fg_val.date);
    targetDate.setFullYear(targetDate.getFullYear() - 1);
    // 가장 가까운 날짜 찾기
    let minDist = Infinity;
    for (const d of fgSorted) {
      const dist = Math.abs(new Date(d.date).getTime() - targetDate.getTime());
      if (dist < minDist) {
        minDist = dist;
        fg_1y_prev = d;
      }
    }
    // 30일 이내 오차 범위만 인정, 아니면 null
    if (minDist > 30 * 24 * 60 * 60 * 1000) {
      fg_1y_prev = null;
    }
  }

  // rating 등급 판별: greed, neutral, fear 등 소문자 비교
  const getRatingSignal = (ratingStr: string | null): number => {
    if (!ratingStr) return 0;
    const r = ratingStr.toLowerCase();
    if (r.includes('greed')) return 1;
    if (r.includes('fear')) return -1;
    return 0;
  };

  const fg_sig = fg_val
    ? {
        prev: null,
        yoy: null,
        rating: fg_val.rating || 'neutral',
        score: fg_val.score !== undefined ? fg_val.score : 50,
        isText: true,
      }
    : { prev: null, yoy: null, rating: 'neutral', score: 50, isText: true };

  // 3.1.2. CBOE 변동성 지수(VIX)
  const vix = sortData(indexGroups['^VIX'] || []);
  const vix_val = getLastValid(vix, ['yield_4w', 'yield_52w']);
  const vix_sig = vix_val
    ? {
        prev: vix_val.yield_4w <= 0 ? 1 : -1,
        yoy: vix_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 3.2. 통화 ------------------
  // 3.2.1. 달러 인덱스(DXY)
  const dxy = sortData(indexGroups['DX-Y.NYB'] || []);
  const dxy_val = getLastValid(dxy, ['yield_4w', 'yield_52w']);
  const dxy_sig = dxy_val
    ? {
        prev: dxy_val.yield_4w >= 0 ? 1 : -1,
        yoy: dxy_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.2.2. 미국 국채 10년물 - 3개월물 금리차 (동일 티커 t10y3m 적용)
  const t10y3m_currency = sortData(fredWGroups['t10y3m'] || []);

  // 3.2.3. 유로/달러 환율
  const eurusd = sortData(indexGroups['EURUSD=X'] || []);
  const eurusd_val = getLastValid(eurusd, ['yield_4w', 'yield_52w']);
  const eurusd_sig = eurusd_val
    ? {
        prev: eurusd_val.yield_4w >= 0 ? 1 : -1,
        yoy: eurusd_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.2.4. 달러/엔 환율
  const usdjpy = sortData(indexGroups['JPY=X'] || []);
  const usdjpy_val = getLastValid(usdjpy, ['yield_4w', 'yield_52w']);
  const usdjpy_sig = usdjpy_val
    ? {
        prev: usdjpy_val.yield_4w <= 0 ? 1 : -1,
        yoy: usdjpy_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.2.5. 달러/위안 환율
  const usdchn = sortData(indexGroups['CNY=X'] || []);
  const usdchn_val = getLastValid(usdchn, ['yield_4w', 'yield_52w']);
  const usdchn_sig = usdchn_val
    ? {
        prev: usdchn_val.yield_4w <= 0 ? 1 : -1,
        yoy: usdchn_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.2.6. 달러/원 환율
  const usdkrw = sortData(indexGroups['KRW=X'] || []);
  const usdkrw_val = getLastValid(usdkrw, ['yield_4w', 'yield_52w']);
  const usdkrw_sig = usdkrw_val
    ? {
        prev: usdkrw_val.yield_4w <= 0 ? 1 : -1,
        yoy: usdkrw_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.2.7. 달러/대만달러 환율
  const usdtwd = sortData(indexGroups['TWD=X'] || []);
  const usdtwd_val = getLastValid(usdtwd, ['yield_4w', 'yield_52w']);
  const usdtwd_sig = usdtwd_val
    ? {
        prev: usdtwd_val.yield_4w <= 0 ? 1 : -1,
        yoy: usdtwd_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 3.3. 상품 ------------------
  // 3.3.1. 금 선물
  const gold_fut = sortData(indexGroups['GC=F'] || []);
  const gold_fut_val = getLastValid(gold_fut, ['yield_4w', 'yield_52w']);
  const gold_fut_sig = gold_fut_val
    ? {
        prev: gold_fut_val.yield_4w >= 0 ? 1 : -1,
        yoy: gold_fut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.3.2. WTI 원유 선물
  const wti_fut = sortData(indexGroups['MCL=F'] || []);
  const wti_fut_val = getLastValid(wti_fut, ['yield_4w', 'yield_52w']);
  const wti_fut_sig = wti_fut_val
    ? {
        prev: wti_fut_val.yield_4w >= 0 ? 1 : -1,
        yoy: wti_fut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.3.3. 구리 선물
  const copper_fut = sortData(indexGroups['HG=F'] || []);
  const copper_fut_val = getLastValid(copper_fut, ['yield_4w', 'yield_52w']);
  const copper_fut_sig = copper_fut_val
    ? {
        prev: copper_fut_val.yield_4w >= 0 ? 1 : -1,
        yoy: copper_fut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.3.4. 밀 선물
  const wheat_fut = sortData(indexGroups['ZW=F'] || []);
  const wheat_fut_val = getLastValid(wheat_fut, ['yield_4w', 'yield_52w']);
  const wheat_fut_sig = wheat_fut_val
    ? {
        prev: wheat_fut_val.yield_4w >= 0 ? 1 : -1,
        yoy: wheat_fut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 3.3.5. 옥수수 선물
  const corn_fut = sortData(indexGroups['ZC=F'] || []);
  const corn_fut_val = getLastValid(corn_fut, ['yield_4w', 'yield_52w']);
  const corn_fut_sig = corn_fut_val
    ? {
        prev: corn_fut_val.yield_4w >= 0 ? 1 : -1,
        yoy: corn_fut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 4.1. 주식사이클 ------------------
  // 4.1.1. S&P 500 지수
  const spx = sortData(indexGroups['^GSPC'] || []);
  const spx_val = getLastValid(spx, ['yield_4w', 'yield_52w']);
  const spx_sig = spx_val
    ? {
        prev: spx_val.yield_4w >= 0 ? 1 : -1,
        yoy: spx_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.2. 나스닥 종합 지수
  const ixic = sortData(indexGroups['^IXIC'] || []);
  const ixic_val = getLastValid(ixic, ['yield_4w', 'yield_52w']);
  const ixic_sig = ixic_val
    ? {
        prev: ixic_val.yield_4w >= 0 ? 1 : -1,
        yoy: ixic_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.3. 러셀 2000 지수
  const rut = sortData(indexGroups['^RUT'] || []);
  const rut_val = getLastValid(rut, ['yield_4w', 'yield_52w']);
  const rut_sig = rut_val
    ? {
        prev: rut_val.yield_4w >= 0 ? 1 : -1,
        yoy: rut_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.4. 유로 스톡스 50 지수
  const stoxx = sortData(indexGroups['^STOXX50E'] || []);
  const stoxx_val = getLastValid(stoxx, ['yield_4w', 'yield_52w']);
  const stoxx_sig = stoxx_val
    ? {
        prev: stoxx_val.yield_4w >= 0 ? 1 : -1,
        yoy: stoxx_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.5. 닛케이 225 지수
  const n225 = sortData(indexGroups['^N225'] || []);
  const n225_val = getLastValid(n225, ['yield_4w', 'yield_52w']);
  const n225_sig = n225_val
    ? {
        prev: n225_val.yield_4w >= 0 ? 1 : -1,
        yoy: n225_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.6. 코스피 지수
  const kospi = sortData(indexGroups['^KS11'] || []);
  const kospi_val = getLastValid(kospi, ['yield_4w', 'yield_52w']);
  const kospi_sig = kospi_val
    ? {
        prev: kospi_val.yield_4w >= 0 ? 1 : -1,
        yoy: kospi_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.7. 상하이 종합 지수
  const ssec = sortData(indexGroups['000001.SS'] || []);
  const ssec_val = getLastValid(ssec, ['yield_4w', 'yield_52w']);
  const ssec_sig = ssec_val
    ? {
        prev: ssec_val.yield_4w >= 0 ? 1 : -1,
        yoy: ssec_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.1.8. 항셍 지수
  const hsi = sortData(indexGroups['^HSI'] || []);
  const hsi_val = getLastValid(hsi, ['yield_4w', 'yield_52w']);
  const hsi_sig = hsi_val
    ? {
        prev: hsi_val.yield_4w >= 0 ? 1 : -1,
        yoy: hsi_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 4.2. 신용사이클 ------------------
  // 4.2.1. Baa 회사채 - 10년물 국채 스프레드
  const baa10y = sortData(fredWGroups['baa10y'] || []);
  const baa10y_val = getLastValid(baa10y, ['yield_4w', 'yield_52w']);
  const baa10y_sig = baa10y_val
    ? {
        prev: baa10y_val.yield_4w <= 0 ? 1 : -1,
        yoy: baa10y_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.2.2. ICE BofA 미국 하이일드 채권 실효수익률
  const hy = sortData(fredWGroups['bamlh0a0hym2ey'] || []);
  const hy_val = getLastValid(hy, ['yield_4w', 'yield_52w']);
  const hy_sig = hy_val
    ? {
        prev: hy_val.yield_4w <= 0 ? 1 : -1,
        yoy: hy_val.yield_52w <= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.2.3. 기업어음(CP) 발행 잔액
  const cp = sortData(fredWGroups['compout'] || []);
  const cp_val = getLastValid(cp, ['yield_4w', 'yield_52w']);
  const cp_sig = cp_val
    ? {
        prev: cp_val.yield_4w >= 0 ? 1 : -1,
        yoy: cp_val.yield_52w >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.2.4. 통화량(M2)
  const m2 = sortData(fredMGroups['wm2ns'] || []);
  const m2_val = getLastValid(m2, ['mom_pct', 'yoy_pct']);
  const m2_sig = m2_val
    ? {
        prev: m2_val.mom_pct >= 0 ? 1 : -1,
        yoy: m2_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ------------------ 4.3. 부동산사이클 ------------------
  // 4.3.1. 총 건설지출액
  const ttlcons = sortData(fredMGroups['ttlcons'] || []);
  const ttlcons_val = getLastValid(ttlcons, ['mom_pct', 'yoy_pct']);
  const ttlcons_sig = ttlcons_val
    ? {
        prev: ttlcons_val.mom_pct >= 0 ? 1 : -1,
        yoy: ttlcons_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.3.2. 신규주택 건축허가건수
  const permit = sortData(fredMGroups['permit'] || []);
  const permit_val = getLastValid(permit, ['mom_pct', 'yoy_pct']);
  const permit_sig = permit_val
    ? {
        prev: permit_val.mom_pct >= 0 ? 1 : -1,
        yoy: permit_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.3.3. 신규주택 착공건수
  const houst = sortData(fredMGroups['houst'] || []);
  const houst_val = getLastValid(houst, ['mom_pct', 'yoy_pct']);
  const houst_sig = houst_val
    ? {
        prev: houst_val.mom_pct >= 0 ? 1 : -1,
        yoy: houst_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.3.4. 기존주택 매매건수
  const exhos = sortData(fredMGroups['exhoslusm495s'] || []);
  const exhos_val = getLastValid(exhos, ['mom_pct', 'yoy_pct']);
  const exhos_sig = exhos_val
    ? {
        prev: exhos_val.mom_pct >= 0 ? 1 : -1,
        yoy: exhos_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.3.5. 신규단독주택 판매건수
  const hsn1f = sortData(fredMGroups['hsn1f'] || []);
  const hsn1f_val = getLastValid(hsn1f, ['mom_pct', 'yoy_pct']);
  const hsn1f_sig = hsn1f_val
    ? {
        prev: hsn1f_val.mom_pct >= 0 ? 1 : -1,
        yoy: hsn1f_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // 4.3.6. S&P 케이스-실러 주택가격지수
  const spcs = sortData(fredMGroups['spcs20rsa'] || []);
  const spcs_val = getLastValid(spcs, ['mom_pct', 'yoy_pct']);
  const spcs_sig = spcs_val
    ? {
        prev: spcs_val.mom_pct >= 0 ? 1 : -1,
        yoy: spcs_val.yoy_pct >= 0 ? 1 : -1,
      }
    : { prev: null, yoy: null };

  // ----------------------------------------------------
  // 상위 노드들 신호 결합 연산 (MOM / YOY)
  // ----------------------------------------------------
  const calcCombined = (signals: { prev: number | null; yoy: number | null }[]) => {
    const validPrev = signals.map((s) => s.prev).filter((v): v is number => v !== null);
    const validYoy = signals.map((s) => s.yoy).filter((v): v is number => v !== null);

    const prevMean = validPrev.length > 0 ? validPrev.reduce((a, b) => a + b, 0) / validPrev.length : null;
    const yoyMean = validYoy.length > 0 ? validYoy.reduce((a, b) => a + b, 0) / validYoy.length : null;

    return {
      prev: prevMean !== null ? (prevMean >= 0 ? 1 : -1) : null,
      yoy: yoyMean !== null ? (yoyMean >= 0 ? 1 : -1) : null,
    };
  };

  // 1.1. GDP 신호 = 미국 GDP 신호
  const sub_gdp_sig = { ...gdpnow_sig };

  // 1.2. 소비 신호
  const sub_cons_sig = calcCombined([
    ic4wsa_sig,
    payems_sig,
    unrate_sig,
    rsafs_sig,
    pce_sig,
  ]);

  // 1.3. 생산 신호
  const sub_prod_sig = calcCombined([
    indpro_sig,
    tcu_sig,
    dgorder_sig,
  ]);

  // 1. 경제사이클 신호 = 1.1. 신호 + 1.2. 신호 + 1.3. 신호
  const main_economic_sig = calcCombined([
    sub_gdp_sig,
    sub_cons_sig,
    sub_prod_sig,
  ]);

  // 2.1. 금리 신호
  const sub_interest_sig = calcCombined([
    irx_sig,
    tnx_sig,
    tyx_sig,
  ]);

  // 2.2. 유동성 신호
  const sub_liq_sig = calcCombined([
    treast_sig,
    mbs_sig,
    wcurcir_sig,
    wtregen_sig,
    wrbwfrbl_sig,
  ]);

  // 2.3. 물가 신호
  const sub_price_sig = calcCombined([
    cpilfesl_sig,
    pcepilfe_sig,
    wpsfd_sig,
  ]);

  // 2. 경기조절자 신호 = 2.1. 신호 + 2.2. 신호 + 2.3. 신호
  const main_regulator_sig = calcCombined([
    sub_interest_sig,
    sub_liq_sig,
    sub_price_sig,
  ]);

  // 3.1. 리스크 신호 = 3.1.1. 신호 (공포탐욕)
  const sub_risk_sig = { ...fg_sig };

  // 3.2. 통화 신호 = 3.2.1. 신호
  const sub_curr_sig = { ...dxy_sig };

  // 3.3. 상품 신호
  const sub_comm_sig = calcCombined([
    gold_fut_sig,
    wti_fut_sig,
    copper_fut_sig,
  ]);

  // 3. 리스크에 대한 태도 신호 = 3.1. 신호
  const main_risk_attitude_sig = { ...sub_risk_sig };

  // 4.1. 주식사이클 신호
  const sub_stock_sig = calcCombined([
    spx_sig,
    ixic_sig,
    kospi_sig,
  ]);

  // 4.2. 신용사이클 신호
  const sub_credit_sig = calcCombined([
    baa10y_sig,
    hy_sig,
    cp_sig,
    m2_sig,
  ]);

  // 4.3. 부동산사이클 신호
  const sub_real_estate_sig = calcCombined([
    permit_sig,
    houst_sig,
    exhos_sig,
    hsn1f_sig,
  ]);

  // 4. 마켓사이클 신호 = 4.1. 신호 + 4.2. 신호 + 4.3. 신호
  const main_market_sig = calcCombined([
    sub_stock_sig,
    sub_credit_sig,
    sub_real_estate_sig,
  ]);

  // 클라이언트에 내려줄 데이터 구조화
  const dashboardData = {
    // 1. 경제사이클
    economic: {
      signal: main_economic_sig,
      gdp: {
        signal: sub_gdp_sig,
        world_gdp: {
          imf: w_gdp_imf,
          oecd: w_gdp_oecd,
        },
        us_gdp: {
          signal: sub_gdp_sig,
          imf: us_gdp_imf,
          gdp_q: us_gdp_q,
          pce_q: us_pce_q,
          gpdi_q: us_gpdi_q,
          pnfi_q: us_pnfi_q,
          prfi_q: us_prfi_q,
          exp_q: us_exp_q,
          imp_q: us_imp_q,
          gov_q: us_gov_q,
          prod_q: us_prod_q,
          oecd: us_gdp_oecd,
          gdpnow: { data: gdpnow, signal: gdpnow_sig },
        },
        kr_gdp: {
          imf: kr_gdp_imf,
          inv: kr_inv_imf,
          cpi: kr_cpi_imf,
          bal: kr_bal_imf,
          debt: kr_debt_imf,
          ca: kr_ca_imf,
          oecd: kr_gdp_oecd,
        },
        cn_gdp: {
          imf: cn_gdp_imf,
          inv: cn_inv_imf,
          cpi: cn_cpi_imf,
          bal: cn_bal_imf,
          debt: cn_debt_imf,
          ca: cn_ca_imf,
          oecd: cn_gdp_oecd,
        },
      },
      consumption: {
        signal: sub_cons_sig,
        ic4wsa: { data: ic4wsa, signal: ic4wsa_sig },
        jtsjol: { data: jtsjol, signal: jtsjol_sig },
        payems: { data: payems, signal: payems_sig },
        unrate: { data: unrate, signal: unrate_sig },
        totalsl: { data: totalsl, signal: totalsl_sig },
        rsafs: { data: rsafs, signal: rsafs_sig },
        pce: { data: pce, signal: pce_sig },
      },
      production: {
        signal: sub_prod_sig,
        indpro: { data: indpro, signal: indpro_sig },
        tcu: { data: tcu, signal: tcu_sig },
        dgorder: { data: dgorder, signal: dgorder_sig },
      },
    },

    // 2. 경기조절자
    regulator: {
      signal: main_regulator_sig,
      rates: {
        signal: sub_interest_sig,
        dfedtaru: { data: dfedtaru, signal: dfedtaru_sig },
        irx: { data: irx, signal: irx_sig },
        tnx: { data: tnx, signal: tnx_sig },
        tyx: { data: tyx, signal: tyx_sig },
        t10y2y: { data: t10y2y },
        t10y3m: { data: t10y3m },
      },
      liquidity: {
        signal: sub_liq_sig,
        treast: { data: treast, signal: treast_sig },
        mbs: { data: mbs, signal: mbs_sig },
        wcurcir: { data: wcurcir, signal: wcurcir_sig },
        rrpontsyd: { data: rrpontsyd, signal: rrpontsyd_sig },
        rrpontsyaward: { data: rrpontsyaward },
        sofr: { data: sofr },
        wtregen: { data: wtregen, signal: wtregen_sig },
        wrbwfrbl: { data: wrbwfrbl, signal: wrbwfrbl_sig },
        mtsds: { data: mtsds, signal: mtsds_sig },
      },
      prices: {
        signal: sub_price_sig,
        cpiaucsl: { data: cpiaucsl, signal: cpiaucsl_sig },
        cpilfesl: { data: cpilfesl, signal: cpilfesl_sig },
        pcepi: { data: pcepi, signal: pcepi_sig },
        pcepilfe: { data: pcepilfe, signal: pcepilfe_sig },
        ppifis: { data: ppifis, signal: ppifis_sig },
        wpsfd: { data: wpsfd, signal: wpsfd_sig },
      },
    },

    // 3. 리스크에 대한 태도
    risk_attitude: {
      signal: main_risk_attitude_sig,
      risk: {
        signal: sub_risk_sig,
        fear_greed: { data: fgSorted, signal: fg_sig },
        vix: { data: vix, signal: vix_sig },
      },
      currency: {
        signal: sub_curr_sig,
        dxy: { data: dxy, signal: dxy_sig },
        t10y3m: { data: t10y3m_currency },
        eurusd: { data: eurusd, signal: eurusd_sig },
        usdjpy: { data: usdjpy, signal: usdjpy_sig },
        usdchn: { data: usdchn, signal: usdchn_sig },
        usdkrw: { data: usdkrw, signal: usdkrw_sig },
        usdtwd: { data: usdtwd, signal: usdtwd_sig },
      },
      commodities: {
        signal: sub_comm_sig,
        gold: { data: gold_fut, signal: gold_fut_sig },
        wti: { data: wti_fut, signal: wti_fut_sig },
        copper: { data: copper_fut, signal: copper_fut_sig },
        wheat: { data: wheat_fut, signal: wheat_fut_sig },
        corn: { data: corn_fut, signal: corn_fut_sig },
      },
    },

    // 4. 마켓사이클
    market: {
      signal: main_market_sig,
      stocks: {
        signal: sub_stock_sig,
        spx: { data: spx, signal: spx_sig },
        ixic: { data: ixic, signal: ixic_sig },
        rut: { data: rut, signal: rut_sig },
        stoxx: { data: stoxx, signal: stoxx_sig },
        n225: { data: n225, signal: n225_sig },
        kospi: { data: kospi, signal: kospi_sig },
        ssec: { data: ssec, signal: ssec_sig },
        hsi: { data: hsi, signal: hsi_sig },
      },
      credit: {
        signal: sub_credit_sig,
        baa10y: { data: baa10y, signal: baa10y_sig },
        hy: { data: hy, signal: hy_sig },
        cp: { data: cp, signal: cp_sig },
        m2: { data: m2, signal: m2_sig },
      },
      real_estate: {
        signal: sub_real_estate_sig,
        ttlcons: { data: ttlcons, signal: ttlcons_sig },
        permit: { data: permit, signal: permit_sig },
        houst: { data: houst, signal: houst_sig },
        exhos: { data: exhos, signal: exhos_sig },
        hsn1f: { data: hsn1f, signal: hsn1f_sig },
        spcs: { data: spcs, signal: spcs_sig },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Global Macro 모니터링
            </h1>
            <p className="mt-3 text-lg text-white/50 max-w-3xl">
              글로벌 경제사이클, 경기조절자(금리/물가/유동성), 리스크 온/오프 상태 및 마켓사이클 신호를 실시간 모니터링합니다.
            </p>
          </div>

          <MacroClientPage data={dashboardData} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
