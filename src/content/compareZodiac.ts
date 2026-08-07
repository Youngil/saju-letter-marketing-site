import type { MarketingLanguage } from '@/lib/languages';

/**
 * compare 페이지 전용 정적 콘텐츠 — content-posts(MDX)와 달리 표 형태 구조화 데이터라
 * 별도 TS 데이터 파일로 둔다(backend의 angleBank.ts/toneBank.ts와 같은 "콘텐츠 뱅크" 위치).
 * 6개 언어 전부(pt/vi 포함) 데이터를 채워둔다 — 실제로 compare 페이지가 여는 언어는
 * languages.ts의 LAUNCH_CONTENT_LANGUAGES(1차 출시: ko/en/ja/es)뿐이지만, pt/vi도 이미
 * 번역해뒀으니 나중에 그 배열에 추가하기만 하면 바로 열린다 — 이 파일을 다시 건드릴 필요가 없다.
 */
export interface ZodiacRow {
  sign: string;
  /** 월/일 숫자 표기(MM/DD–MM/DD)로 통일해 언어별 월 이름 번역 없이도 바로 이해할 수 있게 했다. */
  dateRange: string;
}

export const ZODIAC_ROWS: Record<MarketingLanguage, ZodiacRow[]> = {
  ko: [
    { sign: '양자리', dateRange: '3/21–4/19' },
    { sign: '황소자리', dateRange: '4/20–5/20' },
    { sign: '쌍둥이자리', dateRange: '5/21–6/20' },
    { sign: '게자리', dateRange: '6/21–7/22' },
    { sign: '사자자리', dateRange: '7/23–8/22' },
    { sign: '처녀자리', dateRange: '8/23–9/22' },
    { sign: '천칭자리', dateRange: '9/23–10/22' },
    { sign: '전갈자리', dateRange: '10/23–11/21' },
    { sign: '사수자리', dateRange: '11/22–12/21' },
    { sign: '염소자리', dateRange: '12/22–1/19' },
    { sign: '물병자리', dateRange: '1/20–2/18' },
    { sign: '물고기자리', dateRange: '2/19–3/20' },
  ],
  en: [
    { sign: 'Aries', dateRange: '3/21–4/19' },
    { sign: 'Taurus', dateRange: '4/20–5/20' },
    { sign: 'Gemini', dateRange: '5/21–6/20' },
    { sign: 'Cancer', dateRange: '6/21–7/22' },
    { sign: 'Leo', dateRange: '7/23–8/22' },
    { sign: 'Virgo', dateRange: '8/23–9/22' },
    { sign: 'Libra', dateRange: '9/23–10/22' },
    { sign: 'Scorpio', dateRange: '10/23–11/21' },
    { sign: 'Sagittarius', dateRange: '11/22–12/21' },
    { sign: 'Capricorn', dateRange: '12/22–1/19' },
    { sign: 'Aquarius', dateRange: '1/20–2/18' },
    { sign: 'Pisces', dateRange: '2/19–3/20' },
  ],
  es: [
    { sign: 'Aries', dateRange: '21/3–19/4' },
    { sign: 'Tauro', dateRange: '20/4–20/5' },
    { sign: 'Géminis', dateRange: '21/5–20/6' },
    { sign: 'Cáncer', dateRange: '21/6–22/7' },
    { sign: 'Leo', dateRange: '23/7–22/8' },
    { sign: 'Virgo', dateRange: '23/8–22/9' },
    { sign: 'Libra', dateRange: '23/9–22/10' },
    { sign: 'Escorpio', dateRange: '23/10–21/11' },
    { sign: 'Sagitario', dateRange: '22/11–21/12' },
    { sign: 'Capricornio', dateRange: '22/12–19/1' },
    { sign: 'Acuario', dateRange: '20/1–18/2' },
    { sign: 'Piscis', dateRange: '19/2–20/3' },
  ],
  pt: [
    { sign: 'Áries', dateRange: '21/3–19/4' },
    { sign: 'Touro', dateRange: '20/4–20/5' },
    { sign: 'Gêmeos', dateRange: '21/5–20/6' },
    { sign: 'Câncer', dateRange: '21/6–22/7' },
    { sign: 'Leão', dateRange: '23/7–22/8' },
    { sign: 'Virgem', dateRange: '23/8–22/9' },
    { sign: 'Libra', dateRange: '23/9–22/10' },
    { sign: 'Escorpião', dateRange: '23/10–21/11' },
    { sign: 'Sagitário', dateRange: '22/11–21/12' },
    { sign: 'Capricórnio', dateRange: '22/12–19/1' },
    { sign: 'Aquário', dateRange: '20/1–18/2' },
    { sign: 'Peixes', dateRange: '19/2–20/3' },
  ],
  ja: [
    { sign: '牡羊座', dateRange: '3/21–4/19' },
    { sign: '牡牛座', dateRange: '4/20–5/20' },
    { sign: '双子座', dateRange: '5/21–6/20' },
    { sign: '蟹座', dateRange: '6/21–7/22' },
    { sign: '獅子座', dateRange: '7/23–8/22' },
    { sign: '乙女座', dateRange: '8/23–9/22' },
    { sign: '天秤座', dateRange: '9/23–10/22' },
    { sign: '蠍座', dateRange: '10/23–11/21' },
    { sign: '射手座', dateRange: '11/22–12/21' },
    { sign: '山羊座', dateRange: '12/22–1/19' },
    { sign: '水瓶座', dateRange: '1/20–2/18' },
    { sign: '魚座', dateRange: '2/19–3/20' },
  ],
  vi: [
    { sign: 'Bạch Dương', dateRange: '21/3–19/4' },
    { sign: 'Kim Ngưu', dateRange: '20/4–20/5' },
    { sign: 'Song Tử', dateRange: '21/5–20/6' },
    { sign: 'Cự Giải', dateRange: '21/6–22/7' },
    { sign: 'Sư Tử', dateRange: '23/7–22/8' },
    { sign: 'Xử Nữ', dateRange: '23/8–22/9' },
    { sign: 'Thiên Bình', dateRange: '23/9–22/10' },
    { sign: 'Bọ Cạp', dateRange: '23/10–21/11' },
    { sign: 'Nhân Mã', dateRange: '22/11–21/12' },
    { sign: 'Ma Kết', dateRange: '22/12–19/1' },
    { sign: 'Bảo Bình', dateRange: '20/1–18/2' },
    { sign: 'Song Ngư', dateRange: '19/2–20/3' },
  ],
};

/**
 * 사주의 일간(日干, day master)은 10개 값이 10일 주기로 순환한다 — 태어난 '달'로 정해지는
 * 서양 별자리 12개와 축 자체가 다르다(달이 아니라 정확한 날짜). 그래서 별자리처럼 12행을
 * 1:1로 매칭하는 표를 만들지 않고, 별도로 10개 값만 나열한다. 로마자 표기라 언어별로 다르게
 * 옮길 대상이 아니라 전 언어 공통으로 하나만 둔다(Seollal처럼 고유명사 취급).
 */
export const DAY_MASTER_ROMANIZATIONS = ['Gap', 'Eul', 'Byeong', 'Jeong', 'Mu', 'Gi', 'Gyeong', 'Sin', 'Im', 'Gye'];
