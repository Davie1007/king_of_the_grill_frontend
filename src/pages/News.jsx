import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Pagination,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NewsPage() {
  const [query, setQuery] = useState('meat OR butchery OR fuel OR gas');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.kingofthegrill.co.ke/api/news?q=${encodeURIComponent(query)}&page=${page}`);
        if (!res.ok) {
        const text = await res.text();
        console.error('Non-JSON response', text);
        setArticles([]);
        return;
        }
        const data = await res.json();
        setArticles(data.articles || []);
        setTotalPages(Math.ceil((data.totalResults || 0) / 20));
      } catch (err) {
        console.error(err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [query, page]);

  const relatedTopics = [
    'Beef prices',
    'LPG Kenya',
    'Fuel shortage',
    'Slaughterhouses',
    'Energy policy'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Back to Dashboard */}
      <Button
        variant="contained"
        component={Link}
        to="/owner_dashboard"
        sx={{
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg,#4cafef,#1976d2)',
          color: 'white'
        }}
      >
        ← Back to Dashboard
      </Button>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Kenya Meat & Energy News
      </Typography>

      {/* Search box */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search news (e.g. beef prices, LPG Kenya...)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 3, backgroundColor: 'white', borderRadius: 2 }}
      />

      {/* Related topics */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {relatedTopics.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            onClick={() => {
              setQuery(topic);
              setPage(1);
            }}
            sx={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer'
            }}
          />
        ))}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Primary content grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
          gap: 2
        }}
      >
        {articles.map((article, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt=""
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {article.title}
              </Typography>
              <Typography variant="body2" sx={{ flexGrow: 1, my: 1 }}>
                {article.description}
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main', mt: 'auto' }}
              >
                Read more →
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 2,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)'
            }
          }}
        />
      </Box>
    </Box>
  );
}
