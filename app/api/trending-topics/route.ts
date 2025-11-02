// app/api/trending-topics/route.ts
import { NextResponse } from 'next/server';

// Define types
interface Article {
  title: string;
  description?: string;
  publishedAt?: string;
  url?: string;
  source?: unknown;
}

interface TopicData {
  topic: string;
  category: string;
  count: number;
  articles: Article[];
  latestDate: Date;
}

interface ProcessedTopic {
  topic: string;
  category: string;
  change: string;
  score: number;
  count: number;
  articles: Article[];
}

// In-memory cache (simple solution)
const cache: {
  data: ProcessedTopic[] | null;
  timestamp: number | null;
} = {
  data: null,
  timestamp: null
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const LEGAL_KEYWORDS = [
  'supreme court', 'high court', 'law', 'legal', 'legislation',
  'amendment', 'act', 'judgment', 'verdict', 'constitutional',
  'parliament', 'bill', 'ordinance', 'regulation', 'compliance',
  'litigation', 'tribunal', 'advocate', 'lawyer', 'judicial'
];

function isLegalArticle(article: Article): boolean {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  return LEGAL_KEYWORDS.some((keyword: string) => text.includes(keyword));
}

function extractLegalTopics(articles: Article[]): ProcessedTopic[] {
  const topicMap = new Map<string, TopicData>();
  
  articles.forEach((article: Article) => {
    if (!isLegalArticle(article)) return;
    
    const title = article.title || '';
    const description = article.description || '';
    const text = `${title} ${description}`.toLowerCase();
    
    let mainTopic = 'General Legal News';
    let category = 'General';
    
    if (text.includes('supreme court')) {
      mainTopic = 'Supreme Court Developments';
      category = 'Constitutional Law';
    } else if (text.includes('high court')) {
      mainTopic = 'High Court Rulings';
      category = 'Judicial';
    } else if (text.includes('gst') || text.includes('tax')) {
      mainTopic = 'GST & Taxation Updates';
      category = 'Tax Law';
    } else if (text.includes('data') && text.includes('privacy')) {
      mainTopic = 'Data Privacy & Protection';
      category = 'Privacy Law';
    } else if (text.includes('labour') || text.includes('labor')) {
      mainTopic = 'Labour Law Reforms';
      category = 'Labour Law';
    } else if (text.includes('environment')) {
      mainTopic = 'Environmental Regulations';
      category = 'Environmental Law';
    } else if (text.includes('cryptocurrency') || text.includes('crypto')) {
      mainTopic = 'Cryptocurrency Regulation';
      category = 'Finance Law';
    } else if (text.includes('consumer')) {
      mainTopic = 'Consumer Protection Laws';
      category = 'Consumer Law';
    } else if (text.includes('real estate') || text.includes('rera')) {
      mainTopic = 'Real Estate & RERA';
      category = 'Property Law';
    } else if (text.includes('ipc') || text.includes('criminal')) {
      mainTopic = 'Criminal Law Updates';
      category = 'Criminal Law';
    }
    
    if (!topicMap.has(mainTopic)) {
      topicMap.set(mainTopic, {
        topic: mainTopic,
        category: category,
        count: 0,
        articles: [],
        latestDate: new Date(article.publishedAt || Date.now())
      });
    }
    
    const topicData = topicMap.get(mainTopic)!;
    topicData.count++;
    topicData.articles.push(article);
    
    const articleDate = new Date(article.publishedAt || Date.now());
    if (articleDate > topicData.latestDate) {
      topicData.latestDate = articleDate;
    }
  });
  
  const topics: ProcessedTopic[] = Array.from(topicMap.values()).map((topic: TopicData) => {
    const hoursSinceLatest = (Date.now() - topic.latestDate.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - hoursSinceLatest * 2);
    const frequencyScore = Math.min(100, topic.count * 10);
    const score = (recencyScore * 0.6 + frequencyScore * 0.4);
    
    return {
      topic: topic.topic,
      category: topic.category,
      change: `${(score / 10).toFixed(1)}%`,
      score: score,
      count: topic.count,
      articles: topic.articles.slice(0, 3)
    };
  });
  
  return topics.sort((a: ProcessedTopic, b: ProcessedTopic) => b.score - a.score).slice(0, 10);
}

async function fetchFromNewsAPI(query: string): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEWS_API_KEY not found in environment variables');
  }
  
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.articles || [];
}

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fetch fresh data
    const queries = [
      'India law',
      'Supreme Court India',
      'legal India',
      'Indian legislation'
    ];
    
    let allArticles: Article[] = [];
    
    for (const query of queries) {
      try {
        const articles = await fetchFromNewsAPI(query);
        allArticles = [...allArticles, ...articles];
      } catch (error) {
        console.error(`Error fetching query ${query}:`, error);
      }
    }
    
    // Process and extract topics
    const trendingTopics = extractLegalTopics(allArticles);
    
    // Update cache
    cache.data = trendingTopics;
    cache.timestamp = now;
    
    return NextResponse.json({
      success: true,
      data: trendingTopics,
      cached: false,
      totalArticles: allArticles.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    console.error('Error in trending-topics API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending topics',
        message: (error as Error).message
      },
      { status: 500 }
    ); 
  }
}