const routes = async (fastify, options) => {
  // Route to get N news articles
  fastify.get('/', async (request, reply) => {
    try {
      const articles = await fastify.newsService.getTopHeadlines();
      reply.send(articles);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Route to search for articles by a keyword
  fastify.get('/search', async (request, reply) => {
    try {
      const { keyword } = request.query;
      if (!keyword) {
        return reply.code(400).send({ error: 'The "keyword" query parameter is required.' });
      }
      const articles = await fastify.newsService.searchByKeyword(keyword);
      reply.send(articles);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Route to find a specific article by title or author
  fastify.get('/find', async (request, reply) => {
    try {
      const { title, author } = request.query;
      if (!title && !author) {
        return reply.code(400).send({ error: 'Either title or author query parameter is required.' });
      }    

      const article = await fastify.newsService.searchArticle({ title, author });

      if (article) {
        reply.send(article);
      } else {
        reply.code(404).send({ message: 'Article not found!' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = routes;