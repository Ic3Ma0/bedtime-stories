export interface Story {
  id: string;
  title: string;
  tag: string;
  category: StoryCategory;
  minutes: number;
  content: string;
}

export type StoryCategory =
  | "mystery"
  | "romance"
  | "fantasy"
  | "scifi"
  | "warm"
  | "comedy"; // 搞笑喜剧

export interface CategoryInfo {
  key: StoryCategory;
  label: string;
  emoji: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: "mystery",
    label: "轻悬疑",
    emoji: "🌑",
    description: "悬念迭起，反转结局",
  },
  {
    key: "romance",
    label: "浪漫爱情",
    emoji: "💕",
    description: "甜蜜温柔，心动瞬间",
  },
  {
    key: "fantasy",
    label: "奇幻冒险",
    emoji: "🧚",
    description: "魔法世界，奇妙旅程",
  },
  {
    key: "scifi",
    label: "科幻脑洞",
    emoji: "🚀",
    description: "未来时空，科技哲思",
  },
  {
    key: "warm",
    label: "温馨治愈",
    emoji: "🕯️",
    description: "温暖人心，抚平疲惫",
  },
  {
    key: "comedy",
    label: "搞笑喜剧",
    emoji: "😂",
    description: "笑着笑着就睡着了",
  },
];
