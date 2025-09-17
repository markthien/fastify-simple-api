const fp = require('fastify-plugin');
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache responses for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

const newsService = async (fastify, options) => {
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const API_URL = 'https://gnews.io/api/v4';

  const fetchFromGNews = async (endpoint, params) => {
    // Create a unique key for caching based on the request
    const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
    console.log('cacheKey', cacheKey);
    if (cache.has(cacheKey)) {
      fastify.log.info(`Returning cached data for key: ${cacheKey}`);
      return cache.get(cacheKey);
    }

    try {
      fastify.log.info(`Fetching fresh data for key: ${cacheKey}`);
      console.log('params111');
      const requestParams = { ...params, apikey: GNEWS_API_KEY, lang: 'en' };
      console.log('params', params);
      const response = await axios.get(`${API_URL}/${endpoint}`, {
        params: requestParams
      });

      const articles = response.data.articles;
      cache.set(cacheKey, articles); // Store the result in the cache
      return articles;
    } catch (error) {
      fastify.log.error(error);
      console.log('error.response.data', error.response.data);
      throw new Error('Failed to fetch news from GNews API.');
    }
  };

  const service = {
    getTopHeadlines: () => fetchFromGNews('top-headlines'),
    searchByKeyword: (keyword) => fetchFromGNews('search', { q: keyword, in: 'title,description,content' }),
    //searchByTitle: (title) => fetchFromGNews('search', { q: title, in: 'title' }), // Api not working
    searchArticle: async ({ title, author }) => {
      // GNews Api doesn't support find by author so need to iterate thru the result to find the author
      const articles = await service.getTopHeadlines();
      return articles.find(article =>
        (title && article.title.toLowerCase() === title.toLowerCase()) ||
        (author && article.source.name.toLowerCase() === author.toLowerCase())
      );
    }    
  };

  // Decorate the Fastify instance with our service
  fastify.decorate('newsService', service);
}

module.exports = fp(newsService);