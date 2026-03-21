import { PropertyData, PropertyCategory } from '../types';

export interface PropertiesApiResponse {
  property: Record<string, string>;
}

// Property ID ranges and patterns for categorization
const VILLAGE_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// Multi-language keywords for categorization
const KEYWORDS_BY_LOCALE = {
  pt: {
    clans: [
      'uchiha', 'senju', 'hyuga', 'hyūga', 'nara', 'yamanaka', 'akimichi',
      'uzumaki', 'otsutsuki', 'sarutobi', 'inuzuka', 'aburame', 'kurama'
    ],
    organizations: [
      'akatsuki', 'anbu', 'aliança', 'alliance', 'força', 'force',
      'sete', 'espada', 'ninjas', 'mercenários'
    ],
    rank: [
      'kage', 'academia', 'estudante', 'genin', 'chunin', 'jounin',
      'elite', 'sannin', 'jonin'
    ],
    special: [
      'jinchuuriki', 'jinchuriki', 'kekkei genkai', 'rinnegan', 'senjutsu',
      'marca da maldição', 'maldição', 'reanimaç', 'edo tensei',
      'curse', 'reanimation', 'sharingan', 'byakugan', 'mangekyou',
      'eterno', 'eternal', 'ms', 'ems'
    ],
    gender: ['homem', 'mulher', 'fêmea', 'macho', 'sexo', 'masculino', 'feminino'],
    elements: [
      'atributo de fogo', 'atributo de vento', 'atributo de trovão',
      'atributo de água', 'atributo de terra'
    ],
  },
  zh: {
    clans: [
      '宇智波', '千手', '日向', '奈良', '山中', '秋道',
      '漩涡', '大筒木', '猿飞', '犬冢', '油女', '涡丸'
    ],
    organizations: [
      '晓', '暗部', '联盟', '力量', '七', '剑',
      '忍者', '佣兵', '音', '火之意志'
    ],
    rank: [
      '影', '忍者学校', '学生', '下忍', '中忍', '上忍',
      '精英', '三忍', '特别上忍'
    ],
    special: [
      '人柱力', '血继限界', '轮回眼', '仙术', '写轮眼', '白眼',
      '万花筒', '永恒', '诅咒', '秽土转生', '伊邪那岐', '伊邪那美',
      '须佐能乎', '神威', '天照'
    ],
    gender: ['男性', '女性', '男', '女', '性别'],
    elements: [
      '火属性', '风属性', '雷属性', '水属性', '土属性'
    ],
  },
  en: {
    clans: [
      'uchiha', 'senju', 'hyuga', 'nara', 'yamanaka', 'akimichi',
      'uzumaki', 'otsutsuki', 'sarutobi', 'inuzuka', 'aburame'
    ],
    organizations: [
      'akatsuki', 'anbu', 'alliance', 'force', 'seven', 'swordsmen', 'sound'
    ],
    rank: [
      'kage', 'academy', 'student', 'genin', 'chunin', 'jonin',
      'elite', 'sannin'
    ],
    special: [
      'jinchuriki', 'kekkei genkai', 'rinnegan', 'sage mode',
      'curse mark', 'reanimation', 'edo tensei', 'sharingan',
      'byakugan', 'mangekyou', 'eternal'
    ],
    gender: ['male', 'female', 'man', 'woman', 'gender', 'sex'],
    elements: [
      'fire attribute', 'wind attribute', 'lightning attribute',
      'water attribute', 'earth attribute'
    ],
  },
  de: {
    clans: [
      'uchiha', 'senju', 'hyuga', 'nara', 'yamanaka', 'akimichi',
      'uzumaki', 'otsutsuki'
    ],
    organizations: ['akatsuki', 'anbu', 'allianz', 'bündnis'],
    rank: ['kage', 'akademie', 'genin', 'chunin', 'jonin', 'elite'],
    special: [
      'jinchuriki', 'kekkei genkai', 'rinnegan', 'senjutsu',
      'fluch', 'reanimation', 'edo tensei'
    ],
    gender: ['männlich', 'weiblich', 'mann', 'frau', 'geschlecht'],
    elements: [
      'feuer attribut', 'wind attribut', 'blitz attribut',
      'wasser attribut', 'erde attribut'
    ],
  },
};

function categorizeProperty(id: string, name: string, locale: string = 'pt'): PropertyCategory {
  const lowerName = name.toLowerCase();

  // Get keywords for locale, fallback to English if locale not found
  const keywords = KEYWORDS_BY_LOCALE[locale as keyof typeof KEYWORDS_BY_LOCALE] || KEYWORDS_BY_LOCALE.en;

  // Skip gender and element attributes (not filters we want)
  if (keywords.gender.some(k => lowerName.includes(k.toLowerCase())) ||
      keywords.elements.some(k => lowerName.includes(k.toLowerCase()))) {
    return 'other';
  }

  // Check by ID first for villages (this works regardless of locale)
  if (VILLAGE_IDS.includes(id)) {
    return 'villages';
  }

  // Check by keywords for each category
  if (keywords.clans.some(k => lowerName.includes(k.toLowerCase()))) {
    return 'clans';
  }

  if (keywords.organizations.some(k => lowerName.includes(k.toLowerCase()))) {
    return 'organizations';
  }

  if (keywords.rank.some(k => lowerName.includes(k.toLowerCase()))) {
    return 'rank';
  }

  if (keywords.special.some(k => lowerName.includes(k.toLowerCase()))) {
    return 'special';
  }

  // Default to other
  return 'other';
}

export async function fetchProperties(locale: string = 'pt'): Promise<PropertyData[]> {
  const apiUrl = `http://tazwanted-naruto.server.live:1040/v1/ninjas/properties?lang=${locale}`;

  try {
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 86400, tags: ['properties', `properties-${locale}`] }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: PropertiesApiResponse = await res.json();

    return Object.entries(data.property).map(([id, name]) => ({
      id,
      name,
      iconUrl: `/api/images/properties/${id}.png`,
      category: categorizeProperty(id, name, locale)
    }));
  } catch (error) {
    return [];
  }
}

export function getPropertyIconUrl(propertyId: string): string {
  return `/api/images/properties/${propertyId}.png`;
}

// Get properties by category
export function getPropertiesByCategory(
  properties: PropertyData[],
  category: PropertyCategory
): PropertyData[] {
  return properties.filter(p => p.category === category);
}

// Property category metadata
export interface PropertyCategoryInfo {
  key: PropertyCategory;
  translationKey: string;
  icon: string;
  description: string;
}

export const PROPERTY_CATEGORIES: PropertyCategoryInfo[] = [
  {
    key: 'villages',
    translationKey: 'villages',
    icon: 'solar:home-smile-linear',
    description: 'Aldeias e vilas ninjas'
  },
  {
    key: 'clans',
    translationKey: 'clans',
    icon: 'solar:users-group-rounded-linear',
    description: 'Clãs e linhagens sanguíneas'
  },
  {
    key: 'organizations',
    translationKey: 'organizations',
    icon: 'solar:shield-check-linear',
    description: 'Organizações e grupos'
  },
  {
    key: 'rank',
    translationKey: 'rank',
    icon: 'solar:medal-ribbons-star-linear',
    description: 'Classificação ninja'
  },
  {
    key: 'special',
    translationKey: 'special',
    icon: 'solar:star-angle-linear',
    description: 'Habilidades especiais e poderes únicos'
  },
  {
    key: 'other',
    translationKey: 'other',
    icon: 'solar:notes-linear',
    description: 'Outras características'
  }
];
