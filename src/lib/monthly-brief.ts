import fs from 'fs';
import path from 'path';

export interface MonthlyBriefData {
  title: string;
  edition: string;
  published_date: string;
  headline: string;
  sections: {
    macro: string;
    liquidity: string;
    momentum: string;
    strategy: string;
  };
}

/**
 * 월간 시황 마크다운 파일(monitors/monthly-brief.md)을 읽어와 파싱합니다.
 */
export function getMonthlyBrief(): MonthlyBriefData {
  // 프로젝트 내부의 src/content/monthly-brief.md 또는 monitors/monthly-brief.md 읽기
  const primaryPath = path.join(process.cwd(), 'src', 'content', 'monthly-brief.md');
  const monitorPath = path.join(process.cwd(), '..', 'monitors', 'monthly-brief.md');

  let fileContent = '';
  try {
    if (fs.existsSync(monitorPath)) {
      fileContent = fs.readFileSync(monitorPath, 'utf-8');
    } else if (fs.existsSync(primaryPath)) {
      fileContent = fs.readFileSync(primaryPath, 'utf-8');
    }
  } catch (err) {
    console.warn('Could not read external monthly-brief.md, using default fallback.', err);
  }

  // 기본 폴백 데이터
  const fallbackData: MonthlyBriefData = {
    title: '당신의 피비 월간 자산배분 브리프',
    edition: '2026년 9월호',
    published_date: '2026.09.05',
    headline: '견고한 실물 경기 속 에너지 섹터 중심의 공세적 자산배분 전략',
    sections: {
      macro: '미국 애틀랜타 연은의 GDPNow 실질 GDP 성장률 추정치가 견조한 소비 지출에 힘입어 양호한 흐름을 지속하고 있습니다. OECD 경기선행지수(CLI) 역시 기준선(100)을 상회하는 확장 국면을 유지하고 있어, 글로벌 경제의 연착륙(Soft-landing) 가능성이 한층 더 공고해졌습니다.',
      liquidity: '미 연준의 통화정책 완화 기조 속에서 미국 10년물 국채금리가 안정적인 박스권을 형성하고 있으며, 역레포(RRP) 잔고 및 지급준비금 등 시장 유동성 완충력도 안정적입니다. CNN 공포·탐욕 지수는 탐욕 구간에 위치하여 시장의 투자 심리가 활발합니다.',
      momentum: '글로벌 증시는 실적 모멘텀이 뒷받침되는 빅테크 및 실물 수혜 섹터를 중심으로 차별화 장세가 전개되고 있습니다. 특히 에너지(XLE) 섹터의 20주 이평선 대비 이격도가 가장 강력한 상승 추세를 기록하고 있으며, M7 테크(MAGS) 역시 시장 주도력을 유지하고 있습니다.',
      strategy: '9월 당신의 피비 모델 포트폴리오는 강력한 실적 모멘텀을 겸비한 에너지 섹터(XLE)에 50%를 집중 배분하는 공세적 전략을 유지합니다. 동시에 빅테크(MAGS) 20%를 성장 엔진으로 편입하고, VIX 선물 레버리지(UVXY) 20%와 현금 10%의 이중 안전 방패를 구축하여 수익성과 하방 방어력을 극대화했습니다.',
    },
  };

  if (!fileContent) {
    return fallbackData;
  }

  try {
    const lines = fileContent.split('\n');
    let title = fallbackData.title;
    let edition = fallbackData.edition;
    let published_date = fallbackData.published_date;
    let headline = fallbackData.headline;

    let inFrontmatter = false;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') {
        if (!inFrontmatter && i === 0) {
          inFrontmatter = true;
          continue;
        } else if (inFrontmatter) {
          inFrontmatter = false;
          continue;
        }
      }

      if (inFrontmatter) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
          const key = line.slice(0, colonIdx).trim();
          const val = line.slice(colonIdx + 1).trim();
          if (key === 'title') title = val;
          if (key === 'edition') edition = val;
          if (key === 'published_date') published_date = val;
          if (key === 'headline') headline = val;
        }
      } else {
        contentLines.push(lines[i]);
      }
    }

    // 섹션 분리 (# 1. ..., # 2. ..., # 3. ..., # 4. ...)
    const fullBody = contentLines.join('\n');
    const extractSection = (secNum: number): string => {
      const regex = new RegExp(`(?:#+\\s*${secNum}\\.[^\\n]*\\n)([\\s\\S]*?)(?=(?:#+\\s*\\d+\\.)|$)`, 'i');
      const match = fullBody.match(regex);
      return match ? match[1].trim() : '';
    };

    const macro = extractSection(1) || fallbackData.sections.macro;
    const liquidity = extractSection(2) || fallbackData.sections.liquidity;
    const momentum = extractSection(3) || fallbackData.sections.momentum;
    const strategy = extractSection(4) || fallbackData.sections.strategy;

    return {
      title,
      edition,
      published_date,
      headline,
      sections: {
        macro,
        liquidity,
        momentum,
        strategy,
      },
    };
  } catch (e) {
    console.error('Failed to parse monthly-brief.md:', e);
    return fallbackData;
  }
}
